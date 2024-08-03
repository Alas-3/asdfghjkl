// components/SkeletonLoader.js
import React from 'react';

const SkeletonLoader = () => (
  <div className="flex justify-center">
    <div className="card bg-base-100 shadow-lg animate-pulse rounded-lg overflow-hidden" style={{ width: '200px' }}>
      <figure className="h-64 w-full bg-gray-200"></figure>
      <div className="p-2">
        <h2 className="h-6 bg-gray-200 rounded w-3/4"></h2>
        <h3 className="h-4 bg-gray-200 rounded w-1/2 mt-2"></h3>
      </div>
    </div>
  </div>
);

export default SkeletonLoader;
