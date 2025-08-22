'use client';

import { useState, useEffect } from 'react';

export default function LogoTest() {
  const [logoStatus, setLogoStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [logoUrl, setLogoUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.protocol}//${window.location.host}/WellSpace_logo.png`;
      setLogoUrl(url);
      
      const testImg = new Image();
      testImg.onload = () => setLogoStatus('success');
      testImg.onerror = () => setLogoStatus('error');
      testImg.src = url;
    }
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 p-4 bg-white border border-gray-300 rounded-lg shadow-lg">
      <h3 className="font-bold mb-2">Logo Test</h3>
      <div className="space-y-2 text-sm">
        <p><strong>URL:</strong> {logoUrl}</p>
        <p><strong>Status:</strong> 
          <span className={`ml-1 px-2 py-1 rounded text-xs ${
            logoStatus === 'loading' ? 'bg-yellow-100 text-yellow-800' :
            logoStatus === 'success' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {logoStatus === 'loading' ? '🔄 Loading...' :
             logoStatus === 'success' ? '✅ Success' :
             '❌ Error'}
          </span>
        </p>
        {logoStatus === 'success' && (
          <div className="w-16 h-16 border border-gray-300 rounded overflow-hidden">
            <img 
              src={logoUrl} 
              alt="WellSpace Logo Test" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
}
