import Link from 'next/link';
import { cn } from '@sglara/cn';
import { Info } from 'lucide-react';
import { Tooltip } from '@/components/util/utility-components';
import { Contact } from '@/components/util/types';

interface ContactInfoProps {
  contact: Contact;
  className?: string;
}

const ContactInfo = ({contact, className}: ContactInfoProps) => {
    const { index } = contact;

    return (
        <Tooltip text='Contact info' className="mb-0.5">
            <Link href={`/contact/${index}`} className={cn("cursor-pointer", className)}>
                <Info className={cn("w-5 h-5 text-gray-500", className)} />
            </Link>
        </Tooltip>
    )
}

export default ContactInfo;
