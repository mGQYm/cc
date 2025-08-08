'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type { Route } from '@/types';

export default function MyRoutesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    loadRoutes();
  }, [session, status, router]);

  const loadRoutes = async () => {
    try {
      const response = await fetch(`/api/routes?user_id=${session?.user?.id}`);
      if (!response.ok) {
        throw new Error('Failed to load routes');
      }

      const { routes: userRoutes } = await response.json();
      setRoutes(userRoutes);
    } catch (error) {
      console.error('Error loading routes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRoute = async (id: string) => {
    if (!confirm('确定要删除这条路线吗？')) return;

    try {
      const response = await fetch(`/api/routes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete route');
      }

      setRoutes(routes.filter(route => route.id !== id));
    } catch (error) {
      console.error('Error deleting route:', error);
      alert('删除路线失败，请重试');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← 返回首页
              </button>
              <h1 className="text-2xl font-bold text-gray-900">我的路线</h1>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              创建新路线
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {routes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🗺️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">还没有创建路线</h2>
            <p className="text-gray-600 mb-4">开始创建你的第一条旅行路线吧！</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              开始创建
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes.map((route) => (
              <div key={route.id} className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{route.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{route.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">目的地：</span>
                    <span>{route.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">天数：</span>
                    <span>{route.total_days}天</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">创建时间：</span>
                    <span>{new Date(route.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => router.push(`/editor?id=${route.id}`)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDeleteRoute(route.id)}
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}