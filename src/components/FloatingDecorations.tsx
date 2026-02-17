'use client';

import { useEffect, useState } from 'react';
import { FaStar, FaBook, FaPencilAlt, FaLightbulb, FaHeart, FaRocket, FaTrophy, FaGraduationCap } from 'react-icons/fa';

const FloatingDecorations = () => {
  const [mounted, setMounted] = useState(false);
  const [stars, setStars] = useState<Array<{ id: number; delay: number; duration: number; left: string; top: string }>>([]);

  useEffect(() => {
    setMounted(true);
    
    // Generate subtle shooting stars - only 2 at a time
    const generateStars = () => {
      const newStars = Array.from({ length: 2 }, (_, i) => ({
        id: i,
        delay: Math.random() * 3,
        duration: 2 + Math.random() * 1,
        left: `${20 + Math.random() * 60}%`,
        top: `${10 + Math.random() * 30}%`,
      }));
      setStars(newStars);
    };

    generateStars();
    const interval = setInterval(generateStars, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const floatingIcons = [
    { Icon: FaBook, color: 'text-blue-400', position: 'top-20 left-10', delay: '0s', size: 'text-3xl' },
    { Icon: FaLightbulb, color: 'text-orange-400', position: 'top-60 left-1/4', delay: '1s', size: 'text-4xl' },
    { Icon: FaRocket, color: 'text-purple-400', position: 'top-1/2 right-10', delay: '2s', size: 'text-3xl' },
    { Icon: FaGraduationCap, color: 'text-green-400', position: 'top-1/3 right-1/4', delay: '3s', size: 'text-4xl' },
  ];

  // Pre-defined positions for twinkling stars (reduced for performance)
  const twinklePositions = [
    { left: '10%', top: '15%', delay: '0s' },
    { left: '25%', top: '8%', delay: '0.3s' },
    { left: '40%', top: '20%', delay: '0.6s' },
    { left: '70%', top: '25%', delay: '1.2s' },
    { left: '85%', top: '18%', delay: '1.5s' },
    { left: '15%', top: '45%', delay: '0.2s' },
    { left: '45%', top: '48%', delay: '0.8s' },
    { left: '75%', top: '42%', delay: '1.4s' },
    { left: '90%', top: '50%', delay: '1.7s' },
    { left: '22%', top: '82%', delay: '0.7s' },
    { left: '52%', top: '85%', delay: '1.3s' },
    { left: '68%', top: '72%', delay: '1.6s' },
    { left: '28%', top: '28%', delay: '0.4s' },
    { left: '58%', top: '32%', delay: '1s' },
    { left: '88%', top: '35%', delay: '1.6s' },
  ];

  // Don't render random elements until client-side
  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Floating Icons */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {floatingIcons.map((item, index) => (
          <div
            key={index}
            className={`absolute ${item.position} ${item.color} ${item.size} opacity-20 floating-icon-slow`}
            style={{ animationDelay: item.delay }}
          >
            <item.Icon />
          </div>
        ))}
      </div>

      {/* Subtle Shooting Stars */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {stars.map((star) => (
          <div
            key={star.id}
            className="shooting-star"
            style={{
              left: star.left,
              top: star.top,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Twinkling Stars Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {twinklePositions.map((pos, i) => (
          <div
            key={`twinkle-${i}`}
            className="absolute w-1 h-1 bg-yellow-300 rounded-full twinkle-star"
            style={{
              left: pos.left,
              top: pos.top,
              animationDelay: pos.delay,
            }}
          />
        ))}
      </div>
    </>
  );
};

export default FloatingDecorations;
