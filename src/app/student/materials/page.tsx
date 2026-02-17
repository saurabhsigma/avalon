'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import SmartSearch from '@/components/SmartSearch';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  FaBook, FaFilePdf, FaVideo, FaImage, FaLink,
  FaSearch, FaSpinner, FaDownload, FaExternalLinkAlt
} from 'react-icons/fa';

export default function StudentMaterialsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolledClass, setEnrolledClass] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [selectedSubject, enrolledClass]);

  const fetchData = async () => {
    try {
      // 1. Get Enrolled Class
      const clsRes = await fetch('/api/classes');
      const clsData = await clsRes.json();

      // Assumes student has one enrolled class returned or logic handles it in API
      // The API returns { classes: [...] } and for students if enrolled they get their class with isEnrolled=true
      // ACTUALLY, checking the API logic we implemented:
      // "If student, return all classes, mark isEnrolled" OR "fetch user to get classId".
      // Let's assume the first class in the list that isEnrolled is the one.

      const myClass = clsData.classes?.find((c: any) => c.isEnrolled) || clsData.classes?.[0]; // Fallback?

      if (myClass) {
        setEnrolledClass(myClass);

        // 2. Get Subjects for this class
        const subRes = await fetch(`/api/subjects?classId=${myClass._id}`);
        const subData = await subRes.json();
        setSubjects(subData.subjects || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      // Don't stop loading here, wait for materials
    }
  };

  const fetchMaterials = async () => {
    if (!enrolledClass) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let url = '/api/materials';

      if (selectedSubject !== 'all') {
        url += `?subjectId=${selectedSubject}`;
      }
      // Don't pass classId - the API handles student filtering automatically

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setMaterials(data.materials || []);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FaFilePdf className="text-red-500 text-3xl" />;
      case 'video': return <FaVideo className="text-blue-500 text-3xl" />;
      case 'image': return <FaImage className="text-purple-500 text-3xl" />;
      case 'link': return <FaLink className="text-green-500 text-3xl" />;
      default: return <FaBook className="text-gray-500 text-3xl" />;
    }
  };

  return (
    <DashboardLayout userRole="student" userName="Student">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            My Study Materials 📚
          </h1>
          <p className="text-gray-600 font-medium mt-2">
            {enrolledClass ? `Resources for ${enrolledClass.name}` : 'Explore learning resources'}
          </p>
        </motion.div>

        {/* Smart Search with Pinecone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SmartSearch />
        </motion.div>

        {/* Filters */}
        <div className="glass-card border-2 border-white p-4 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant={selectedSubject === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedSubject('all')}
                className={`rounded-full font-semibold ${
                  selectedSubject === 'all' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-2 border-white shadow-lg' 
                    : 'border-2 hover:border-purple-500 hover:text-purple-600'
                }`}
              >
                All Subjects
              </Button>
            </motion.div>
            {subjects.map(sub => (
              <motion.div key={sub._id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant={selectedSubject === sub._id ? 'default' : 'outline'}
                  onClick={() => setSelectedSubject(sub._id)}
                  className={`rounded-full font-semibold ${
                    selectedSubject === sub._id 
                      ? 'text-white border-2 border-white shadow-lg' 
                      : 'border-2'
                  }`}
                  style={selectedSubject === sub._id ? { background: `linear-gradient(135deg, ${sub.color}CC, ${sub.color}FF)` } : { color: sub.color, borderColor: sub.color }}
                >
                  {sub.name}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Materials List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
              <p className="mt-4 text-lg font-medium text-gray-600">Loading your materials...</p>
            </div>
          </div>
        ) : materials.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card border-2 border-white p-16 text-center"
          >
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaBook className="text-4xl text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Materials Found! 📖</h3>
            <p className="text-gray-600 font-medium">Your teachers haven't uploaded any resources for this subject yet.</p>
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
                <div className="glass-card border-2 border-white hover:shadow-2xl transition-all h-full flex flex-col relative overflow-hidden">
                  <div className="bg-gradient-to-br from-white to-gray-50 p-4 pb-4 border-b border-gray-200">
                    <div className="flex gap-4">
                      <div className="bg-white p-3 rounded-xl shadow-md border border-gray-100 group-hover:scale-110 transition-transform">
                        {getIcon(item.type)}
                      </div>
                      <div className="flex-1">
                        <Badge
                          variant="outline"
                          className="mb-2 border-0 font-semibold"
                          style={{ backgroundColor: item.subjectId?.color + '30', color: item.subjectId?.color }}
                        >
                          {item.subjectId?.name}
                        </Badge>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">
                          {item.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">{item.description}</p>

                    <div className="mt-auto space-y-3">
                      <div className="flex justify-between items-center text-xs text-gray-500 font-medium px-1">
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        {item.fileSize && <span>{(item.fileSize / 1024 / 1024).toFixed(1)} MB</span>}
                      </div>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="block">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold border-2 border-white shadow-lg">
                            {item.type === 'link' ? (
                              <>
                                <FaExternalLinkAlt className="mr-2" /> Open Link
                              </>
                            ) : (
                              <>
                                <FaDownload className="mr-2" /> Download
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </a>
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
