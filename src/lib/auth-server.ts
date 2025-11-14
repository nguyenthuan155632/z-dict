import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Server-side auth configuration with database logic
export const serverAuthOptions = {
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const { email, password } = loginSchema.parse(credentials);

          // Import database only when needed (server-side only)
          const { db } = await import('@/db');
          const { users } = await import('@/db/schema');
          const { eq } = await import('drizzle-orm');

          const user = await db.query.users.findFirst({
            where: eq(users.email, email),
          });

          if (!user) {
            return null;
          }

          const isValidPassword = await bcrypt.compare(password, user.password);

          if (!isValidPassword) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error('Auth error:', error);
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

// Create the auth handler for NextAuth v5
export const { handlers, auth, signIn, signOut } = NextAuth(serverAuthOptions);

// Server-side auth function for API routes using correct NextAuth v5 pattern
export async function serverAuth() {
  try {
    // In NextAuth v5, we use the auth function from the handlers
    return await auth();
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}
