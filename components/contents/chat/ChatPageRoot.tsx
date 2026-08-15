import ContactDetails from '@/components/contents/contact/ContactDetails';
import ChatField from '@/components/contents/chat/ChatField';
import { getReceiverDetailsByIndex, getAllMessages } from '@/components/lib/services/contactServices';
import { validateTokenServerSide } from '@/components/lib/actions/authAction';
import { getUserDetailsByEmail } from '@/components/lib/services/userServices';
import { sanitiseContactData, sanitiseMessages } from '@/components/util/utility-functions';
import { MessageInfo, Contact } from '@/components/util/types';

interface ChatPageProps {
  params: Promise<{ index: string; }>;
  searchParams: Promise<{ [key: string]: string}>;
}

const ChatPageRoot = async ({params, searchParams}: ChatPageProps) => {
  const { userId } = await validateTokenServerSide(false);
  const { index } = await params;
  let receiverData, contactMessages: MessageInfo[] = [];
  if(index === 'new'){
    const { email } = await searchParams;
    receiverData = await getUserDetailsByEmail(email);
  }else{
    receiverData = await getReceiverDetailsByIndex(userId, Number(index));
    contactMessages = await getAllMessages(userId, receiverData.id) as MessageInfo[];
  }
  const contactData: Contact = sanitiseContactData(receiverData);
  contactData.messages = sanitiseMessages(contactMessages, userId);
  
  return (
    <div className="flex flex-col md:flex-row flex-1">
      <ContactDetails type="chat" contactData={contactData} />
      <ChatField contactData={contactData} />
    </div>
  )
}  

export default ChatPageRoot;
