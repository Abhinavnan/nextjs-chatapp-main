'use client'
import { useEffect, useState } from 'react';
import posthog from 'posthog-js';
import TextareaAutosize from 'react-textarea-autosize';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { cn } from '@sglara/cn';
import { CircleArrowUp } from 'lucide-react';
import { Tooltip } from '@/components/util/utility-components';
import ChatView from './ChatView';
import { MessageInfo, Contact } from '@/components/util/types';
import useChat from '@/components/util/hooks/Chat-hook';
dayjs.extend(utc);

const ChatField = ({ contactData }: { contactData: Contact }) => {
  const { uniqueMessages, isContactAdded, chatRoom, index, chatSocket, sendMessage, handleUpdateMessages } = useChat(contactData);
  const [message, setMessage] = useState('');
  const unseenMessagesCount = uniqueMessages.filter((message: MessageInfo) => (!(message.userSentTime || message.seenTime))).length;

  useEffect(() => {
    if (isContactAdded && chatRoom && unseenMessagesCount > 0) {
        const timeOut = setTimeout(() => chatSocket.emit('mark-as-seen', chatRoom, index), 250);
        return () => clearTimeout(timeOut);
    }
  }, [unseenMessagesCount, isContactAdded, chatRoom]);

  const handleSendMessage = () => {
    const messageInfo: MessageInfo = {id: crypto.randomUUID(), refrenceId: crypto.randomUUID(), message, userSentTime: dayjs().utc().format()};
    posthog.capture('message_sent', {name: contactData.name, email: contactData.email});
    sendMessage(messageInfo);
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSendMessage();
    setMessage('');
  }

  const handleSendOnEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
      setMessage('');
    }
  }

  return (
    <div className="flex flex-col w-full h-[calc(100vh-11.5rem)] md:h-[calc(100vh-4rem)] p-2 gap-1 items-center">
      <ChatView index={index} messages={uniqueMessages} onSend={sendMessage} onLoadMoreMessages={handleUpdateMessages} />
      <form onSubmit={handleSubmit} className="relative w-[calc(100%-0.5rem)] mb-2">
        <TextareaAutosize id="message" name="message" placeholder="Type a message..." minRows={1} maxRows={5} required value={message}
          onChange={(e) => setMessage(e.target.value)}  onKeyDown={handleSendOnEnter}
          className={cn("textarea textarea-bordered bg-white opacity-80 p-2  rounded-sm border-2 border-blue-600 resize-none w-full", 
            "ring-2 ring-transparent focus:outline-blue-500 focus:ring-white min-h-10")}
        />
        <Tooltip text="Send message" className="w-fit ml-auto right-0 bottom-11 translate-none">
          <button type="submit" className="absolute bottom-2 right-2 cursor-pointer">
            <CircleArrowUp className="w-6 h-6 text-gray-500" />
          </button>
        </Tooltip>
      </form>
    </div>
  )
}

export default ChatField;
