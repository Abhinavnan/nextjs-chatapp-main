import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { StatusInfo, Contact } from '@/components/util/types';
import useActivity from '@/components/util/hooks/Activity-hook';

const useStatus = (contact: Contact) => {
    const pathname = usePathname();
    const { activitySocket } = useActivity();
    const [statusInfo, setStatusInfo] = useState<StatusInfo>({ status: contact.status || 'offline', lastSeenTime: contact.lastSeenTime || '' });
    const [lastChecked, setLastChecked] = useState<number>(0);
    const { status, lastSeenTime } = statusInfo;
    const { email, index } = contact;
    const currentTime = dayjs().valueOf();
    const expiredStatus = currentTime - lastChecked > 300000;
    const hideStatus = lastSeenTime ? '' : 'hidden';
    const hideLastTime = (!lastSeenTime || status === 'online') ? 'hidden' : '';

    const updateStatus = (statusInfo: StatusInfo) => {
        setStatusInfo(statusInfo);
        setLastChecked(currentTime);
    }

    const handleUpdateUserStatus = (contactEmail: string, statusInfo: StatusInfo) => {
        if (contactEmail === email) {
            updateStatus(statusInfo);
        }
    }

    const checkStatus = () => {
        activitySocket.emit('check-user-status', index, updateStatus);
    }

    useEffect(() => {
        if (expiredStatus) {
            const timeout = setTimeout(() => checkStatus(), 1000);
            return () => clearTimeout(timeout);
        }
    }, [activitySocket, expiredStatus]);

    useEffect(() => {
        const timeout = setTimeout(() => checkStatus(), 1000);
        return () => clearTimeout(timeout);
    }, [pathname]);

    useEffect(() => {
        activitySocket.on('get-user-status', handleUpdateUserStatus);
        return () => { activitySocket.off('get-user-status', handleUpdateUserStatus); }
    }, [activitySocket]);

    return { status, lastSeenTime, hideStatus, hideLastTime };
}

export default useStatus;