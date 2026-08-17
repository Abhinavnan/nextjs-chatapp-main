import Image from 'next/image';
import { cn } from '@sglara/cn';
import { Tooltip } from '@/components/util/utility-components';
import { shrinkText } from '@/components/util/utility-functions';
import DummyProfile from "@/public/dummy-profile.svg";
import { Contact } from '@/components/util/types';
import Status from './Status';
import MessageCount from './MessageCount';
import Chat from './Chat';
import ContactInfo from './ContactInfo';
import LastSceen from './LastSceen';

interface ContactCardProps {
    contact: Contact;
}

const ContactCard = ({ contact }: ContactCardProps) => {
    return (
        <li key={contact.index}
            className={cn("flex items-center space-x-4 p-4 bg-mist-50 rounded-lg shadow hover:bg-gray-50 w-full sm:w-75 h-full",
                "dark:bg-mist-950 dark:hover:bg-mist-900",
            )}>
            <Image src={contact.profilePicture || DummyProfile} alt={contact.name} width={64} height={64} loading='eager'
                className="w-16 h-16 aspect-square object-cover object-top rounded-full" />
            <div className="flex flex-col w-full">
                <Tooltip text={contact.name}>
                    <p className="text-lg font-semibold">{shrinkText(contact.name, 20)}</p>
                </Tooltip>
                <Tooltip text={contact.email}>
                    <p className="text-sm text-gray-500">{shrinkText(contact.email, 20)}</p>
                </Tooltip>
                <div className="flex items-center justify-between gap-2 mt-1 w-full">
                    <Status contact={contact} />
                    <div className="flex items-center gap-2">
                        <MessageCount contact={contact} />
                        <Chat contact={contact} className="w-6 h-6" />
                        <ContactInfo contact={contact} className="w-6 h-6" />
                    </div>
                </div>
                <LastSceen contact={contact} />
            </div>
        </li>
    )
}

export default ContactCard;
