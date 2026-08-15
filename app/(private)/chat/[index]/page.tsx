import { Suspense } from 'react';
import ChatPageRoot from '@/components/contents/chat/ChatPageRoot';
import ChatPageSkleton from '@/components/contents/skeleton/ChatPageSkleton';

interface ChatPageProps {
  params: Promise<{ index: string; }>;
  searchParams: Promise<{ [key: string]: string}>;
}

const ChatPage = ({params, searchParams}: ChatPageProps) => {
  return (
    <Suspense fallback={<ChatPageSkleton />}>
      <ChatPageRoot params={params}  searchParams={searchParams}/>
    </Suspense>
  )
}   

export default ChatPage;