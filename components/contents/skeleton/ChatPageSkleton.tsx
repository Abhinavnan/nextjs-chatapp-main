import React from 'react'
import ChatField from '@/components/contents/chat/ChatField';
import ProfilePageSkeleton from './ProfilePageSkeleton';

const contactData = {
    id: 'sample',
    index: 2,
    name: 'Chat Skeleton',
    email: 'chatskeleton@gmail.com',
    profilePicture: 'https://smapleimage.com'
}

const ChatPageSkleton = () => {
  return (
    <div className="flex flex-col md:flex-row flex-1">
        <ProfilePageSkeleton type='chat' />
        <ChatField contactData={contactData} />
    </div>
  )
}

export default ChatPageSkleton;
