'use client'
import dayjs from 'dayjs';
import { cn } from '@sglara/cn';
import { Contact } from '@/components/util/types';
import useStatus from '@/components/util/hooks/Status-hook';

interface LastSceenProps {
    contact: Contact;
    className?: string;
}

const LastSceen = ({contact, className}: LastSceenProps) => {
    const { lastSeenTime, hideLastTime } = useStatus(contact);

    const formatDate = (date: string) => {
        if(dayjs().format('DD/MM/YYYY') === dayjs(date).format('DD/MM/YYYY')){
            return dayjs(date).format('hh:mm A');
        }else{
            return dayjs(date).format('DD MMM YYYY hh:mm A');
        }
    }
    
    return (
        <span className={cn("text-xs text-gray-500 w-full mt-0.5", className, hideLastTime)}>{formatDate(lastSeenTime)}</span>
    )
}

export default LastSceen;
