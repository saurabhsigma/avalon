# 🎨 Component Architecture

## Complete Component Library & UI Structure

---

## 📦 Component Categories

### 1. UI Components (ShadCN)
### 2. Layout Components
### 3. Teacher Components
### 4. Student Components
### 5. LiveKit Components
### 6. AI Components
### 7. Shared Components
### 8. Chart Components

---

## 1️⃣ UI Components (ShadCN)

Base components from ShadCN UI library

### Button
```typescript
// components/ui/button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

### Card
```typescript
// components/ui/card.tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card = ({ children, className, hoverable }: CardProps) => {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow-sm",
        hoverable && "transition-shadow hover:shadow-md",
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className }: CardProps) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)}>
    {children}
  </div>
);

export const CardTitle = ({ children, className }: CardProps) => (
  <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className }: CardProps) => (
  <p className={cn("text-sm text-muted-foreground", className)}>
    {children}
  </p>
);

export const CardContent = ({ children, className }: CardProps) => (
  <div className={cn("p-6 pt-0", className)}>{children}</div>
);

export const CardFooter = ({ children, className }: CardProps) => (
  <div className={cn("flex items-center p-6 pt-0", className)}>
    {children}
  </div>
);
```

### Input
```typescript
// components/ui/input.tsx
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
            "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
```

### Dialog
```typescript
// components/ui/dialog.tsx
interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Content */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-full max-w-lg rounded-xl bg-background p-6 shadow-lg">
          {children}
        </div>
      </div>
    </div>
  );
};

export const DialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4">{children}</div>
);

export const DialogTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-lg font-semibold">{children}</h2>
);

export const DialogDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-muted-foreground">{children}</p>
);

export const DialogFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-6 flex justify-end gap-2">{children}</div>
);
```

---

## 2️⃣ Layout Components

### TeacherLayout
```typescript
// components/layouts/TeacherLayout.tsx
'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface TeacherLayoutProps {
  children: React.ReactNode;
}

export default function TeacherLayout({ children }: TeacherLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        role="teacher"
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
```

### StudentLayout
```typescript
// components/layouts/StudentLayout.tsx
'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import BottomNav from './BottomNav';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface StudentLayoutProps {
  children: React.ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar
          open={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          role="student"
        />
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="mx-auto max-w-7xl p-4 md:p-6">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        {isMobile && <BottomNav />}
      </div>
    </div>
  );
}
```

### Sidebar
```typescript
// components/layouts/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  Video,
  FileText,
  BarChart,
  Settings,
  Users,
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  role: 'teacher' | 'student';
}

const teacherNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/teacher/dashboard' },
  { icon: Users, label: 'Classes', href: '/teacher/classes' },
  { icon: BookOpen, label: 'Subjects', href: '/teacher/subjects' },
  { icon: Video, label: 'Sessions', href: '/teacher/sessions' },
  { icon: FileText, label: 'Materials', href: '/teacher/materials' },
  { icon: BarChart, label: 'Analytics', href: '/teacher/analytics' },
  { icon: Settings, label: 'Settings', href: '/teacher/settings' },
];

const studentNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/student/dashboard' },
  { icon: BookOpen, label: 'My Classes', href: '/student/classes' },
  { icon: Video, label: 'Live Sessions', href: '/student/sessions' },
  { icon: FileText, label: 'Materials', href: '/student/materials' },
  { icon: BarChart, label: 'Performance', href: '/student/performance' },
  { icon: Settings, label: 'Settings', href: '/student/settings' },
];

