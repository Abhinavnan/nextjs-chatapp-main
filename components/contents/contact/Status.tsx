'use client';
import { cn } from '@sglara/cn';
import { Contact } from '@/components/util/types';
import useStatus from '@/components/util/hooks/Status-hook';

interface StatusProps {
  contact: Contact;
  className?: string;
  textStyle?: string;
}

const statusColors: { [key: string]: string } = {
  online: 'status status-success',
  offline: 'status status-error',
  away: 'status status-warning',
};

const Status = ({ contact, className, textStyle }: StatusProps) => {
  const { status, hideStatus } = useStatus(contact);

  return (
    <div className={cn("flex items-center", className, hideStatus)}>
      <span className={statusColors[status]}/>
      <span className={cn("ml-2 text-xs", textStyle)}>{status}</span>
    </div>  
  )
}

export default Status;