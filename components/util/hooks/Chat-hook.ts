import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { errorToast } from "@/components/util/utility-components";
import { Contact } from "@/components/util/types";
import { webSocketUrl } from "@/components/util/config/clientConfig";
import { MessageInfo } from "@/components/util/types";
import useHttp from "./Http-hook";

const chatSocket = io(`${webSocketUrl}/chat`, { withCredentials: true });

const useChat = (contact: Contact) => {
    const router = useRouter();
    const { sendRequest, isLoading } = useHttp();
    const [chatRoom, setChatRoom] = useState<string>('');
    const [messages, setMessages] = useState<MessageInfo[]>(contact.messages || []);
    const [newMessages, setNewMessages] = useState<MessageInfo[]>([]);
    const { index, email } = contact;
    const isContactAdded = index >= 0 ? true : false;
    const uniqueRefIdMessages = Array.from(new Map([...newMessages, ...messages].map((message) => [message.refrenceId, message])).values());
    const uniqueMessages = Array.from(new Map([...uniqueRefIdMessages, ...messages].map((message) => [message.id, message])).values());

    const addContact = async () => {
        try {
            const { index } = await sendRequest('patch', '/contact/add', { email });
            router.push(`/chat/${index}`);
        } catch (err) {
            if (err !== 'canceled') {
                errorToast(err, 'Failed to add contact');
                router.push('/contact');
            }
        }
    }

    useEffect(() => {
        if (!isContactAdded && !isLoading) {
            addContact();
        }
    }, [isContactAdded]);

    useEffect(() => {
        if (isContactAdded && !chatRoom) {
            const timeOut = setTimeout(() => chatSocket.emit('join-room', index, setChatRoom), 250);
            return () => clearTimeout(timeOut);
        }
        if (isContactAdded && chatRoom) {
            const timeOut = setTimeout(() => chatSocket.emit('get-unseen-messages', index), 250);
            return () => clearTimeout(timeOut);
        }
    }, [isContactAdded, chatRoom, index]);

    const handleJoinRoom = () => {
        if (isContactAdded) {
            chatSocket.emit('join-room', index, setChatRoom);
        }
    }

    const handleUpdateMessages = (updatedMessages: MessageInfo[]) => {
        setMessages((prevMessages) => [...prevMessages, ...updatedMessages]);
    };

    const sendMessage = (messageInfo: MessageInfo) => {
        if (!isContactAdded || !chatRoom) {
            messageInfo.error = 'Unable to establish connection.\nPlease try again'
            handleUpdateMessages([messageInfo]);
            errorToast(messageInfo.error, 'Failed to send message');
        } else {
            chatSocket.emit('send-message', chatRoom, index, messageInfo);
        }
        setNewMessages((prevMessages) => [...prevMessages, messageInfo]);
    }

    const handleReceiveMessage = (messageInfo: MessageInfo) => {
        setMessages((prevMessages) => [...prevMessages, messageInfo]);
    };

    const handleErrorMessage = (messageInfo: MessageInfo) => {
        errorToast(messageInfo.error, 'Failed to send message');
        handleUpdateMessages([messageInfo]);
    };

    const handleUpdateRoom = (room: string) => {
        setChatRoom(room);
        chatSocket.emit('join-room', index, setChatRoom);
    };

    useEffect(() => {
        chatSocket.on('connect', handleJoinRoom);
        chatSocket.on('receive-message', handleReceiveMessage);
        chatSocket.on('error-message', handleErrorMessage);
        chatSocket.on('update-room', handleUpdateRoom);
        chatSocket.on('update-messages', handleUpdateMessages);
        return () => {
            chatSocket.off('connect', handleJoinRoom);
            chatSocket.off('receive-message', handleReceiveMessage);
            chatSocket.off('error-message', handleErrorMessage);
            chatSocket.off('update-room', handleUpdateRoom);
            chatSocket.off('update-messages', handleUpdateMessages);
        };
    }, [chatSocket, isContactAdded]);

    return { addContact, sendMessage, handleUpdateMessages, chatSocket, index, chatRoom, messages, isContactAdded, uniqueMessages };
}

export default useChat;