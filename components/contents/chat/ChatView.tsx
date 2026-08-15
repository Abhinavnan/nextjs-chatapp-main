import { useRef, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Check, CheckCheck, Clock, Info, RotateCcw } from 'lucide-react';
import { cn } from '@sglara/cn';
import { toast } from 'react-hot-toast';
import { MessageInfo } from '@/components/util/types';
import { Tooltip, errorToast } from '@/components/util/utility-components';
import useHttp from '@/components/util/hooks/Http-hook';

interface ChatViewProps {
  index: number;
  messages: MessageInfo[];
  onSend: (messageInfo: MessageInfo) => void
  onLoadMoreMessages: (messageInfo: MessageInfo[]) => void
}

const inconStyle = "w-3 h-3 text-gray-500";

const ChatView = ({ index, messages, onSend, onLoadMoreMessages }: ChatViewProps) => {
  const { sendRequest, isLoading } = useHttp();
  const [hasMore, setHasMore] = useState(true);
  const scorllref = useRef<HTMLSpanElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const showLastMessageInfo = !hasMore && messages.length > 11;
  const newMessagesCount = messages.filter((messageInfo) => !messageInfo.seenTime).length;
  const sortedMessage = messages.sort((a, b) => 
    dayjs(a.sentTime || a.userSentTime).valueOf() - dayjs(b.sentTime || b.userSentTime).valueOf());

  useEffect(() => {
    if (scorllref.current) {
      scorllref.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [newMessagesCount]);

  const handleResendMessage = ({error, ...rest}: MessageInfo) => onSend(rest);
  
  const showChatProgress = ({receivedTime, sentTime, userSentTime, seenTime}: MessageInfo) => {
    const iconType = [ 
      seenTime && <CheckCheck className={cn(inconStyle, "text-blue-600" )}/>, 
      receivedTime && <CheckCheck className={cn(inconStyle)}/>, 
      sentTime && <Check className={cn(inconStyle)}/>, 
      userSentTime && <Clock className={cn(inconStyle, "animate-spin")}/>
    ].filter(Boolean)[0];
    return iconType;
  }

  const showMessageTime = ({receivedTime, sentTime, userSentTime}: MessageInfo) => {
    const messageTime = [sentTime, userSentTime, receivedTime].filter(Boolean)[0];;
    if(dayjs().format('DD/MM/YYYY') === dayjs(messageTime).format('DD/MM/YYYY')){
      return dayjs(messageTime).format('hh:mm A');
    }else{
      return dayjs(messageTime).format('DD/MM/YYYY hh:mm A');
    } 
  }

  const handleScroll = async () => {
    const elelemt = scrollContainerRef.current;
    const cursor = sortedMessage[0].id;
    const limit = 12;
    if (!elelemt || isLoading || !hasMore ) {
      return;
    }
    if (elelemt.scrollTop < 100) {
      try{
        const oldMessages = await sendRequest('get', '/contact/chats', { index, cursor, limit });
        if (oldMessages.length < limit) {
          setHasMore(false);
          toast.success('All messages are loaded');
        }
        onLoadMoreMessages(oldMessages);
      }catch(err){
        errorToast(err, 'Failed to load more messages');
      }
    }
  };

  return (
    <div ref={scrollContainerRef} onScroll={handleScroll}
      className="flex-1 flex flex-col gap-2 overflow-y-auto h-full w-full">
      {isLoading  && <span className="loading loading-dots loading-sm self-center bg-gray-400" />}
      {showLastMessageInfo && 
        <div className="flex items-center gap-2 mx-4">
          <span className ="bg-gray-300 h-0.5 w-full"/> 
          <p className="text-center text-gray-400 text-sm">end</p>
          <span className ="bg-gray-300 h-0.5 w-full"/>
        </div>
      }
      {sortedMessage.map((messageInfo) => (
        <div key={messageInfo.id} className={cn("flex flex-col items-start max-w-3/4 p-1 rounded-md shadow-md relative", 
          messageInfo.userSentTime ? "ml-auto bg-sky-200 shadow-sky-100" : "mr-auto bg-green-200")}>
          <div className={messageInfo.error ? "flex flex-row gap-1 items-center absolute right-20" : "hidden"}>
            <Tooltip text='Resend message' className="mb-1">
              <button onClick={() => handleResendMessage(messageInfo)}>
                <RotateCcw className="size-5 text-slate-500" />
              </button>
            </Tooltip>
            <Tooltip text={messageInfo.error || ''} className="mb-1">
              <Info className="size-5 text-white bg-red-500 rounded-full" />
            </Tooltip>
          </div>
          <p className="text-sm text-gray-800 leading-relaxed">{messageInfo.message}</p>
          <div className={cn("flex flex-row gap-1 items-center", messageInfo.userSentTime ? "self-end" : "self-start")}>
            {messageInfo.userSentTime && showChatProgress(messageInfo)}
            <p className="text-xs text-gray-500">{showMessageTime(messageInfo)}</p>
          </div>
        </div>
      ))}
      <span ref={scorllref} />
    </div>
  )
}

export default ChatView;
