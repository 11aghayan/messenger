'use client';

import Image from 'next/image';

import Modal from '@/app/components/Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  src: string | null;
}

const ImageModal = ({ isOpen, onClose, src }: Props) => {
  if (!src) return null;
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className='w-80 h-80'>
        <Image 
          alt='Image'
          src={src}
          fill
          className='object-cover'
        />
      </div>
    </Modal>
  )
}

export default ImageModal