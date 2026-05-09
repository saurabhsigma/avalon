'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function StudentAttendancePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      const res = await fetch('/api/attendance' + (params.toString() ? `?${params.toString()}` : ''));
      if (res.ok) {
        const data = await res.json();
        setRecords(data.attendance || []);
        setStats(data.stats || null);
      }
    } catch (e) {
      console.error('Failed to fetch attendance', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, []);

  const exportCsv = () => {
    if (!records || records.length === 0) {
      alert('No records to export');
      return;
    }
    const rows = records.map(r => ({ date: r.date ? new Date(r.date).toLocaleString() : '', session: r.sessionId?.title || '', status: r.status, duration: r.duration || 0 }));
    const header = Object.keys(rows[0]).join(',');
    const csv = [header, ...rows.map(r => Object.values(r).map(v => '"' + String(v).replace(/"/g, '""') + '"').join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `attendance_report_student.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout userRole="student" userName="Student">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>My Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded px-2 py-1" />
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded px-2 py-1" />
              <Button onClick={fetchReport}>Filter</Button>
              <Button variant="outline" onClick={exportCsv}>Export CSV</Button>
            </div>

            {loading ? <div>Loading...</div> : (
              <div>
                {stats && (
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="p-3 border rounded">Total: <div className="font-bold">{stats.totalSessions}</div></div>
                    <div className="p-3 border rounded">Present: <div className="font-bold">{stats.present}</div></div>
                    <div className="p-3 border rounded">Absent: <div className="font-bold">{stats.absent}</div></div>
                    <div className="p-3 border rounded">Late: <div className="font-bold">{stats.late}</div></div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full table-auto border-collapse">
                    <thead>
                      <tr className="text-left border-b"><th className="p-2">Date</th><th className="p-2">Session</th><th className="p-2">Status</th><th className="p-2">Duration (min)</th></tr>
                    </thead>
                    <tbody>
                      {records.map((r, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="p-2">{r.date ? format(new Date(r.date), 'yyyy-MM-dd HH:mm') : ''}</td>
                          <td className="p-2">{r.sessionId?.title || '—'}</td>
                          <td className="p-2">{r.status}</td>
                          <td className="p-2">{r.duration || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
