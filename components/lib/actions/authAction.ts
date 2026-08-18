import 'server-only';
import jwt from 'jsonwebtoken';
import { cookies, headers } from 'next/headers';
import { NextRequest, connection } from 'next/server';
import { jwtSecret } from '@/components/util/config/config';
import { logger } from '@/components/lib/logger';
import { getUserSessionDetails, getUserDetailsById } from '@/components/lib/services/userServices';
import { verifyUserSession } from '@/components/lib/services/authServices';
import { hybridError } from '@/components/lib/error/errorModel';

const validateTokenServerSide = async (request?: NextRequest | null) => {
    const cookieStore = request ? request.cookies : await cookies();
    const requestHeaders = request ? request.headers : await headers();
    const authToken = cookieStore.get('authToken')?.value;
    const sessionId = cookieStore.get('sessionId')?.value;
    const refreshId = cookieStore.get('refreshId')?.value;
    const deviceName = requestHeaders.get('x-device-name');
    const ipAddress = requestHeaders.get('x-ip-address');
    const deviceInfo = { deviceName, ipAddress };
    if (!(authToken || (sessionId && refreshId))) {
        logger.warn('Missing authToken or sessionId in cookies', deviceInfo);
        hybridError('User session expired.\nPlease login again', 401, !!request);
    }
    await connection();
    let userId, sessionDetails, isSessionValid = true;
    if (authToken) {
        try {
            const decoded = jwt.verify(authToken, jwtSecret) as { userId: string };
            userId = decoded.userId;
        } catch (err) {
            logger.warn('Invalid authToken', { error: err, ...deviceInfo });
            hybridError('Session expired.\nPlease login again', 401, !!request);
        }
    }
    if (!authToken && sessionId && refreshId) {
        sessionDetails = await getUserSessionDetails(sessionId);
        isSessionValid = verifyUserSession(sessionDetails, refreshId);
        userId = sessionDetails?.userId;
    }
    if (!isSessionValid) {
        hybridError('Session expired.\nPlease login again', 401, !!request);
    }
    const userData = await getUserDetailsById(userId);
    const userDetails = { ...userData, ...deviceInfo, userId, sessionId };
    return userDetails;
}

export { validateTokenServerSide };