export default function Sidebar({ open, role }: SidebarProps) {
  const pathname = usePathname();
  const navItems = role === 'teacher' ? teacherNavItems : studentNavItems;

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-card transition-transform duration-300 lg:relative lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col border-r">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <span className="text-xl font-bold text-primary-foreground">E</span>
            </div>
            <span className="text-lg font-semibold">EduPlatform</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="flex-1">
                <p className="text-sm font-medium">User Name</p>
                <p className="text-xs text-muted-foreground capitalize">{role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
```

### Topbar
```typescript
// components/layouts/Topbar.tsx
'use client';

import { Bell, Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/shared/ThemeToggle';
import LanguageSelector from '@/components/shared/LanguageSelector';

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search */}
      <div className="flex-1">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search..."
            className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <LanguageSelector />
        <ThemeToggle />
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
        </Button>
      </div>
    </header>
  );
}
```

### BottomNav (Mobile)
```typescript
// components/layouts/BottomNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, BookOpen, Video, User } from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Home', href: '/student/dashboard' },
  { icon: BookOpen, label: 'Classes', href: '/student/classes' },
  { icon: Video, label: 'Live', href: '/student/sessions' },
  { icon: User, label: 'Profile', href: '/student/profile' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

---

## 3️⃣ Teacher Components

### CreateClassDialog
```typescript
// components/teacher/CreateClassDialog.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const classSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  grade: z.string().min(1, 'Grade is required'),
  section: z.string().optional(),
  academicYear: z.string().min(1, 'Academic year is required'),
  description: z.string().optional(),
  maxStudents: z.number().min(1).max(100).optional(),
});

type ClassFormData = z.infer<typeof classSchema>;

interface CreateClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateClassDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateClassDialogProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
  });

  const onSubmit = async (data: ClassFormData) => {
    try {
      setLoading(true);
      const response = await fetch('/api/teacher/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        onSuccess();
        reset();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Failed to create class:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Create New Class</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Class Name"
          placeholder="e.g., Physics Advanced"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Grade"
            placeholder="e.g., Class 10"
            error={errors.grade?.message}
            {...register('grade')}
          />

          <Input
            label="Section"
            placeholder="e.g., A"
            error={errors.section?.message}
            {...register('section')}
          />
        </div>

        <Input
          label="Academic Year"
          placeholder="e.g., 2025-26"
          error={errors.academicYear?.message}
          {...register('academicYear')}
        />

        <Input
          label="Description"
          placeholder="Brief description..."
          error={errors.description?.message}
          {...register('description')}
        />

        <Input
          label="Max Students"
          type="number"
          placeholder="50"
          error={errors.maxStudents?.message}
          {...register('maxStudents', { valueAsNumber: true })}
        />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Class'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
```

### ClassCard
```typescript
// components/teacher/ClassCard.tsx
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, Calendar } from 'lucide-react';

interface ClassCardProps {
  class: {
    id: string;
    name: string;
    grade: string;
    section?: string;
    studentCount: number;
    subjectCount: number;
    nextSession?: Date;
  };
}

export default function ClassCard({ class: cls }: ClassCardProps) {
  return (
    <Card hoverable>
      <CardHeader>
        <CardTitle>{cls.name}</CardTitle>
        <CardDescription>
          {cls.grade} {cls.section && `- Section ${cls.section}`}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{cls.studentCount} Students</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>{cls.subjectCount} Subjects</span>
          </div>

          {cls.nextSession && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Next: {new Date(cls.nextSession).toLocaleDateString()}</span>
            </div>
          )}

          <Link href={`/teacher/class/${cls.id}`}>
            <Button className="w-full mt-2">View Details</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
```

### AttendanceTable
```typescript
// components/teacher/AttendanceTable.tsx
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface AttendanceTableProps {
  attendance: {
    id: string;
    student: {
      name: string;
      email: string;
    };
    status: 'present' | 'absent' | 'late' | 'excused';
    joinTime?: Date;
    duration: number;
  }[];
}

const statusColors = {
  present: 'bg-green-500',
  absent: 'bg-red-500',
  late: 'bg-yellow-500',
  excused: 'bg-blue-500',
};

export default function AttendanceTable({ attendance }: AttendanceTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Join Time</TableHead>
          <TableHead>Duration</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {attendance.map((record) => (
          <TableRow key={record.id}>
            <TableCell className="font-medium">{record.student.name}</TableCell>
            <TableCell>{record.student.email}</TableCell>
            <TableCell>
              <Badge className={statusColors[record.status]}>
                {record.status}
              </Badge>
            </TableCell>
            <TableCell>
              {record.joinTime
                ? new Date(record.joinTime).toLocaleTimeString()
                : '-'}
            </TableCell>
            <TableCell>{record.duration} min</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

---

## 4️⃣ Student Components

### SessionCard
```typescript
// components/student/SessionCard.tsx
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video } from 'lucide-react';

interface SessionCardProps {
  session: {
    id: string;
    title: string;
    subject: string;
    teacher: string;
    scheduledAt: Date;
    duration: number;
    status: 'scheduled' | 'live' | 'completed';
  };
  onJoin?: () => void;
}

