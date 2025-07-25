import React from 'react';

export const TestStyles: React.FC = () => {
  return (
    <div className="p-4 bg-blue-500 text-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-2">Tailwind CSS Test</h1>
      <p className="text-blue-100">
        If you can see this styled properly, Tailwind CSS is working!
      </p>
      <button className="mt-4 px-4 py-2 bg-white text-blue-500 rounded hover:bg-gray-100 transition-colors">
        Test Button
      </button>
    </div>
  );
};