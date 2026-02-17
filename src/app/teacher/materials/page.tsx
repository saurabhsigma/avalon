'use client';
// Force rebuild

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  FaBook, FaFilePdf, FaVideo, FaImage, FaLink, FaPlus,
  FaTrash, FaSearch, FaCloudUploadAlt, FaSpinner, FaUpload, FaDownload
} from 'react-icons/fa';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function TeacherMaterialsPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'pdf',
    url: '',
    thumbnail: '',
    fileSize: 0
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchSubjects(selectedClass);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedSubject) {
      fetchMaterials(selectedSubject);
    } else {
      setMaterials([]);
    }
  }, [selectedSubject]);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []);
        if (data.classes?.length > 0) {
          setSelectedClass(data.classes[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async (classId: string) => {
    try {
      const response = await fetch(`/api/subjects?classId=${classId}`);
      if (response.ok) {
        const data = await response.json();
        setSubjects(data.subjects || []);
        if (data.subjects?.length > 0) {
          setSelectedSubject(data.subjects[0]._id);
        } else {
          setSelectedSubject('');
          setMaterials([]);
        }
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchMaterials = async (subjectId: string) => {
    setLoadingMaterials(true);
    try {
      const response = await fetch(`/api/materials?subjectId=${subjectId}`);
      if (response.ok) {
        const data = await response.json();
        setMaterials(data.materials || []);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoadingMaterials(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject || !selectedClass) {
      alert('Please select class and subject first');
      return;
    }

    if (!uploadFile) {
      alert('Please select a file to upload');
      return;
    }

    setUploading(true);
    try {
      // Upload file first
      const uploadFormData = new FormData();
      uploadFormData.append('file', uploadFile);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!uploadRes.ok) {
        throw new Error('File upload failed');
      }

      const uploadData = await uploadRes.json();

      // Create material record
      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          url: uploadData.url,
          classId: selectedClass,
          subjectId: selectedSubject,
          fileSize: uploadData.size,
        })
      });

      if (res.ok) {
        alert('Material uploaded successfully!');
        setIsUploadModalOpen(false);
        setFormData({ title: '', description: '', type: 'pdf', url: '', thumbnail: '', fileSize: 0 });
        setUploadFile(null);
        fetchMaterials(selectedSubject);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to upload material');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;
    try {
      const res = await fetch(`/api/materials?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchMaterials(selectedSubject);
      } else {
        alert('Failed to delete');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FaFilePdf className="text-red-500 text-2xl" />;
      case 'video': return <FaVideo className="text-blue-500 text-2xl" />;
      case 'image': return <FaImage className="text-purple-500 text-2xl" />;
      case 'link': return <FaLink className="text-green-500 text-2xl" />;
      default: return <FaBook className="text-gray-500 text-2xl" />;
    }
  };

  return (
    <DashboardLayout userRole="teacher" userName="Teacher">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Study Materials 📚
            </h1>
            <p className="text-gray-600 font-medium mt-2">Upload and manage resources for your students</p>
          </div>

          <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
            <DialogTrigger asChild>
              <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="doodle-button bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold border-2 border-white shadow-xl text-lg px-6 py-6">
                  <FaCloudUploadAlt className="mr-2 text-xl" />
                  Upload Material
                </Button>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="doodle-card border-4 border-blue-600 sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-blue-800">Upload New Material</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Chapter 1 Notes"
                    required
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description..."
                  />
                </div>

                <div>
                  <Label>Upload File (PDF, Word, Images)</Label>
                  {!uploadFile ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadFile(file);
                            const type = file.type.includes('pdf') ? 'pdf' : 
                                       file.type.includes('word') || file.type.includes('document') ? 'document' :
                                       file.type.includes('image') ? 'image' : 'other';
                            setFormData({ ...formData, type });
                          }
                        }}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <FaUpload className="text-4xl text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 font-medium">Click to upload file</p>
                        <p className="text-xs text-gray-500 mt-1">PDF, Word, or Images</p>
                      </label>
                    </div>
                  ) : (
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200 flex items-center gap-2">
                      <div className="bg-green-100 p-2 rounded-full">
                        <FaFilePdf className="text-green-600" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-green-800 truncate">{uploadFile.name}</p>
                        <p className="text-xs text-green-600">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setUploadFile(null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Fallback for Link type if not uploading file */}
                {/* For now, simplified to just upload or generic URL if we wanted to add that field manually */}

                <Button type="submit" disabled={!uploadFile || uploading} className="w-full bg-blue-600 hover:bg-blue-700">
                  {uploading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    'Publish Material'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Filters */}
        <div className="glass-card border-2 border-white p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="mb-3 block font-bold text-gray-800 text-lg flex items-center gap-2">
                <span className="bg-gradient-to-r from-green-500 to-emerald-500 w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm">🏛️</span>
                Select Class
              </Label>
              <div className="flex gap-2 flex-wrap">
                {classes.map(cls => (
                  <motion.div key={cls._id} whileHover={{ y: -1 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant={selectedClass === cls._id ? 'default' : 'outline'}
                      onClick={() => setSelectedClass(cls._id)}
                      className={`rounded-full font-semibold ${
                        selectedClass === cls._id 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-2 border-white shadow-lg' 
                          : 'border-2 hover:border-green-500 hover:text-green-600'
                      }`}
                    >
                      {cls.name}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-3 block font-bold text-gray-800 text-lg flex items-center gap-2">
                <span className="bg-gradient-to-r from-blue-500 to-cyan-500 w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm">📚</span>
                Select Subject
              </Label>
              <div className="flex gap-2 flex-wrap">
                {subjects.length > 0 ? subjects.map(sub => (
                  <motion.div key={sub._id} whileHover={{ y: -1 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant={selectedSubject === sub._id ? 'default' : 'outline'}
                      onClick={() => setSelectedSubject(sub._id)}
                      className={`rounded-full font-semibold ${
                        selectedSubject === sub._id 
                          ? 'text-white border-2 border-white shadow-lg' 
                          : 'border-2 hover:border-blue-500'
                      }`}
                      style={selectedSubject === sub._id ? { background: `linear-gradient(135deg, ${sub.color}CC, ${sub.color}FF)` } : { color: sub.color, borderColor: sub.color }}
                    >
                      {sub.name}
                    </Button>
                  </motion.div>
                )) : (
                  <p className="text-gray-500 text-sm italic">No subjects found for this class.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Materials List */}
        {loadingMaterials ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
              <p className="mt-4 text-lg font-medium text-gray-600">Loading materials...</p>
            </div>
          </div>
        ) : materials.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card border-2 border-white p-16 text-center"
          >
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaBook className="text-4xl text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Materials Yet! 📚</h3>
            <p className="text-gray-600 font-medium">Select a subject and upload your first resource!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.03, y: -8 }}
                className="group"
              >
                <div className="glass-card border-2 border-white hover:shadow-2xl transition-all overflow-hidden h-full flex flex-col relative">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 pb-2 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="bg-white p-3 rounded-xl shadow-md">
                        {getIcon(item.type)}
                      </div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item._id)}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 h-8 w-8 rounded-lg"
                        >
                          <FaTrash size={14} />
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">{item.description}</p>

                    <div className="mt-auto">
                      <div className="flex justify-between items-center text-xs text-gray-500 mb-3 font-medium">
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        {item.fileSize && <span>{(item.fileSize / 1024 / 1024).toFixed(2)} MB</span>}
                      </div>
                      <div className="flex gap-2">
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.95 }} className="w-full">
                            <Button variant="outline" className="w-full border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-400 font-semibold">
                              View
                            </Button>
                          </motion.div>
                        </a>
                        <a href={item.url} download className="flex-1">
                          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.95 }} className="w-full">
                            <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold border-2 border-white shadow-lg">
                              <FaDownload className="mr-1" /> Download
                            </Button>
                          </motion.div>
                        </a>
                      </div>
                    </div>
                  </div>
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
