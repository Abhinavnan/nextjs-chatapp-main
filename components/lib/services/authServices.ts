import zod from 'zod';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dayjs from 'dayjs';
import { NextResponse, NextRequest } from 'next/server';
import { UserDetails } from "@/components/util/types";
import { jwtSecret, cookieOptions } from '@/components/util/config/config';
import { sendEmail, getRequestDeviceInfo } from './utilityServices';
import { accountVerificationEmailTemplate } from '@/components/lib/templates/emailTemplates';
import { logger } from '@/components/lib/logger';
import { httpError } from '@/components/lib/error/errorModel';
import { parseZodError } from '@/components/util/utility-functions';
import { UserSession } from '@/components/lib/database/databaseModels';
import { getUserSessionDetails, refreshUserSession, deleteUserSession } from '@/components/lib/services/userServices';
import connectToDatabase from "@/components/lib/database/mongoose";

const createAuthCookies = (response: NextResponse, userSession: Record<string, any>) => {
    const authId = crypto.randomUUID();
    const token = jwt.sign({ userId: userSession.userId }, jwtSecret, { expiresIn: '30m' });
    response.cookies.set('sessionId', userSession.id, cookieOptions);
    response.cookies.set('refreshId', userSession.refreshId, cookieOptions);
    response.cookies.set('authToken', token, { ...cookieOptions, maxAge: 1800 });
    response.cookies.set('authId', authId, { ...cookieOptions, httpOnly: false, maxAge: 1700 });
    response.cookies.set('login', 'true', { ...cookieOptions, httpOnly: false });
}

const generateToken = async (request: NextRequest, response: NextResponse, user: UserDetails) => {
    const { id: userId } = user;
    const expiresTime = dayjs().add(1, 'day').toISOString();
    const { deviceName, ipAddress } = getRequestDeviceInfo(request);
    const refreshId = crypto.randomUUID();
    const userSession = new UserSession({ userId, refreshId, deviceName, ipAddress, expiresTime });
    try {
        await connectToDatabase();
        await userSession.save();
    } catch (err) {
        logger.error('Error creating user session', err);
        throw new httpError('Error creating user session\nPlease try again', 500);
    }
    userSession.toObject({ getters: true });
    createAuthCookies(response, userSession);
}

const verifyUserSession = (sessionDetails: Record<string, any>, refreshId: string) => {
    const isSessionExpired = dayjs(sessionDetails.expiresTime).isBefore(dayjs());
    if (sessionDetails.refreshId !== refreshId || isSessionExpired) {
        return false;
    };
    return true;
}

const refreshAuthTokens = async (request: NextRequest, response: NextResponse) => {
    const sessionId = request.cookies.get('sessionId')?.value;
    const refreshId = request.cookies.get('refreshId')?.value;
    const deviceInfo = getRequestDeviceInfo(request);
    if (!(sessionId && refreshId)) {
        logger.warn('Missing authToken or sessionId in cookies', deviceInfo);
        throw new httpError('User session expired.\nPlease login again', 401, 'authError');
    }
    const sessionDetails = await getUserSessionDetails(sessionId);
    const isSessionValid = verifyUserSession(sessionDetails, refreshId);
    if (!isSessionValid) {
        deleteUserSession(sessionDetails.id as string)
            .then(() => logger.warn('User session deleted from database due to mismatch in refreshId', sessionDetails))
            .catch(() => logger.warn('Error deleting user session from database', sessionDetails));
        throw new httpError('User session expired.\nPlease login again', 401, 'authError');
    }
    const refreshedSession = await refreshUserSession(sessionDetails);
    createAuthCookies(response, refreshedSession);
}

const sendOTP = async (response: NextResponse, user: UserDetails) => {
    const { id: userId, email, name } = user;
    const otp = crypto.randomInt(100000, 999999);
    const token = jwt.sign({ userId, verified: false, otp }, jwtSecret, { expiresIn: '10m' });
    await sendEmail(accountVerificationEmailTemplate({ email, otp, name }));
    response.cookies.set('otpToken', token, { ...cookieOptions, maxAge: 600 });
}

const verifyOTPToken = (request: NextRequest) => {
    const otpToken = request.cookies.get('otpToken')?.value;
    if (!otpToken) {
        throw new httpError('One-time password (OTP) expired.\nPlease try again.', 400);
    }
    try {
        const decoded = jwt.verify(otpToken, jwtSecret) as { userId: string, verified: boolean, otp: number };
        return decoded;
    } catch (error) {
        logger.error('Error verifying OTP token', error);
        throw new httpError('Invalid or expired OTP token.\nPlease try again.', 500);
    }
}

const verifyOTP = async (request: NextRequest) => {
    const { otp } = await request.json();
    const otpSchema = zod.number('OTP must be a number').int('OTP must be an integer')
        .min(100000, 'OTP must be 6 digits long').max(999999, 'OTP must be 6 digits long');
    const parsedOtp = otpSchema.safeParse(otp);
    if (!parsedOtp.success) {
        throw new httpError(parseZodError(parsedOtp), 400);
    }
    const decodedToken = verifyOTPToken(request);
    const { userId, otp: storedOtp, verified } = decodedToken;
    if (!userId) {
        throw new httpError('Invalid or expired OTP token\nPlease try again', 400);
    }
    console.log(otp, storedOtp)
    if (otp !== storedOtp) {
        throw new httpError('Invalid OTP\nPlease try again', 400);
    }
    let newToken;
    if (!verified) {
        newToken = jwt.sign({ userId, verified: true, storedOtp }, jwtSecret, { expiresIn: '10m' });
    }
    return { userId, newToken };
}

export { generateToken, sendOTP, verifyOTPToken, verifyOTP, cookieOptions, refreshAuthTokens, verifyUserSession };