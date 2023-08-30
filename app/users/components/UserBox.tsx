'use client';

import { User } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import Avatar from "@/app/components/Avatar";
import LoadingModal from "@/app/components/LoadingModal";

interface Props {
  data: User
}

const UserBox = ({ data }: Props) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const router = useRouter();

  const handleClick = useCallback(() => {
    setIsLoading(true);

    axios.post('/api/conversations', { userId: data.id })
      .then(data => {
        router.push(`/conversations/${data.data.id}`);
      })
      .catch((error) => console.log(error.message))
      .finally(() => setIsLoading(false));
  }, [data, router]);
  
  return (
    <>
      {isLoading && <LoadingModal />}
      <div 
        onClick={handleClick}
        className="w-full relative flex items-center space-x-3 bg-white p-3 hover:bg-neutral-100 rounded-lg transition cursor-pointer"
      >
        <Avatar user={data} />  
        <div className="min-w-0 flex-1">
          <div className="focus:outline-none">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium text-gray-900">
                {data.name} 
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default UserBox