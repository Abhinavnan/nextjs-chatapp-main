'use client'
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { cn } from '@sglara/cn';
import { Tooltip } from '@/components/util/utility-components';
import useChat from '@/components/util/hooks/Chat-hook';
import { Contact } from '@/components/util/types';

interface MessageCountProps {
    contact: Contact;
    className?: string;
}

const MessageCount = ({ contact, className } : MessageCountProps) => {
  const { chatRoom, index, chatSocket } = useChat(contact);
  const [messageCount, setMessageCount] = useState(0);

  const handleMessageCount = (senderIndex: number, count: number) => {
    if (senderIndex === index) {
      setMessageCount(count);
    }
  }

  useEffect(() => {
      const timeOut = setTimeout(() => chatSocket.emit('get-unseen-message-count', index, setMessageCount), 250);
      return () => clearTimeout(timeOut);
  }, [chatSocket]);

  useEffect(() => {
    if (chatRoom) {
      const timeOut = setTimeout(() => chatSocket.emit('mark-as-received', chatRoom, index), 250);
      return () => clearTimeout(timeOut);
    }
  }, [chatSocket, chatRoom, messageCount, index]);

  useEffect(() => {
    chatSocket.on('unseen-message-count', handleMessageCount);
    return () => { chatSocket.off('unseen-message-count', handleMessageCount); }
  }, [chatSocket]);
    

  if(messageCount === 0){
    return <></>
  }
  
  return (
    <Tooltip text={ messageCount + ' unread messages'} className="mb-1">
      <Link href={`/chat/${index}`} 
       className={cn("w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full text-center text-sm text-white", className)}>
        {messageCount}
      </Link>
    </Tooltip>
  )
}

export default MessageCount;
