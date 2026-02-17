'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { FaCalendarPlus, FaImage, FaSpinner, FaLink } from 'react-icons/fa';

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    coverPhoto: '',
    link: '',
  });
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      
      if (!cloudName) {
        setError('Cloudinary is not configured. Please contact administrator.');
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'classroom_events'); // You'll need to create this in Cloudinary

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await res.json();
      if (data.secure_url) {
        setFormData(prev => ({ ...prev, coverPhoto: data.secure_url }));
        setPreviewImage(data.secure_url);
      } else {
        setError('Failed to upload image');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.coverPhoto) {
      setError('Please upload a cover photo');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/events');
      } else {
        setError(data.error || 'Failed to create event');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Create event error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="doodle-card bg-white border-blue-500 overflow-hidden"
        >
          {/* Header */}
          <div className="px-8 py-6 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 border-b-3 border-blue-300">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FaCalendarPlus className="text-blue-600" />
              Create New Event 🎉
            </h1>
            <p className="text-gray-700 font-medium mt-2">Share your event with the community!</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-100 border-2 border-red-400 rounded-xl"
              >
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </motion.div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 font-medium"
                placeholder="e.g., Annual Tech Fest 2026"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 font-medium"
                placeholder="Describe your event..."
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 font-medium"
                />
              </div>
            </div>

            {/* Event Link */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                <FaLink className="text-blue-600" />
                Event Link (Optional)
              </label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 font-medium"
                placeholder="https://example.com/event"
              />
            </div>

            {/* Cover Photo Upload */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                <FaImage className="text-purple-600" />
                Cover Photo <span className="text-red-500">*</span>
              </label>
              
              <div className="space-y-4">
                {previewImage && (
                  <div className="relative">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-xl border-3 border-blue-400 shadow-lg"
                    />
                  </div>
                )}

                <label className="doodle-button bg-gradient-to-r from-purple-500 to-pink-600 text-white border-purple-700 cursor-pointer inline-flex items-center gap-2">
                  {uploading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <FaImage />
                      <span>{previewImage ? 'Change Photo' : 'Upload Photo'}</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                <p className="text-xs text-gray-600 font-medium">Max size: 5MB. Supported: JPG, PNG, GIF</p>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || uploading}
                className="doodle-button flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:border-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <FaCalendarPlus />
                    <span>Create Event</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="doodle-button bg-white text-gray-700 border-gray-400 hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
