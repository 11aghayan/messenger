'use client'

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { FiAlertTriangle } from 'react-icons/fi';
import { Dialog } from '@headlessui/react';

import Modal from "@/app/components/Modal";
import useConversation from "@/app/hooks/useConversation";
import Button from "@/app/components/Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ConfirmModal = ({ isOpen, onClose }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { conversationId } = useConversation();
  
  const onDelete = useCallback(() => {
    setIsLoading(true);

    axios.delete(`/api/conversations/${conversationId}`)
      .then(() => {
        router.push('/conversations');
      })
      .catch(() => {
        toast.error('Something went wrong')
      })
      .finally(() => setIsLoading(false));
  }, [conversationId, router]);

  return (
    <Modal
      onClose={onClose}
      isOpen={isOpen}
    >
      <div className="sm:flex sm:items-start">
        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-start justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10">
          <FiAlertTriangle className='h-6 w-6 text-red-600' />
        </div>
        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
          <Dialog.Title
            as="h3"
            className='text-base font-semibold leading-6 text-gray-900'
          >
            Delete Conversation
          </Dialog.Title>
          <div className="mt-2">
            <p className="text-sm text-gray-800">
              Are you sure you want to delete this conversation?
              <br />
              <span className="font-bold text-gray-900 uppercase">this action cannot be undone</span>
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <Button 
          disabled={isLoading}
          danger
          onClick={onDelete}
        >
          Delete
        </Button>
        <Button 
          disabled={isLoading}
          secondary
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
    </Modal>
  )
}

export default ConfirmModal