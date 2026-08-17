import Image from 'next/image';
import { cn } from '@sglara/cn';
import Status from '@/components/contents/contact/Status';
import Chat from '@/components/contents/contact/Chat';
import ContactInfo from '@/components/contents/contact/ContactInfo';
import LastSceen from '@/components/contents/contact/LastSceen';
import DummyProfile from "@/public/dummy-profile.svg";
import { Contact } from '@/components/util/types';
import { shrinkText } from '@/components/util/utility-functions';
import { Tooltip } from '@/components/util/utility-components';

interface ContactDetailsProps {
    type: 'chat' | 'contact';
    contactData: Contact
}

const componentStyle: Record<string, string> = {
    contact: "flex flex-col md:flex-row gap-8 p-4",
    chat: cn("flex flex-row md:flex-col w-full md:w-60 lg:w-100 gap-4 md:gap-8 p-2 md:p-4 bg-white shadow-md rounded-md h-fit md:h-auto",
        "dark:bg-mist-800")
};
const imageStyle: Record<string, string> = {
    contact: "w-full md:max-w-100",
    chat: "w-25 h-25 rounded-full md:w-full md:h-auto object-cover object-top md:max-h-90 md:rounded-none md:mx-auto my-auto md:my-0"
}

const ContactDetails = ({ type, contactData }: ContactDetailsProps) => {
    const contactType = type === 'contact';
    const chatType = type === 'chat';

    return (
        <div className={componentStyle[type]}>
            <Image src={contactData.profilePicture || DummyProfile} alt={contactData.name} width={300} height={300} loading='eager'
                className={imageStyle[type]} />
            <div className={`flex flex-col gap-1 ${chatType && 'flex-col md:flex-col'}`}>
                <h1 className={cn("text-5xl font-bold", chatType && "text-xl md:text-2xl")}>{contactData.name}</h1>
                <p className={cn("text-lg text-gray-500", chatType ? "hidden lg:block" : "")}>{contactData.email}</p>
                <Tooltip text={contactData.email}>
                    <p className={cn("text-sm text-gray-500 dark:text-gray-400", chatType ? "block lg:hidden" : "hidden")}>
                        {shrinkText(contactData.email, 20)}
                    </p>
                </Tooltip>
                <p className={`text-md text-gray-700 dark:text-gray-200 ${chatType && `hidden md:block`}`}>{contactData.about}</p>
                <Status contact={contactData} className="mt-0 md:mt-2" textStyle="text-xl text-gray-800" />
                <LastSceen contact={contactData} className="mt-0 md:mt-2 text-sm lg:text-xl text-gray-600" />
                <Chat contact={contactData} className={chatType ? "hidden" : "w-6 h-6"} />
                <ContactInfo contact={contactData} className={contactType ? "hidden" : "w-6 h-6 hidden md:block"} />
            </div>
            <div className={contactType ? "hidden" : "flex-1 flex flex-col items-end justify-center md:hidden"}>
                <ContactInfo contact={contactData} className="w-8 h-8" />
            </div>
        </div>
    )
}

export default ContactDetails;
