'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'teacher' }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create teacher');
      }

      setFormData({ name: '', email: '', password: '' });
      fetchUsers();
    } catch (error: any) {
      alert(error.message || 'Failed to create teacher');
    } finally {
      setSaving(false);
    }
  };

  const updateUser = async (userId: string, payload: any) => {
    const response = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...payload }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update user');
    }

    fetchUsers();
  };

  return (
    <DashboardLayout userRole="admin" userName="Admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Create teachers, verify staff, and deactivate accounts.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Teacher</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createTeacher} className="grid gap-4 md:grid-cols-3">
              <Input placeholder="Teacher name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              <Input placeholder="Teacher email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              <Input placeholder="Temporary password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
              <div className="md:col-span-3 flex justify-end">
                <Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create Teacher'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading users...</div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user._id} className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500">
                        {user.role} · {user.isVerified ? 'verified' : 'unverified'} · {user.isActive ? 'active' : 'inactive'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {user.role === 'teacher' && !user.isVerified && (
                        <Button variant="outline" onClick={() => updateUser(user._id, { isVerified: true })}>
                          Verify
                        </Button>
                      )}
                      {user.role === 'teacher' && user.isVerified && (
                        <Button variant="outline" onClick={() => updateUser(user._id, { isVerified: false })}>
                          Unverify
                        </Button>
                      )}
                      <Button variant={user.isActive ? 'destructive' : 'outline'} onClick={() => updateUser(user._id, { isActive: !user.isActive })}>
                        {user.isActive ? 'Kick' : 'Restore'}
                      </Button>
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