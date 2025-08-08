'use client';

import { getProviders, signIn, getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const [providers, setProviders] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProviders = async () => {
      const providers = await getProviders();
      setProviders(providers);
    };
    
    const fetchSession = async () => {
      const session = await getSession();
      setSession(session);
      if (session) {
        router.push('/');
      }
    };

    fetchProviders();
    fetchSession();
  }, [router]);

  if (session) return null;

  const getProviderIcon = (providerName: string) => {
    switch (providerName.toLowerCase()) {
      case 'google':
        return '🌈';
      case 'github':
        return '🐙';
      default:
        return '🔑';
    }
  };

  const getProviderColor = (providerName: string) => {
    switch (providerName.toLowerCase()) {
      case 'google':
        return 'bg-red-500 hover:bg-red-600';
      case 'github':
        return 'bg-gray-800 hover:bg-gray-900';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✈️</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            欢迎回来
          </h2>
          <p className="text-gray-600">
            登录 TripCraft，开始您的旅行规划之旅
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="space-y-4">
            {providers &&
              Object.values(providers).map((provider: any) => (
                <button
                  key={provider.name}
                  onClick={() => signIn(provider.id, { callbackUrl: '/' })}
                  className={`w-full flex items-center justify-center py-3 px-4 rounded-lg text-white font-medium transition-colors ${getProviderColor(provider.name)}`}
                >
                  <span className="mr-2 text-xl">{getProviderIcon(provider.name)}</span>
                  使用 {provider.name} 登录
                </button>
              ))}
            
            {!providers && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">正在加载登录选项...</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              通过点击登录，即表示您同意我们的服务条款和隐私政策
            </p>
          </div>
        </div>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            还没有账户？
            <span className="text-blue-600 font-medium ml-1">
              无需注册，使用社交账号一键登录
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}