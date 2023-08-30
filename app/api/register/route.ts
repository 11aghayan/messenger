import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

import prisma from '@/app/libs/prismadb';
import errorMessage from '@/app/libs/errorMessage';

export async function POST(req: Request) {
  try {
    const { email, name, password } = await req.json();

    if (!email || !name || !password) return NextResponse.json({msg: 'Missing Property'}, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword
      }
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error: unknown) {
    console.log('REGISTRATION ERROR', error);
    return NextResponse.json({ message: errorMessage(error) } , { status: 500 })
  }
}