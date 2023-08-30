import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import errorMessage from "@/app/libs/errorMessage";
import prisma from '@/app/libs/prismadb';

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    const {name, image} = await req.json();

    if (!currentUser?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const updatedUser = await prisma.user.update({
      where: {
        id: currentUser.id
      },
      data: {
        image,
        name
      }
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error: any) {
    console.log('SETTINGS', error);
    return NextResponse.json({ message: errorMessage(error) }, { status: 500 });
  }
}