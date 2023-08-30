import { NextResponse } from "next/server";

import errorMessage from "@/app/libs/errorMessage";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from '@/app/libs/prismadb';
import { pusherServer } from "@/app/libs/pusher";


export async function POST(req: Request) {
  try {
    const { message, image, conversationId } = await req.json();
    const currentUser = await getCurrentUser();

    if (!currentUser?.id || !currentUser?.email) return NextResponse.json({ message: 'Unauthorized'}, { status: 401 });

    const newMessage = await prisma.message.create({
      data: {
        body: message,
        image,
        conversation: {
          connect: {
            id: conversationId
          }
        },
        sender: {
          connect: {
            id: currentUser.id
          }
        },
        seen: {
          connect: {
            id: currentUser.id
          }
        }
      },
      include: {
        seen: true,
        sender: true
      }
    });

    const updatedConversation = await prisma.conversation.update({
      where: {
        id: conversationId
      },
      data: {
        lastMessageAt: new Date(),
        messages: {
          connect: {
            id: newMessage.id
          }
        }
      },
      include: {
        users: true,
        messages: {
          include: {
            seen: true
          }
        }
      }
    });

    await pusherServer.trigger(conversationId, 'messages:new', newMessage);

    const lastMessage = updatedConversation.messages.at(-1);

    updatedConversation.users.map(user => {
      pusherServer.trigger(user.email!, 'conversation:update', {
        id: conversationId,
        messages: [lastMessage]
      })
    });

    return NextResponse.json(newMessage, { status: 201 });

  } catch (error: unknown) {
    console.log('MESSAGES', error);
    return NextResponse.json({ message: errorMessage(error) }, { status: 500 });
  }
}