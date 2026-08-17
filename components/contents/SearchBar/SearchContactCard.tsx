import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { cn } from '@sglara/cn';
import { Tooltip } from '@/components/util/utility-components';
import { shrinkText } from '@/components/util/utility-functions';
import { Contact } from '@/components/util/types';
import DummyProfile from "@/public/dummy-profile.svg";

interface ContactCardProps {
    contact: Contact;
    onClose: () => void
}

const SearchContactCard = ({ contact, onClose, ...props }: ContactCardProps) => {
    const router = useRouter();
    const { index, email } = contact;
    const chatLink = index >= 0 ? `/chat/${index}` : `/chat/new?email=${email}`;

    const handleClick = () => {
        onClose();
        router.push(chatLink);
    }

    return (
        <li onClick={handleClick} {...props}
            className={cn("flex items-center space-x-4 p-4 bg-mist-50 rounded-lg shadow hover:bg-gray-50, w-full sm:w-75 cursor-pointer",
                "dark:bg-mist-950 dark:hover:bg-mist-900")}>
            <Image src={contact.profilePicture || DummyProfile} alt={contact.name} width={56} height={56} loading='eager'
                className="w-14 h-14 aspect-square object-cover object-top rounded-full" />
            <div className="flex flex-col w-full">
                <Tooltip text={contact.name}>
                    <p className="text-lg font-semibold">{shrinkText(contact.name, 20)}</p>
                </Tooltip>
                <Tooltip text={contact.email}>
                    <p className="text-sm text-gray-500">{shrinkText(contact.email, 20)}</p>
                </Tooltip>
            </div>
        </li>
    )
}

export default SearchContactCard;
