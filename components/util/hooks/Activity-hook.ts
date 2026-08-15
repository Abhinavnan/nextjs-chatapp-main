import dayjs from "dayjs";
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { webSocketUrl } from "@/components/util/config/clientConfig";

const activitySocket = io(`${webSocketUrl}/status`, { withCredentials: true });
const IDLE_TIMEOUT = 120000;

const useActivity = () => {
    const currentStatus = useRef('online');
    const lastUpdatedTime = useRef(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const updateStatus = (newStatus: string) => {
        const currrentTime = dayjs().valueOf();
        const isExpired = currrentTime - lastUpdatedTime.current > 300000;
        if (isExpired || currentStatus.current !== newStatus) {
            const lastSeenTime = dayjs().toISOString();
            activitySocket.emit('update-user-status', { status: newStatus, lastSeenTime });
            lastUpdatedTime.current = currrentTime;
            currentStatus.current = newStatus;
        }
    }

    const resetTimer = () => {
        updateStatus('online');
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => updateStatus('away'), IDLE_TIMEOUT);
    };

    const handlePing = () => updateStatus(currentStatus.current);

    useEffect(() => {
        activitySocket.on('ping-user', handlePing);
        return () => { activitySocket.off('ping-user', handlePing) }
    }, [activitySocket]);

    useEffect(() => {
        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
        events.forEach((event) => window.addEventListener(event, resetTimer));
        resetTimer(); // start the timer on mount

        return () => {
            events.forEach((event) => window.removeEventListener(event, resetTimer));
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    return { activitySocket }
}

export default useActivity
