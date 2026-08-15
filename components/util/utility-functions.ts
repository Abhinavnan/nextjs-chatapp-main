import { ZodIssue } from 'zod';
import { Contact, MessageInfo } from '@/components/util/types';

const shrinkText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) {
        return text;
    }
    return text.slice(0, maxLength) + '...';
}

const validatePassword = (password: string): string => {
    const errors = [];
    if (password.length < 6) {
        errors.push("Password must be at least 6 characters long");
    }
    if (!/[A-Za-z]/.test(password)) {
        errors.push("Password must contain at least one letter");
    }
    if (!/[0-9]/.test(password)) {
        errors.push("Password must contain at least one number");
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
        errors.push("Password must contain at least one special character");
    }
    const errorMessage = errors.join("\n");
    return errorMessage;
};

const formatArrayString = (arr: string[]): string => {
    if (arr.length === 1) {
        return arr[0];
    }
    if (arr.length === 2) {
        return `${arr[0]} and ${arr[1]}`;
    }
    const lastItem = arr.pop();
    return `${arr.join(', ')} and ${lastItem}`;
}

const parseZodError = (parsedData: any) => {
    const errors = JSON.parse(parsedData.error.message).map((e: ZodIssue) => e.message).filter(Boolean).join('\n');
    return errors;
}

const sanitiseContactData = ({ name, email, about, profilePicture, index }: Contact) => {
    const contactData = { name, email, about, profilePicture, index, id: crypto.randomUUID() };
    return contactData;
}

const sanitiseMessages = (messages: MessageInfo[], userId: string) => {
    const sanitisedMessages = messages.map((message) => {
        const { receiverId, senderId, userSentTime, ...rest } = message;
        const sanitisedMessage = senderId === userId ? { ...rest, userSentTime } : rest;
        return sanitisedMessage;
    })
    return sanitisedMessages;
};

export { shrinkText, validatePassword, formatArrayString, parseZodError, sanitiseContactData, sanitiseMessages };