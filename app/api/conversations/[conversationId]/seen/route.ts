import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import errorMessage from "@/app/libs/errorMessage";
import prisma from '@/app/libs/prismadb';
import { pusherServer } from "@/app/libs/pusher";

interface Params {
  params: {
    conversationId?: string;
  }
}

export async function POST(req: Request, { params: { conversationId } }: Params) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser?.id || !currentUser?.email) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId
      },
      include: {
        messages: {
          include: {
            seen: true
          }
        },
        users: true
      }
    });

    if (!conversation) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });

    const lastMessage = conversation.messages.at(-1);

    if (!lastMessage) return NextResponse.json(conversation, { status: 200 });

    const updatedMessage = await prisma.message.update({
      where: {
        id: lastMessage.id
      },
      include: {
        sender: true,
        seen: true
      },
      data: {
        seen: {
          connect: {
            id: currentUser.id
          }
        }
      }
    });

    await pusherServer.trigger(currentUser.email, 'conversation:update', {
      id: conversationId,
      messages: [updatedMessage]
    });

    if (lastMessage.seenIds.indexOf(currentUser.id) !== -1) return NextResponse.json(conversation, { status: 200 });

    await pusherServer.trigger(conversationId!, 'message:update', updatedMessage);

    return NextResponse.json(updatedMessage, { status: 200 });
  } catch (error: unknown) {
    console.log("MESSAGES_SEEN", error);
    return NextResponse.json({ message: errorMessage(error) }, { status: 500 });
  }
}