export default function SessionCard({ session, onJoin }: SessionCardProps) {
  const statusColors = {
    scheduled: 'bg-blue-500',
    live: 'bg-green-500 animate-pulse',
    completed: 'bg-gray-500',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{session.title}</CardTitle>
            <CardDescription>{session.subject}</CardDescription>
          </div>
          <Badge className={statusColors[session.status]}>
            {session.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{new Date(session.scheduledAt).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            {new Date(session.scheduledAt).toLocaleTimeString()} ({session.duration} min)
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Video className="h-4 w-4" />
          <span>Teacher: {session.teacher}</span>
        </div>
      </CardContent>

      {session.status === 'live' && (
        <CardFooter>
          <Button className="w-full" onClick={onJoin}>
            Join Now
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
```

### PerformanceDashboard
```typescript
// components/student/PerformanceDashboard.tsx
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AttendanceChart } from '@/components/charts/AttendanceChart';
import { PerformanceChart } from '@/components/charts/PerformanceChart';
import { TrendingUp, Award, Target } from 'lucide-react';

interface PerformanceDashboardProps {
  data: {
    attendanceRate: number;
    averageScore: number;
    rank: number;
    totalStudents: number;
    points: number;
  };
}

export default function PerformanceDashboard({ data }: PerformanceDashboardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Attendance Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.attendanceRate}%</div>
          <p className="text-xs text-muted-foreground">
            Last 30 days
          </p>
        </CardContent>
      </Card>

      {/* Average Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.averageScore}%</div>
          <p className="text-xs text-muted-foreground">
            Across all quizzes
          </p>
        </CardContent>
      </Card>

      {/* Class Rank */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Class Rank</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            #{data.rank}/{data.totalStudents}
          </div>
          <p className="text-xs text-muted-foreground">
            {data.points} points earned
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 5️⃣ LiveKit Components

### VideoRoom
```typescript
// components/livekit/VideoRoom.tsx
'use client';

import { useEffect } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';

interface VideoRoomProps {
  token: string;
  serverUrl: string;
  roomName: string;
  onDisconnected: () => void;
}

export default function VideoRoom({
  token,
  serverUrl,
  roomName,
  onDisconnected,
}: VideoRoomProps) {
  return (
    <div className="h-screen w-full bg-black">
      <LiveKitRoom
        token={token}
        serverUrl={serverUrl}
        connect={true}
        video={true}
        audio={true}
        onDisconnected={onDisconnected}
      >
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}
```

### ChatPanel
```typescript
// components/livekit/ChatPanel.tsx
'use client';

import { useState } from 'react';
import { useChat, useLocalParticipant } from '@livekit/components-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

export default function ChatPanel() {
  const [message, setMessage] = useState('');
  const { send, chatMessages } = useChat();
  const { localParticipant } = useLocalParticipant();

  const handleSend = () => {
    if (message.trim()) {
      send(message);
      setMessage('');
    }
  };

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Messages */}
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {chatMessages.map((msg, index) => (
          <div
            key={index}
            className={cn(
              "rounded-lg p-2",
              msg.from?.identity === localParticipant.identity
                ? "ml-auto max-w-[80%] bg-primary text-primary-foreground"
                : "mr-auto max-w-[80%] bg-muted"
            )}
          >
            <p className="text-xs font-semibold">{msg.from?.name}</p>
            <p className="text-sm">{msg.message}</p>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
          />
          <Button size="icon" onClick={handleSend}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

## 6️⃣ AI Components

### ChatInterface
```typescript
// components/ai/ChatInterface.tsx
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex h-[600px] flex-col">
      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-3",
              msg.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === 'assistant' && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
            )}

            <div
              className={cn(
                "max-w-[70%] rounded-lg px-4 py-2",
                msg.role === 'user'
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              <p className="text-sm">{msg.content}</p>
            </div>

            {msg.role === 'user' && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 animate-pulse" />
            <span className="text-sm text-muted-foreground">Thinking...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            disabled={loading}
          />
          <Button onClick={handleSend} disabled={loading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
```

---

## 7️⃣ Shared Components

### ThemeToggle
```typescript
// components/shared/ThemeToggle.tsx
'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
```

### LoadingSpinner
```typescript
// components/shared/LoadingSpinner.tsx
export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-current border-t-transparent",
          sizes[size]
        )}
      />
    </div>
  );
}
```

---

## Component Usage Examples

```typescript
// Usage in a page
import TeacherLayout from '@/components/layouts/TeacherLayout';
import ClassCard from '@/components/teacher/ClassCard';
import CreateClassDialog from '@/components/teacher/CreateClassDialog';

export default function TeacherDashboard() {
  return (
    <TeacherLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Classes</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <ClassCard key={cls.id} class={cls} />
          ))}
        </div>
        
        <CreateClassDialog />
      </div>
    </TeacherLayout>
  );
}
```
