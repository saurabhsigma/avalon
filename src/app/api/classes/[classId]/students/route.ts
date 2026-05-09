import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Class from '@/models/Class';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function getAccess(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;

  if (!token) {
    return { error: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) };
  }

  const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
  return { decoded };
}

async function findManagedClass(classId: string, decoded: { userId: string; role: string }) {
  const classData = await Class.findById(classId).populate('students', 'name email avatar isActive isVerified');

  if (!classData) {
    return { error: NextResponse.json({ error: 'Class not found' }, { status: 404 }) };
  }

  if (decoded.role !== 'admin' && decoded.role !== 'teacher') {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 403 }) };
  }

  if (decoded.role === 'teacher' && classData.teacherId.toString() !== decoded.userId) {
    return { error: NextResponse.json({ error: 'You can only manage your own classes' }, { status: 403 }) };
  }

  return { classData };
}

type RouteContext = {
  params: Promise<{ classId: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const access = await getAccess(req);
    if ('error' in access) {
      return access.error;
    }

    await connectDB();
    const { classId } = await context.params;

    const managed = await findManagedClass(classId, access.decoded);
    if ('error' in managed) {
      return managed.error;
    }

    return NextResponse.json(
      {
        students: managed.classData.students,
        classData: managed.classData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get class students error:', error);
    return NextResponse.json({ error: 'Failed to get class students' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const access = await getAccess(req);
    if ('error' in access) {
      return access.error;
    }

    await connectDB();
    const { classId } = await context.params;

    const managed = await findManagedClass(classId, access.decoded);
    if ('error' in managed) {
      return managed.error;
    }

    const body = await req.json();

    if (Array.isArray(body.bulkStudents) && body.bulkStudents.length > 0) {
      const classData = managed.classData;
      const results = {
        added: [] as Array<{ id: string; name: string; email: string }>,
        skipped: [] as Array<{ identifier: string; reason: string }>,
        created: [] as Array<{ id: string; name: string; email: string }>,
      };

      for (const rawEntry of body.bulkStudents as Array<any>) {
        if (classData.students.length >= classData.maxStudents) {
          results.skipped.push({ identifier: 'bulk', reason: 'Class reached capacity' });
          break;
        }

        const entry = typeof rawEntry === 'string'
          ? { email: rawEntry.trim() }
          : {
              email: String(rawEntry.email || rawEntry.identifier || '').trim(),
              name: String(rawEntry.name || '').trim(),
              password: String(rawEntry.password || '').trim(),
            };

        if (!entry.email) {
          results.skipped.push({ identifier: JSON.stringify(rawEntry), reason: 'Missing email' });
          continue;
        }

        let student = await User.findOne({ email: entry.email.toLowerCase(), role: 'student' });

        if (!student && ['admin', 'teacher'].includes(access.decoded.role) && entry.name && entry.password) {
          const passwordHash = await bcrypt.hash(entry.password, 10);
          student = await User.create({
            name: entry.name,
            email: entry.email.toLowerCase(),
            passwordHash,
            role: 'student',
            isVerified: true,
            isActive: true,
            language: 'en',
            preferences: {
              theme: 'system',
              notifications: true,
              emailAlerts: true,
            },
            points: 0,
            badges: [],
          });

          results.created.push({ id: student._id.toString(), name: student.name, email: student.email });
        }

        if (!student) {
          results.skipped.push({ identifier: entry.email, reason: 'Student not found' });
          continue;
        }

        if (classData.students.some((studentRef: any) => studentRef._id.toString() === student._id.toString())) {
          results.skipped.push({ identifier: entry.email, reason: 'Already in class' });
          continue;
        }

        if (student.classId && student.classId.toString() !== classData._id.toString()) {
          await Class.findByIdAndUpdate(student.classId, { $pull: { students: student._id } });
        }

        student.classId = classData._id;
        await student.save();

        classData.students.push(student._id);
        results.added.push({ id: student._id.toString(), name: student.name, email: student.email });
      }

      await classData.save();

      return NextResponse.json(
        {
          message: 'Bulk student import completed',
          summary: {
            added: results.added.length,
            created: results.created.length,
            skipped: results.skipped.length,
          },
          results,
        },
        { status: 200 }
      );
    }

    const { studentId, email, name, password } = body;
    const lookupQuery: Record<string, string> = {};

    if (studentId) {
      lookupQuery._id = studentId;
    } else if (email) {
      lookupQuery.email = String(email).toLowerCase();
    } else {
      return NextResponse.json({ error: 'Student ID or email is required' }, { status: 400 });
    }

    let student = await User.findOne({ ...lookupQuery, role: 'student' });

    if (!student && email && name && password && ['admin', 'teacher'].includes(access.decoded.role)) {
      const passwordHash = await bcrypt.hash(password, 10);
      student = await User.create({
        name,
        email: String(email).toLowerCase(),
        passwordHash,
        role: 'student',
        isVerified: true,
        isActive: true,
        language: 'en',
        preferences: {
          theme: 'system',
          notifications: true,
          emailAlerts: true,
        },
        points: 0,
        badges: [],
      });
    }

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const classData = managed.classData;
    if (classData.students.some((studentRef: any) => studentRef._id.toString() === student._id.toString())) {
      return NextResponse.json({ error: 'Student is already in this class' }, { status: 409 });
    }

    if (classData.students.length >= classData.maxStudents) {
      return NextResponse.json({ error: 'Class is at capacity' }, { status: 400 });
    }

    if (student.classId && student.classId.toString() !== classData._id.toString()) {
      await Class.findByIdAndUpdate(student.classId, { $pull: { students: student._id } });
    }

    student.classId = classData._id;
    await student.save();

    classData.students.push(student._id);
    await classData.save();

    return NextResponse.json(
      {
        message: 'Student added to class successfully',
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          role: student.role,
          isVerified: student.isVerified,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Add class student error:', error);
    return NextResponse.json({ error: 'Failed to add student to class' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const access = await getAccess(req);
    if ('error' in access) {
      return access.error;
    }

    await connectDB();
    const { classId } = await context.params;

    const managed = await findManagedClass(classId, access.decoded);
    if ('error' in managed) {
      return managed.error;
    }

    const { studentId } = await req.json();
    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    await Class.findByIdAndUpdate(managed.classData._id, { $pull: { students: student._id } });

    if (student.classId?.toString() === managed.classData._id.toString()) {
      student.classId = undefined;
      await student.save();
    }

    return NextResponse.json({ message: 'Student removed from class successfully' }, { status: 200 });
  } catch (error) {
    console.error('Remove class student error:', error);
    return NextResponse.json({ error: 'Failed to remove student from class' }, { status: 500 });
  }
}