"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FaCloudUploadAlt, FaSpinner } from 'react-icons/fa';

interface CloudinaryUploadWidgetProps {
    onUpload: (result: any) => void;
    folder?: string;
    resourceType?: 'auto' | 'image' | 'video' | 'raw';
}

declare global {
    interface Window {
        cloudinary: any;
    }
}

export default function CloudinaryUploadWidget({
    onUpload,
    folder = 'learn-materials',
    resourceType = 'auto'
}: CloudinaryUploadWidgetProps) {
    const [loaded, setLoaded] = useState(false);
    const widgetRef = useRef<any>(null);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://upload-widget.cloudinary.com/global/all.js';
        script.async = true;
        script.onload = () => setLoaded(true);
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    useEffect(() => {
        if (loaded && window.cloudinary) {
            widgetRef.current = window.cloudinary.createUploadWidget(
                {
                    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dgigomqfz',
                    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default',
                    folder: folder,
                    resourceType: resourceType,
                    sources: ['local', 'url', 'camera'],
                    multiple: false,
                    clientAllowedFormats: ['png', 'jpeg', 'jpg', 'pdf', 'doc', 'docx', 'mp4'],
                    maxFileSize: 10485760, // 10MB
                },
                (error: any, result: any) => {
                    if (!error && result && result.event === "success") {
                        console.log('Done! Here is the image info: ', result.info);
                        onUpload(result.info);
                    }
                }
            );
        }
    }, [loaded, onUpload, folder, resourceType]);

    const handleOpen = () => {
        if (widgetRef.current) {
            widgetRef.current.open();
        }
    };

    return (
        <div>
            {!loaded ? (
                <Button disabled variant="outline" className="w-full">
                    <FaSpinner className="animate-spin mr-2" />
                    Loading...
                </Button>
            ) : (
                <Button
                    type="button"
                    onClick={handleOpen}
                    variant="outline"
                    className="w-full border-dashed border-2 h-24 flex flex-col gap-2 hover:bg-gray-50 hover:border-blue-500"
                >
                    <FaCloudUploadAlt className="text-3xl text-gray-400" />
                    <span>Click to Upload File</span>
                </Button>
            )}
        </div>
    );
}
