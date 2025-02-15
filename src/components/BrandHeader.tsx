import React from 'react';
import { Store } from 'lucide-react';

function BrandHeader() {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-3">
          <Store className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            {import.meta.env.VITE_BRAND_NAME}
          </h1>
        </div>
      </div>
    </div>
  );
}

export default BrandHeader;