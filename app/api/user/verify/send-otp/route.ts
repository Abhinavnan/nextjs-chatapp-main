import zod from "zod";
import { NextResponse, NextRequest } from "next/server";
import { withErrorHandler } from "@/components/lib/error/withErrorHandler";
import { parseZodError } from "@/components/util/utility-functions";
import { httpError } from "@/components/lib/error/errorModel";
import { getUserDetailsByEmail, getUserDetailsById } from "@/components/lib/services/userServices";
import { sendOTP, verifyOTPToken } from "@/components/lib/services/authServices";

const POST = withErrorHandler(async (req: NextRequest) => {
    const { email } = await req.json();
    let user;
    if(email){
        const emailSchema = zod.string().email('Invalid email address');
        const parsedEmail = emailSchema.safeParse(email);
        if(!parsedEmail.success){
            throw new httpError(parseZodError(parsedEmail), 400);
        }
        user = await getUserDetailsByEmail(email);
        if(!user){
            throw new httpError('User with this email does not exist\nPlease try to register instead', 400);
        }
    }else{
        const { userId } = verifyOTPToken(req);
        if(!userId){
            throw new httpError('Invalid or expired OTP token\nPlease try again', 400);
        }
        user = await getUserDetailsById(userId);
    }
    const response = NextResponse.json({ message: 'OTP sent successfully' }, { status: 201 });
    await sendOTP(response, user);
    return response;
});

export { POST }