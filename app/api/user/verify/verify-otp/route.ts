import { NextResponse, NextRequest, connection } from "next/server";
import { withErrorHandler } from "@/components/lib/error/withErrorHandler";
import { verifyOTP } from "@/components/lib/services/authServices";
import { cookieOptions } from "@/components/util/config/config";

const PATCH = withErrorHandler(async (req: NextRequest) => {
    await connection();
    const { newToken } = await verifyOTP(req);
    const response = NextResponse.json({ message: 'OTP verified successfully' }, { status: 200 });
    response.cookies.set('otpToken', newToken as string, { ...cookieOptions, maxAge: 600 });
    return response;
});

export { PATCH };