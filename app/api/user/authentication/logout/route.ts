import { NextResponse, NextRequest, connection } from "next/server";
import { withErrorHandler } from "@/components/lib/error/withErrorHandler";
import { deleteAllCookies } from '@/components/lib/services/utilityServices';
import { deleteUserSession } from "@/components/lib/services/userServices";

const DELETE = withErrorHandler(async (request: NextRequest) => {
    await connection();
    const response = NextResponse.json({ message: 'Logout successful' }, { status: 200 });
    const sessionId = request.cookies.get('sessionId')?.value;
    deleteAllCookies(request, response);
    if (!sessionId) {
        return response;
    }
    await deleteUserSession(sessionId);
    return response;
});

export { DELETE };