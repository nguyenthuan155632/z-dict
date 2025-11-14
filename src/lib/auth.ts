import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { SessionProvider } from 'next-auth/react';
import { z } from 'zod';
import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

// Define the user type for better type safety
export interface CustomUser {
  id: string;
  email: string;
  name?: string;
}

// Client-safe auth configuration 
export const authOptions = {
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        try {
          const { email, password } = await z.object({
            email: z.string().email(),
            password: z.string().min(6),
          }).parseAsync(credentials);

          // Find user in database
          const user = await db.query.users.findFirst({
            where: eq(users.email, email),
          });

          if (!user || !user.password) {
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(password, user.password);

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt' as const,
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);

// Export SessionProvider for client-side components
export { SessionProvider };
