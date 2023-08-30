'use client'

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { MdOutlineGroupAdd} from 'react-icons/md';
import { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { find } from "lodash";

import { fullConversationType } from "@/app/types";
import useConversation from "@/app/hooks/useConversation";
import { pusherClient } from "@/app/libs/pusher";

import ConversationBox from "./ConversationBox";
import GroupChatModal from "./GroupChatModal";

interface Props {
  initialItems: fullConversationType[];
  users: User[];
}

const ConversationList = ({ initialItems, users }: Props) => {
  const [items, setItems] = useState<fullConversationType[]>(initialItems);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const session = useSession();

  const router = useRouter();

  const { conversationId, isOpen} = useConversation();

  const pusherKey = useMemo(() => session.data?.user?.email, [session.data?.user?.email]);

  useEffect(() => {
    if (!pusherKey) return;

    pusherClient.subscribe(pusherKey);

    const newHandler = (conversation: fullConversationType) => {
      setItems(current => {
        if (find(current, { id: conversation.id})) return current;

        return [conversation, ...current];
      })
    };

    const updateHandler = (conversation: fullConversationType) => {
      setItems(current => current.map(currentConversation => {
        if (currentConversation.id === conversation.id) {
          return { 
            ...currentConversation, 
            messages: conversation.messages
          }
        }

        return currentConversation;
      }))
    };

    const removeHandler = (conversation: fullConversationType) => {
      setItems(current => current.filter(c => c.id !== conversation.id));

      if (conversationId === conversation.id) router.push('/conversations');
    };
    
    pusherClient.bind('conversation:new', newHandler);
    pusherClient.bind('conversation:update', updateHandler);
    pusherClient.bind('conversation:remove', removeHandler);

    return () => {
      pusherClient.unsubscribe(pusherKey);
      pusherClient.unbind('conversation:new', newHandler);
      pusherClient.unbind('conversation:update', newHandler);
      pusherClient.unbind('conversation:remove', removeHandler);
    }
  }, [pusherKey, conversationId, router]);
  
  return (
    <>
      <GroupChatModal 
        users={users} 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <aside className={clsx('fixed inset-y-0 pb-20 lg:pb-0 lg:left-20 lg:w-80 lg:block overflow-y-auto border-r border-gray-200', isOpen ? 'hidden' : 'block w-full left-0')}>
        <div className="px-5">
          <div className="flex justify-between mb-4 pt-4">
            <div className="text-2xl font-bold text-neutral-800">
              Messages
            </div>
            <div 
              onClick={() => setIsModalOpen(true)}
              className="rounded-full p-2 bg-gray-100 text-gray-600 cursor-pointer hover:opacity-75 transition"
            > 
            <MdOutlineGroupAdd size={20} /> 
            </div>
          </div>
          {
            items.map(item => (
              <ConversationBox 
                key={item.id}
                data={item}
                selected={conversationId ===  item.id}
              />
            ))
          }
        </div>
      </aside>
    </>
  )
}

export default ConversationList