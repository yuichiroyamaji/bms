"use client";

import React, { useState } from "react";
import { EngineerRating } from "../../types";

interface RatingReviewsProps {
  rating: EngineerRating;
  engineerName: string;
}

export default function RatingReviewsJa({ rating, engineerName }: RatingReviewsProps) {
  const [showReviews, setShowReviews] = useState(false);

  // Generate star display
  const renderStars = (ratingValue: number, size: 'sm' | 'md' = 'sm') => {
    const stars = [];
    const fullStars = Math.floor(ratingValue);
    const hasHalfStar = ratingValue % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg
          key={`full-${i}`}
          className={`${starSize} text-yellow-400 fill-current`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <div key="half" className={`${starSize} relative`}>
          <svg
            className={`${starSize} text-gray-300 fill-current absolute`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <svg
            className={`${starSize} text-yellow-400 fill-current absolute`}
            viewBox="0 0 20 20"
            style={{ clipPath: 'inset(0 50% 0 0)' }}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      );
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg
          key={`empty-${i}`}
          className={`${starSize} text-gray-300 fill-current`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    return stars;
  };

  // Get rating color based on score
  const getRatingColor = (score: number): string => {
    if (score >= 4.5) return 'text-green-600 dark:text-green-400';
    if (score >= 3.5) return 'text-blue-600 dark:text-blue-400';
    if (score >= 2.5) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 1.5) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full">
      {/* Main Rating Display */}
      <div className="flex flex-col items-center space-y-2">
        {/* Stars */}
        <div className="flex items-center space-x-1">
          {renderStars(rating.averageRating)}
        </div>

        {/* Rating Score */}
        <div className={`text-sm font-semibold ${getRatingColor(rating.averageRating)}`}>
          {rating.averageRating.toFixed(1)}/5
        </div>

        {/* Review Count */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {rating.totalReviews}件のレビュー
        </div>

        {/* Show Reviews Button */}
        {rating.reviews.length > 0 && (
          <button
            onClick={() => setShowReviews(!showReviews)}
            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            {showReviews ? 'レビューを非表示' : 'レビューを表示'}
          </button>
        )}
      </div>

      {/* Reviews Modal/Dropdown */}
      {showReviews && (
        <div className="absolute z-20 mt-2 w-80 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {engineerName}のレビュー
            </h4>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex items-center space-x-1">
                {renderStars(rating.averageRating, 'md')}
              </div>
              <span className={`text-sm font-medium ${getRatingColor(rating.averageRating)}`}>
                {rating.averageRating.toFixed(1)} / 5
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {rating.reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-white">
                      {review.reviewerName}
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      {renderStars(review.rating)}
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        {formatDate(review.date)}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {review.commentJa || review.comment}
                </p>
                {review.projectId && (
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    プロジェクトレビュー
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowReviews(false)}
            className="mt-3 w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            レビューを閉じる
          </button>
        </div>
      )}
    </div>
  );
}

