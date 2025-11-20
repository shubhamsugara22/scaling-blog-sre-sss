import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import { getDatabase } from './db';
import { loginSchema } from './types';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        try {
          // Validate credentials
          const { email, password } = loginSchema.parse(credentials);

          // Get user from database
          const db = getDatabase();
          const user = db
            .prepare('SELECT * FROM users WHERE email = ?')
            .get(email) as any;

          if (!user) {
            return null;
          }

          // Verify password
          const isValid = await bcrypt.compare(password, user.password_hash);
          if (!isValid) {
            return null;
          }

          return {
            id: user.id.toString(),
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});
