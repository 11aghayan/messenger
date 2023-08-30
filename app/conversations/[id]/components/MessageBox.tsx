'use client';

import { useState } from 'react';
import { useSession } from "next-auth/react";
import clsx from "clsx";
import { format } from "date-fns";
import Image from "next/image";

import { FullMessageType } from "@/app/types";
import Avatar from "@/app/components/Avatar";

import ImageModal from './ImageModal';

interface Props {
  isLast: boolean;
  data: FullMessageType;
}

const MessageBox = ({ isLast, data }: Props) => {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  
  const session = useSession();

  const isOwn = session?.data?.user?.email === data?.sender?.email;
  const seenList = (data.seen || [])
    .filter(user => user.email !== data?.sender?.email)
    .map(user => user.name)
    .join(', ');

  const classes = {
    container: clsx('flex gap-3 p-4', isOwn && 'justify-end'),
    avatar: clsx(isOwn && 'order-2'),
    body: clsx('flex flex-col gap-2', isOwn && 'items-end'),
    message: clsx('text-sm w-fit overflow-hidden', isOwn ? 'bg-sky-500 text-white' : 'bg-gray-100', data.image ? 'rounded-md p-0' : 'rounded-full py-2 px-3'),
  }
    
  return (
    <div className={classes.container}>
      <div className={classes.avatar}>
        <Avatar user={data.sender} />
      </div>
      <div className={classes.body}>
        <div className="flex items-center gap-1">
          <div className="text-sm text-gray-500">
            {data.sender.name}
          </div>
          <div className="text-xs text-gray-400 ">
            {format(new Date(data.createdAt), 'Pp')}
          </div>
        </div>
        <div className={classes.message}>
          <ImageModal 
            src={data.image}
            isOpen={imageModalOpen}
            onClose={() => setImageModalOpen(false)}
          />
          {
            data.image 
            ? 
            (
              <Image 
                onClick={() => setImageModalOpen(true)}
                alt="Image"
                height={288}
                width={288}
                src={data.image}
                className="object-cover cursor-pointer hover:scale-110 transition"
              />
            )
            :
            <div>{data.body}</div>
          }
        </div>
        {isLast && isOwn && seenList.length > 0 && (
          <div className="text-xs font-light text-gray-500">
            {`Seen by ${seenList}`}
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageBox