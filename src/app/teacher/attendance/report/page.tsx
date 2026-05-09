'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type AttendanceRecord = {
  _id: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  date: string;
  studentId: { _id: string; name: string; email: string };
  sessionId?: { _id: string; title: string; scheduledAt: string; status?: string };
};

function AttendanceReportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>(searchParams.get('classId') || '');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, startDate, endDate]);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []);
        if (!selectedClass && data.classes?.[0]?._id) {
          setSelectedClass(data.classes[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchReport = async () => {
    if (!selectedClass) {
      setRecords([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.set('classId', selectedClass);
      if (startDate) query.set('startDate', startDate);
      if (endDate) query.set('endDate', endDate);

      const response = await fetch(`/api/attendance?${query.toString()}`);
      const data = await response.json();
      setRecords(data.attendance || []);
    } catch (error) {
      console.error('Error fetching attendance report:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = () => {
    if (!records || records.length === 0) {
      alert('No records to export');
      return;
    }
    const rows = records.map(r => ({
      student: r.studentId?.name || '',
      email: r.studentId?.email || '',
      date: r.date ? new Date(r.date).toLocaleString() : '',
      status: r.status,
      session: r.sessionId?.title || '',
    }));
    const header = Object.keys(rows[0]).join(',');
    const csv = [header, ...rows.map(r => Object.values(r).map(v => '"' + String(v).replace(/"/g, '""') + '"').join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${selectedClass || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printPdf = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const html = `
      <html>
        <head><title>Attendance Report</title></head>
        <body>
          <h1>Attendance Report</h1>
          <table border="1" cellpadding="5" cellspacing="0">
            <thead><tr><th>Student</th><th>Email</th><th>Date</th><th>Status</th><th>Session</th></tr></thead>
            <tbody>
              ${records.map(r => `<tr><td>${r.studentId?.name||''}</td><td>${r.studentId?.email||''}</td><td>${r.date? new Date(r.date).toLocaleString():''}</td><td>${r.status}</td><td>${r.sessionId?.title||''}</td></tr>`).join('')}
            </tbody>
          </table>
        </body>
      </html>`;
    w.document.write(html);
    w.document.close();
    w.print();
  };

  const summary = useMemo(() => {
    const total = records.length;
    const present = records.filter((record) => record.status === 'present').length;
    const absent = records.filter((record) => record.status === 'absent').length;
    const late = records.filter((record) => record.status === 'late').length;
    const excused = records.filter((record) => record.status === 'excused').length;
    const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

    const byStudent = records.reduce<Record<string, { name: string; email: string; present: number; total: number }>>((accumulator, record) => {
      const studentId = record.studentId?._id || 'unknown';
      if (!accumulator[studentId]) {
        accumulator[studentId] = {
          name: record.studentId?.name || 'Unknown',
          email: record.studentId?.email || '',
          present: 0,
          total: 0,
        };
      }
      accumulator[studentId].total += 1;
      if (record.status === 'present') {
        accumulator[studentId].present += 1;
      }
      return accumulator;
    }, {});

    return {
      total,
      present,
      absent,
      late,
      excused,
      attendanceRate,
      byStudent: Object.entries(byStudent).map(([studentId, stats]) => ({
        studentId,
        ...stats,
        rate: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0,
      })),
    };
  }, [records]);

  return (
    <DashboardLayout userRole="teacher" userName="Teacher">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attendance Report</h1>
            <p className="text-gray-600">Review attendance by class and date range.</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/teacher/attendance')}>
            Back to Attendance
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <select
              className="rounded-md border border-input bg-background px-3 py-2"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Select class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>{cls.name}</option>
              ))}
            </select>
            <input
              type="date"
              className="rounded-md border border-input bg-background px-3 py-2"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              className="rounded-md border border-input bg-background px-3 py-2"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <Button
              variant="outline"
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
            >
              Clear Dates
            </Button>
            <div className="flex items-center gap-2">
              <Button onClick={() => exportCsv()} variant="outline">Export CSV</Button>
              <Button onClick={() => printPdf()} variant="outline">Print / PDF</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            ['Total Records', summary.total],
            ['Present', summary.present],
            ['Absent', summary.absent],
            ['Late', summary.late],
            ['Attendance %', `${summary.attendanceRate}%`],
          ].map(([label, value]) => (
            <Card key={String(label)}>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Student Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-gray-600">Loading report...</div>
            ) : summary.byStudent.length === 0 ? (
              <div className="py-8 text-center text-gray-600">No attendance records found for the selected filters.</div>
            ) : (
              <div className="space-y-3">
                {summary.byStudent.map((student) => (
                  <div key={student.studentId} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-semibold text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-600">{student.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{student.present}/{student.total} present</p>
                      <p className="text-sm text-gray-600">{student.rate}% attendance</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Log</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-gray-600">Loading report...</div>
            ) : records.length === 0 ? (
              <div className="py-8 text-center text-gray-600">No attendance records found.</div>
            ) : (
              <div className="space-y-3">
                {records.map((record) => (
                  <div key={record._id} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-semibold text-gray-900">{record.studentId?.name || 'Unknown Student'}</p>
                      <p className="text-sm text-gray-600">{record.sessionId?.title || 'Manual attendance'}</p>
                      <p className="text-xs text-gray-500">
                        {record.date ? new Date(record.date).toLocaleDateString() : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 uppercase">{record.status}</p>
                      <p className="text-sm text-gray-600">{record.sessionId?.scheduledAt ? new Date(record.sessionId.scheduledAt).toLocaleDateString() : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function AttendanceReportPage() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-gray-600">Loading...</div>}>
      <AttendanceReportContent />
    </Suspense>
  );
}