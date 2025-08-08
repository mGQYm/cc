'use client';

import { useState } from 'react';
import type { Route } from '@/types';

interface RouteToolbarProps {
  route: Route;
  onSave: (route: Route) => void;
}

export function RouteToolbar({ route, onSave }: RouteToolbarProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedRoute = {
      ...route,
      updated_at: new Date().toISOString()
    };
    
    onSave(updatedRoute);
    setIsSaving(false);
    setShowSaveSuccess(true);
    
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/share/${route.id}`;
    setShareUrl(url);
    setShowShareModal(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    
    // Show temporary success message
    const button = document.getElementById('copy-button');
    if (button) {
      button.textContent = '已复制!';
      setTimeout(() => {
        button.textContent = '复制链接';
      }, 2000);
    }
  };

  const handleDownload = () => {
    const routeData = {
      ...route,
      export_date: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(routeData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${route.title.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTotalDuration = () => {
    return route.days.reduce((total, day) => 
      total + day.spots.reduce((dayTotal, spot) => dayTotal + spot.duration, 0), 0
    );
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`;
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Stats */}
      <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          <span>📅</span>
          <span>{route.total_days}天</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>⏱️</span>
          <span>{formatDuration(getTotalDuration())}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>📍</span>
          <span>{route.days.reduce((sum, day) => sum + day.spots.length, 0)}个景点</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            isSaving 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSaving ? '保存中...' : showSaveSuccess ? '已保存!' : '保存路线'}
        </button>
        
        <button
          onClick={handleShare}
          className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
        >
          分享
        </button>
        
        <button
          onClick={handleDownload}
          className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          导出
        </button>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">分享路线</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分享链接
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                  />
                  <button
                    id="copy-button"
                    onClick={handleCopyLink}
                    className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    复制链接
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  社交分享
                </label>
                <div className="flex space-x-2">
                  <button className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors">
                    微信分享
                  </button>
                  <button className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors">
                    微博分享
                  </button>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 text-center">
                任何人访问此链接都可以查看您的路线
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}