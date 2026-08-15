import { cacheLife, cacheTag } from 'next/cache';
import connectToDatabase from "@/components/lib/database/mongoose";
import { httpError } from "@/components/lib/error/errorModel";
import { User, Chat } from "@/components/lib/database/databaseModels";
import { logger } from "@/components/lib/logger";
import { Contact } from "@/components/util/types";
import { getUserDetailsByEmail } from "./userServices";
import { normalizeMessages, maxUUID } from "./utilityServices";

const getUserContacts = async (userId: string) => {
    'use cache';
    cacheLife({ revalidate: 3600, stale: 300, expire: 86400 });
    cacheTag(`user-contacts-${userId}`);
    let contacts;
    try {
        await connectToDatabase();
        const user = await User.findById(userId).populate('contacts', '-password -verified -contacts').lean();
        contacts = user?.contacts || [];
    } catch (err) {
        logger.error('Error getting user contacts from database', err);
        throw new httpError('Error getting user contacts', 500);
    }
    const contactList: Contact[] = contacts.map((contact: Record<string, any>, index: number) => {
        const { _id, __v, ...rest } = contact;
        return { index, id: _id.toString(), ...rest };
    });
    const contactIdIndexMap = new Map<string, number>(contactList.map(({ id, index }) => [id, index]));
    const contactsLength = contactList.length;
    return { contactList, contactIdIndexMap, contactsLength };
}

const getReceiverIndexByEmail = async (userId: string, receiverEmail: string) => {
    const receiver = await getUserDetailsByEmail(receiverEmail);
    if (!receiver) {
        throw new httpError('User with this email does not exist\nPlease try to register instead', 400);
    };
    if (!receiver.verified) {
        throw new httpError('Receiver account not verified', 400);
    }
    const { contactIdIndexMap, contactsLength } = await getUserContacts(userId);
    const receiverIndex: number = contactIdIndexMap.get(receiver.id) || -1;
    return { receiverIndex, receiver, contactsLength };
}

const getReceiverDetailsByIndex = async (userId: string, receiverIndex: number) => {
    const { contactList } = await getUserContacts(userId);
    const receiver = contactList[receiverIndex];
    return receiver;
}

const getunseenMessages = async (userId: string, receiverId: string) => {
    try {
        await connectToDatabase();
        const result = await Chat.find({ senderId: receiverId, receiverId: userId, seenTime: { $exists: false } })
            .sort({ _id: -1 }).lean();
        const unseenMessages = result ? normalizeMessages(result) : [];
        return unseenMessages;
    } catch (err) {
        logger.error('Error getting unseen messages', err);
        throw new httpError('Error getting messages', 500);
    }
}

const getMessages = async (userId: string, receiverId: string, lastMessageId: string, limit: number) => {
    try {
        await connectToDatabase();
        const result = await Chat.find({
            $or: [{ senderId: userId, receiverId }, { senderId: receiverId, receiverId: userId }], _id: { $lt: lastMessageId }
        }).sort({ _id: -1 }).limit(limit).lean();
        const messages = result ? normalizeMessages(result) : [];
        return messages;
    } catch (err) {
        logger.error('Error getting all messages', err);
        throw new httpError('Error getting messages', 500);
    }
}

const getAllMessages = async (userId: string, receiverId: string) => {
    const unseenMessages = await getunseenMessages(userId, receiverId);
    const unseenMessageLength = unseenMessages.length;
    if (unseenMessageLength > 12) {
        return unseenMessages;
    }
    const limit = 13 - unseenMessageLength;
    const lastMessageId = unseenMessageLength === 0 ? maxUUID : unseenMessages[unseenMessageLength - 1].id;
    const messages = await getMessages(userId, receiverId, lastMessageId, limit);
    return [...messages, ...unseenMessages];
}

export { getUserContacts, getReceiverIndexByEmail, getReceiverDetailsByIndex, getAllMessages, getMessages };
