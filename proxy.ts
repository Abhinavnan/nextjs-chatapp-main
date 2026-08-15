import { NextRequest, NextResponse } from 'next/server';
import { getRequestDeviceInfo } from '@/components/lib/services/utilityServices';

export const proxy = (req: NextRequest) => {
  const { deviceName, ipAddress } = getRequestDeviceInfo(req);
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-device-name', deviceName || '');
  requestHeaders.set('x-ip-address', ipAddress || '');
  return NextResponse.next({ request: { headers: requestHeaders } });
};

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|bmp)$).*)'],
};