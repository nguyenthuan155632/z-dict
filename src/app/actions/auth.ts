'use server';

import { signIn, signOut } from '@/lib/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { AuthError } from 'next-auth';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function signup(formData: FormData) {
  try {
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      name: formData.get('name') as string,
    };

    const validated = signupSchema.parse(data);

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, validated.email),
    });

    if (existingUser) {
      return { error: 'User with this email already exists' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    // Create user
    await db.insert(users).values({
      email: validated.email,
      password: hashedPassword,
      name: validated.name,
    });

    // Sign in the user
    await signIn('credentials', {
      email: validated.email,
      password: validated.password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    return { error: 'An error occurred during signup' };
  }
}

export async function login(formData: FormData) {
  try {
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    const validated = loginSchema.parse(data);

    await signIn('credentials', {
      email: validated.email,
      password: validated.password,
      redirectTo: '/',
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Invalid email or password' };
    }
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: '/login' });
}

