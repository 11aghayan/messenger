import { NextResponse } from "next/server";

import errorMessage from "@/app/libs/errorMessage";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from '@/app/libs/prismadb';
import { pusherServer } from "@/app/libs/pusher";

interface Params {
  params: {
    conversationId?: string;
  }
}


export async function DELETE(req: Request, { params: { conversationId } }: Params) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) return NextResponse.json({ message: 'Unauthorized'}, { status: 401 });

    const existingConversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId
      },
      include: {
        users: true
      }
    });

    if (!existingConversation) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });

    const deletedConversation = await prisma.conversation.delete({
      where: {
        id: conversationId,
        userIds: {
          hasSome: [currentUser.id]
        }
      }
    });

    existingConversation.users.forEach(user => {
      if (user.email) {
        pusherServer.trigger(user.email, 'conversation:remove', existingConversation);
      }
    });

    return NextResponse.json(deletedConversation, { status: 200 });
  } catch (error: unknown) {
    console.log('CONVERSATION_DELETE',error);
    return NextResponse.json({ message: errorMessage(error) }, { status: 500 })
  }
}