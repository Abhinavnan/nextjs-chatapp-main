import dayjs from "dayjs";
import bcrypt from "bcryptjs";
import { cacheLife, cacheTag, revalidateTag } from 'next/cache';
import connectToDatabase from "@/components/lib/database/mongoose";
import { deleteFileFromS3, uploadFileToS3 } from "@/components/lib/services/s3Services";
import { User, UserSession } from "@/components/lib/database/databaseModels";
import { httpError } from "@/components/lib/error/errorModel";
import { logger } from "@/components/lib/logger";
import { UserDetails } from "@/components/util/types";

const updateUserCache = (user: UserDetails) => {
    const { id, email } = user;
    if (id) {
        revalidateTag(`user-details-${id}`, { expire: 0 });
    }
    revalidateTag(`user-details-${email}`, { expire: 0 });
}

const getUserDetailsByEmail = async (email: string) => {
    'use cache';
    cacheLife({ revalidate: 3600, stale: 300, expire: 86400 });
    cacheTag(`user-details-${email}`);
    let user = null;
    try {
        await connectToDatabase();
        const result = await User.findOne({ email }, '-contacts').lean();
        const { _id, __v, ...rest } = result || {};
        user = _id ? { id: _id.toString(), ...rest } : null;
    } catch (err) {
        logger.error('Error getting user details by email', err);
        throw new httpError('Error getting user details', 500);
    }
    return user;
}

const getUserDetailsById = async (id: string) => {
    'use cache';
    cacheLife({ revalidate: 3600, stale: 300, expire: 86400 });
    cacheTag(`user-details-${id}`);
    let user = null;
    try {
        await connectToDatabase();
        const result = await User.findById(id, '-password -contacts').lean();
        const { _id, __v, ...rest } = result || {};
        user = _id ? { id: _id.toString(), ...rest } : null;
    } catch (err) {
        logger.error('Error getting user details by id', err);
        throw new httpError('Error getting user details', 500);
    }
    return user;
}

const updateUserDetails = async (data: UserDetails) => {
    const { id, profilePicture: newProfilePicture, email: newEmail } = data;
    const user = await getUserDetailsById(id as string);
    const { profilePicture, email } = user;
    try {
        await connectToDatabase();
        await User.findOneAndUpdate({ _id: id }, data, { returnDocument: 'after', runValidators: true });
    } catch (err) {
        logger.error('Error updating user details', err);
        if (newProfilePicture && newProfilePicture !== profilePicture) {
            deleteFileFromS3(newProfilePicture).catch(() => logger.warn('Error deleting file from S3', { Key: newProfilePicture }));
        }
        throw new httpError('Error updating user details', 500);
    }
    if (profilePicture && profilePicture !== newProfilePicture) {
        deleteFileFromS3(profilePicture).catch(() => logger.warn('Error deleting file from S3', { Key: profilePicture }));
    }
    if (email !== newEmail) {
        revalidateTag(`user-details-${email}`, { expire: 0 });
    }
    updateUserCache(data);
}

const deleteUserSession = async (sessionId: string) => {
    try{
        await connectToDatabase();
        await UserSession.deleteOne({ _id: sessionId });
        revalidateTag(`user-session-${sessionId}`, {expire: 0});
    }catch(err){
        logger.error('Error deleting user session from database', err);
    }
}

const getUserSessionDetails = async (sessionId: string) => {
    'use cache';
    cacheLife({ revalidate: 1900, stale: 300, expire: 86400 });
    cacheTag(`user-session-${sessionId}`);
    let sessionDetails;
    try {
        await connectToDatabase();
        const result = await UserSession.findById(sessionId);
        sessionDetails = result ? result.toObject({ getters: true }) : null;
        sessionDetails = { ...sessionDetails, userId: sessionDetails?.userId.toString(), _id: sessionDetails?._id.toString() };
    } catch (err) {
        logger.error('Error getting user session details', err);
        throw new httpError('Error getting user session details.\nPlease try again', 500);
    }
    if(!sessionDetails) throw new httpError('User session expired.\nPlease login again', 401);
    return sessionDetails;
};

const refreshUserSession = async (sessionDetails: Record<string, any>) => {
    const { _id: sessionId, expiresTime } = sessionDetails;
    const refreshTime = dayjs().toISOString();
    const refreshId = crypto.randomUUID();
    const updatedData: Record<string, any> = { refreshTime, refreshId };
    const isExpireTimeUpdate = dayjs(expiresTime).isBefore(dayjs().add(40, 'minutes'));
    if(isExpireTimeUpdate){
        updatedData.expiresTime = dayjs().add(1, 'day').toISOString();
    }
    let userSession;
    try {
        await connectToDatabase();
        const result = await UserSession.findOneAndUpdate({ _id: sessionId }, updatedData, { returnDocument: 'after', runValidators: true });
        userSession = result.toObject({ getters: true });
        revalidateTag(`user-session-${sessionId}`, { expire: 0 });
    } catch (err) {
        logger.error(`Error refreshing user session.\nSessionId: ${sessionId}`, err);
        throw new httpError('Error refreshing user session.\nPlease try again', 500);
    }
    return userSession;
}

const updatePassword = async (userId: string, password: string) => {
    const hashedPassword = await bcrypt.hash(password, 12);
    let user;
    try {
        await connectToDatabase();
        const result = await User.findOneAndUpdate({ _id: userId }, { password: hashedPassword }, 
            { returnDocument: 'after', runValidators: true }).lean();
        const { _id, __v, ...rest } = result;
        user = { id: _id.toString(), ...rest };
    } catch (err) {
        logger.error('Error updat̥ing user password', err);
        throw new httpError('Error updating user password.\nPlease try again', 500);
    }
    revalidateTag(`user-details-${user.email}`, { expire: 0 });
}

const uploadProfilePicture = async (userData: { name: string, email: string, profilePicture: File}) => {
    const { name, email } = userData;
    const profilePicture = userData.profilePicture as File;
    if(!(profilePicture instanceof File)){
        throw new httpError('Profile picture must be a file', 400);
    }
    if(profilePicture.type.split('/')[0] !== 'image'){
        throw new httpError('Profile picture must be an image', 400);
    }
    if(profilePicture.size > 1048576){ // 1MB in bytes
        throw new httpError('Profile picture must be less than 1MB', 400);
    }
    const fileName = `${name}-${email.split('@')[0]} profile picture`.replace(/[^a-zA-Z0-9]/g, '-');
    const metadata = {name, email, type: 'profilePicture', uploadTime: new Date().toISOString()};
    const profilePictureUrl = await uploadFileToS3(profilePicture, fileName, 'profile-pictures', metadata);
    return profilePictureUrl;
}

export {
    getUserDetailsByEmail, updateUserDetails, getUserDetailsById, updateUserCache, getUserSessionDetails, refreshUserSession,
    updatePassword, uploadProfilePicture, deleteUserSession
};