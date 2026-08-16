import zod from "zod";
import { NextResponse, NextRequest, connection } from "next/server";
import { verifyOTPToken } from "@/components/lib/services/authServices";
import { updatePassword } from "@/components/lib/services/userServices";
import { parseZodError } from "@/components/util/utility-functions";
import { httpError } from "@/components/lib/error/errorModel";
import { withErrorHandler } from "@/components/lib/error/withErrorHandler";

const PATCH = withErrorHandler(async (req: NextRequest) => {
    await connection();
    const { userId, verified } = verifyOTPToken(req);
    const { password, confirmPassword } = await req.json();
    if (!verified) {
        throw new httpError('Email not verified\nPlease try again', 400);
    }
    if (password !== confirmPassword) {
        throw new httpError('Passwords do not match\nPlease try again', 400);
    }
    const passwordSchema = zod.string().min(6, 'Password must be at least 6 characters long')
        .max(16, 'Password must be at most 16 characters long')
        .regex(/[A-Za-z]/, 'Password must contain at least one letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');
    const parsedPassword = passwordSchema.safeParse(password);
    if (!parsedPassword.success) {
        throw new httpError(parseZodError(parsedPassword), 400);
    }
    const response = NextResponse.json({ message: 'Password updated successfully.\nPlease login to continue' }, { status: 200 });
    await updatePassword(userId, password);
    return response;
});

export { PATCH };