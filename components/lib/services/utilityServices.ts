import jwt from 'jsonwebtoken';
import axios, { AxiosRequestConfig, Method } from 'axios';
import { Resend } from 'resend';
import { NextRequest, NextResponse, userAgent } from 'next/server';
import { resendApiKey, jwtSecret, webSocketUrl } from '@/components/util/config/config';
import { logger } from '@/components/lib/logger';
import { httpError } from '@/components/lib/error/errorModel';
import { EmailPayload, MessageInfo } from '@/components/util/types';

const resend = new Resend(resendApiKey);
const maxUUID = 'ffffffffffffffffffffffff';

const sendEmail = async (payload: EmailPayload) => {
  const { data, error } = await resend.emails.send(payload);
  if (error) {
    logger.error('Error sending email', error);
    throw new httpError('Error sending email\nPlease try again', 500);
  } else {
    logger.success('Email sent successfully', data as Record<string, any>);
  }
};

const getRequestDeviceInfo = (request: NextRequest) => {
  const { isBot, browser, device, os } = userAgent(request);
  const deviceName = [browser.name, browser.version, device.vendor, device.type, device.model, os.name, os.version].filter(Boolean).join(' ');
  const ipAddressRow = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const ipAddress = ipAddressRow === '::1' ? '127.0.0.1' : ipAddressRow.replace(/^::ffff:/, '');
  if (isBot) {
    logger.warn('Request made by a bot', { deviceName });
    throw new httpError('Unverified request.\nPlease try again', 400);
  }
  return { deviceName, ipAddress };
};

const deleteAllCookies = (request: NextRequest, response: NextResponse) => {
  request.cookies.getAll().forEach((cookie) => {
    response.cookies.delete(cookie.name);
  });
}

const normalizeMessages = (messages: MessageInfo[]) => {
  const normalizedMessages = messages.map((message: Record<string, any>) => {
    const { _id, senderId, receiverId, __v, ...rest } = message;
    return { id: _id.toString(), senderId: senderId.toString(), receiverId: receiverId.toString(), ...rest };
  });
  return normalizedMessages;
}

const sendAPICall = async (userId: string, method: Method, path: string, data?: any, timeout = 11000) => {
  const url = webSocketUrl + '/api' + path;
  const authTocken = jwt.sign({ userId }, jwtSecret, { expiresIn: '30m' });
  const refreshId = crypto.randomUUID();
  const sessionId = crypto.randomUUID();
  const cookieHeader = `authToken=${authTocken}; refreshId=${refreshId}; sessionId=${sessionId}`
  const headers = { cookie: cookieHeader };
  try {
    let request: AxiosRequestConfig = { url, method, timeout, headers };
    if (method === 'get') {
      request = { ...request, params: data };
    } else if (['patch', 'post', 'put'].includes(method)) {
      request = { ...request, data };
    }
    const response = await axios(request);
    return response.data;
  } catch (err) {
    let message = 'Something went wrong!\nPlease try again.';
    if (axios.isAxiosError(err)) {
      message = err.response?.data?.message || err.message || message;
    } else if (err instanceof Error) {
      message = err?.message || message;
    }
    logger.error('Error sending API call', { method, path, data, error: message });
    throw new httpError(message, 500);
  }
}

export { sendEmail, getRequestDeviceInfo, deleteAllCookies, normalizeMessages, sendAPICall, maxUUID };