import React from 'react';

export const PDFCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
          <div className="ml-3 flex-1">
            <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
        <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-2">
          <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
          <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
          <div className="w-20 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="w-24 h-4 bg-gray-200 rounded"></div>
      </div>
      
      <div className="flex space-x-2">
        <div className="flex-1 h-9 bg-gray-200 rounded-lg"></div>
        <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
        <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
        <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
};

export const PDFListSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <PDFCardSkeleton key={index} />
      ))}
    </div>
  );
};

export const PDFHeaderSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-5 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="flex space-x-3">
          <div className="w-32 h-10 bg-gray-200 rounded-lg"></div>
          <div className="w-28 h-10 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="ml-4">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded-lg"></div>
          </div>
          <div>
            <div className="h-5 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded-lg"></div>
          </div>
          <div>
            <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded-lg mt-6"></div>
        </div>
      </div>
    </div>
  );
};

export const PDFFilterSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded-lg"></div>
        </div>
        <div>
          <div className="h-5 bg-gray-200 rounded w-20 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded-lg"></div>
        </div>
        <div>
          <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
};