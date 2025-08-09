import { NextAuthOptions } from 'next-auth';

// 简化的MVP认证配置，仅用于演示
export const authOptions: NextAuthOptions = {
  providers: [], // 空提供商列表，允许匿名访问
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session }) {
      // 为MVP创建模拟用户
      session.user = { 
        id: 'demo_user_id', 
        name: 'Demo User', 
        email: 'demo@example.com' 
      };
      return session;
    },
    async jwt({ token }) {
      token.sub = 'demo_user_id';
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET || 'demo-secret-for-mvp',
};