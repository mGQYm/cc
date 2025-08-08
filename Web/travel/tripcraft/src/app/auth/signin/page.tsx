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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            登录 TripCraft
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            开始规划您的完美旅程
          </p>
        </div>
        <div className="mt-8 bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
          <div className="space-y-6">
            {providers &&
              Object.values(providers).map((provider: any) => (
                <div key={provider.name}>
                  <button
                    onClick={() => signIn(provider.id, { callbackUrl: '/' })}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    使用 {provider.name} 登录
                  </button>
                </div>
              ))}
            
            {!providers && (
              <div className="text-center text-gray-500">
                正在加载登录选项...
              </div>
            )}
          </div>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  无需注册，一键登录
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}