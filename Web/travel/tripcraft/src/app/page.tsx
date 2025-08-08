'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import DestinationInput from '@/components/DestinationInput';
import PreferencesSelector from '@/components/PreferencesSelector';
import RouteCard from '@/components/RouteCard';
import { RouteGenerator } from '@/lib/route-generator';
import type { Route, RouteGenerationRequest } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [destination, setDestination] = useState('');
  const [preferences, setPreferences] = useState({
    days: 3,
    interests: [] as string[],
    budgetLevel: 2 as 1 | 2 | 3,
  });
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleGenerateRoutes = async () => {
    if (!destination.trim()) return;

    setIsLoading(true);
    
    try {
      const request: RouteGenerationRequest = {
        location: destination,
        days: preferences.days,
        interests: preferences.interests,
        budget_level: preferences.budgetLevel,
      };

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to generate routes');
      }

      const { routes } = await response.json();
      setRoutes(routes);
      setShowResults(true);
    } catch (error) {
      console.error('Error generating routes:', error);
      alert('生成路线失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRoute = async (route: Route) => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    
    try {
      // Save route to database
      const response = await fetch('/api/routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: route.title,
          description: route.description,
          location: route.location,
          days: route.days,
          total_days: route.total_days,
          interests: route.interests,
          budget_level: route.budget_level,
          user_id: session.user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save route');
      }

      const { route: savedRoute } = await response.json();
      
      // Redirect to editor with route ID
      router.push(`/editor?id=${savedRoute.id}`);
    } catch (error) {
      console.error('Error saving route:', error);
      alert('保存路线失败，请重试');
    }
  };

  const UserMenu = () => {
    if (status === 'loading') {
      return (
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
      );
    }

    if (session?.user) {
      return (
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {session.user.image && (
              <img 
                src={session.user.image} 
                alt={session.user.name || 'User'} 
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="text-sm text-gray-700 hidden md:block">
              {session.user.name || session.user.email}
            </span>
          </div>
          <button
            onClick={() => signOut()}
            className="text-sm text-red-600 hover:text-red-800 transition-colors"
          >
            退出
          </button>
        </div>
      );
    }

    return (
      <div className="flex space-x-4">
        <button
          onClick={() => signIn()}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          登录
        </button>
        <button
          onClick={() => signIn()}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          注册
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-blue-600">
              TripCraft
            </div>
            <nav className="flex items-center space-x-6">
              <a href="#" className="text-gray-600 hover:text-blue-600">
                首页
              </a>
              {session && (
                <a href="/my-routes" className="text-gray-600 hover:text-blue-600">
                  我的路线
                </a>
              )}
              <a href="#" className="text-gray-600 hover:text-blue-600">
                帮助
              </a>
              <UserMenu />
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            规划你的完美旅程
          </h1>
          <p className="text-xl mb-8 text-blue-100">
            智能AI推荐，个性化路线定制，让旅行更简单
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {!showResults ? (
          /* Input Section */
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
            <div className="space-y-8">
              {/* Destination Input */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  目的地
                </label>
                <DestinationInput
                  value={destination}
                  onDestinationChange={setDestination}
                />
              </div>

              {/* Preferences */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  旅行偏好
                </label>
                <PreferencesSelector
                  values={preferences}
                  onPreferencesChange={setPreferences}
                />
              </div>

              {/* Generate Button */}
              <div className="text-center">
                <button
                  onClick={handleGenerateRoutes}
                  disabled={!destination.trim() || isLoading}
                  className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? '生成中...' : '生成路线方案'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Results Section */
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {destination}的推荐路线
                </h2>
                <p className="text-gray-600 mt-1">
                  为您精选{routes.length}条路线方案
                </p>
              </div>
              <button
                onClick={() => setShowResults(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                重新选择
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {routes.map((route) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  onSelect={handleSelectRoute}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Features Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              为什么选择TripCraft
            </h2>
            <p className="text-lg text-gray-600">
              让每一次旅行都成为美好回忆
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">智能推荐</h3>
              <p className="text-gray-600">
                AI算法为您量身定制最适合的旅行路线
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✏️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">自由编辑</h3>
              <p className="text-gray-600">
                拖拽式编辑，随时调整行程安排
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">一键分享</h3>
              <p className="text-gray-600">
                轻松分享给好友，一起规划完美旅程
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 TripCraft. 让旅行更简单。
          </p>
        </div>
      </footer>
    </div>
  );
}
