import Link from 'next/link';
import { cn } from '@sglara/cn';
import { MessageSquare } from 'lucide-react';
import { Tooltip } from '@/components/util/utility-components';
import { Contact } from '@/components/util/types';

interface ChatProps {
  contact: Contact;
  className?: string;
}

const Chat = ({contact, className}: ChatProps) => {
  const { index, name } = contact; 
  
  return (
      <Tooltip text={`Chat with ${name}`} >
        <Link href={`/chat/${index}`}>
            <MessageSquare className={cn("w-5 h-5 text-gray-500", className)} />
        </Link>
      </Tooltip>
  )
}

export default Chat;
