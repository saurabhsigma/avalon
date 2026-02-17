'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { FaPlus, FaTrash, FaBullhorn } from 'react-icons/fa';

interface NoticeManagementProps {
  userRole: 'admin' | 'teacher';
}

export default function NoticeManagement({ userRole }: NoticeManagementProps) {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    targetAudience: 'all',
    links: [{ label: '', url: '' }],
    expiresAt: '',
  });
  const router = useRouter();

  useEffect(() => {
    fetchUser();
    fetchNotices();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      router.push('/login');
    }
  };

  const fetchNotices = async () => {
    try {
      const response = await fetch('/api/notices');
      if (response.ok) {
        const data = await response.json();
        setNotices(data.notices || []);
      }
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          links: formData.links.filter(link => link.label && link.url),
        }),
      });

      if (response.ok) {
        setDialogOpen(false);
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          targetAudience: 'all',
          links: [{ label: '', url: '' }],
          expiresAt: '',
        });
        fetchNotices();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create notice');
      }
    } catch (error) {
      console.error('Error creating notice:', error);
      alert('Failed to create notice');
    }
  };

  const deleteNotice = async (id: string) => {
    if (!confirm('Delete this notice?')) return;

    try {
      const response = await fetch(`/api/notices?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchNotices();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete notice');
      }
    } catch (error) {
      console.error('Error deleting notice:', error);
      alert('Failed to delete notice');
    }
  };

  const addLink = () => {
    setFormData({
      ...formData,
      links: [...formData.links, { label: '', url: '' }],
    });
  };

  const updateLink = (index: number, field: 'label' | 'url', value: string) => {
    const newLinks = [...formData.links];
    newLinks[index][field] = value;
    setFormData({ ...formData, links: newLinks });
  };

  const removeLink = (index: number) => {
    setFormData({
      ...formData,
      links: formData.links.filter((_, i) => i !== index),
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-8 border-green-500 border-t-transparent"></div>
          <p className="mt-4 text-xl font-bold text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout userRole={userRole} userName={user?.name}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-800">Manage Notices</h1>
            <p className="text-gray-700 font-medium">Post and manage school announcements</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="doodle-button bg-green-600 text-white font-bold border-green-800">
                <FaPlus className="mr-2" />
                Post Notice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Notice</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Title"
                  type="text"
                  placeholder="Notice title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />

                <div>
                  <label className="block text-sm font-semibold mb-1">Description</label>
                  <textarea
                    className="w-full p-3 border-2 border-gray-300 rounded-lg"
                    rows={5}
                    placeholder="Notice description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Priority</label>
                    <select
                      className="w-full p-2 border-2 border-gray-300 rounded-lg"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Target Audience</label>
                    <select
                      className="w-full p-2 border-2 border-gray-300 rounded-lg"
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    >
                      <option value="all">All</option>
                      <option value="teachers">Teachers Only</option>
                      <option value="students">Students Only</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Links (Optional)</label>
                  {formData.links.map((link, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Link label"
                        className="flex-1 p-2 border-2 border-gray-300 rounded-lg"
                        value={link.label}
                        onChange={(e) => updateLink(index, 'label', e.target.value)}
                      />
                      <input
                        type="url"
                        placeholder="URL"
                        className="flex-1 p-2 border-2 border-gray-300 rounded-lg"
                        value={link.url}
                        onChange={(e) => updateLink(index, 'url', e.target.value)}
                      />
                      <Button type="button" variant="outline" onClick={() => removeLink(index)}>
                        <FaTrash />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addLink} className="w-full mt-2">
                    + Add Link
                  </Button>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Expires At (Optional)</label>
                  <input
                    type="date"
                    className="w-full p-2 border-2 border-gray-300 rounded-lg"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full doodle-button bg-yellow-500 text-green-900 font-bold">
                  <FaBullhorn className="mr-2" />
                  Post Notice
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Notices List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-8 border-green-500 border-t-transparent"></div>
            <p className="mt-4 text-xl font-bold text-gray-700">Loading notices...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notices.map((notice, index) => (
              <motion.div
                key={notice._id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="doodle-card bg-white border-4 border-green-600">
                  <CardHeader className="bg-green-100">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`font-bold ${
                            notice.priority === 'urgent' ? 'bg-red-500' :
                            notice.priority === 'high' ? 'bg-orange-500' :
                            notice.priority === 'medium' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          } text-white`}>
                            {notice.priority}
                          </Badge>
                          <Badge className="bg-gray-200 text-gray-800 font-bold">
                            {notice.targetAudience}
                          </Badge>
                          <Badge className="bg-purple-200 text-purple-800 font-bold">
                            by {notice.postedByRole}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl font-bold text-green-800">
                          {notice.title}
                        </CardTitle>
                      </div>
                      {(userRole === 'admin' || notice.postedBy?._id === user?._id) && (
                        <Button
                          onClick={() => deleteNotice(notice._id)}
                          className="doodle-button bg-red-500 text-white border-red-700"
                        >
                          <FaTrash />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-gray-700 font-medium whitespace-pre-wrap">{notice.description}</p>
                    {notice.links && notice.links.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {notice.links.map((link: any, idx: number) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-blue-600 hover:underline"
                          >
                            🔗 {link.label}
                          </a>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-600 mt-3">
                      Posted by: {notice.postedBy?.name || 'Unknown'} • {new Date(notice.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
