import { NextResponse } from "next/server";

import prisma from '@/app/libs/prismadb';
import errorMessage from "@/app/libs/errorMessage";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { pusherServer } from "@/app/libs/pusher";

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await req.json();

    const {
      userId,
      isGroup,
      members,
      name
    } = body;

    if (!currentUser?.id || !currentUser?.email) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    if (isGroup && (!members || members.length < 2 || !name)) return NextResponse.json({ message: 'Invalid Data' }, { status: 400 }); 
    
    if (isGroup) {
      const newConversation = await prisma.conversation.create({
        data: {
          name,
          isGroup,
          users: {
            connect: [
              ...members.map((member: { value: string }) => ({
                id: member.value
              })),
              {
                id: currentUser.id
              }
            ]
          }
        },
        include: {
          users: true
        }
      });

      newConversation.users.forEach(user => {
        if (user.email) pusherServer.trigger(user.email, 'conversation:new', newConversation);
      })

      return NextResponse.json(newConversation, { status: 201 });
    }

    const existingConversations = await prisma.conversation.findMany({
      where: {
        OR: [
          {
            userIds: {
              equals: [currentUser.id, userId]
            }
          },
          {
            userIds: {
              equals: [userId, currentUser.id]
            }
          }
        ]
      }
    });

    const singleConversation = existingConversations[0];
    
    if (singleConversation) return NextResponse.json(singleConversation, { status: 200 });

    const newConversation = await prisma.conversation.create({
      data: {
        users: {
          connect: [
            {
              id: currentUser.id
            },
            {
              id: userId
            }
          ]
        }
      },
      include: {
        users: true
      }
    });

    newConversation.users.forEach(user => {
      if (user.email) pusherServer.trigger(user.email, 'conversation:new', newConversation)
    });

    return NextResponse.json(newConversation, { status: 201 });
  } catch (error: unknown) {
    console.log('CONVERSATION_POST', error);
    return NextResponse.json({ message: errorMessage(error) }, { status: 500 })
  }
}