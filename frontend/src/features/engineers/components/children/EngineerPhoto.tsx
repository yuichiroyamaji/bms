"use client";

import React, { useState } from "react";
import Image from "next/image";
import { getProfilePhotoUrl } from "../../services/engineersDataService";

interface EngineerPhotoProps {
  profilePhoto: string;
  name: string;
}

export default function EngineerPhoto({ profilePhoto, name }: EngineerPhotoProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Generate initials for fallback
  const getInitials = (fullName: string): string => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const photoUrl = getProfilePhotoUrl(profilePhoto);

  if (!photoUrl || imageError) {
    return (
      <div className="relative">
        <div className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700">
          <span className="text-white font-semibold text-lg">
            {getInitials(name)}
          </span>
        </div>
        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      {imageLoading && (
        <div className="w-[60px] h-[60px] rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>
      )}
      <Image
        src={photoUrl}
        alt={`${name} profile photo`}
        width={60}
        height={60}
        className={`rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 ${
          imageLoading ? 'opacity-0' : 'opacity-100'
        } transition-opacity duration-200`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        unoptimized
      />
      {/* Optional: Add online status indicator */}
      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
    </div>
  );
}