import { NextResponse, NextRequest, connection } from "next/server";
import { refreshAuthTokens } from "@/components/lib/services/authServices";
import { withErrorHandler } from "@/components/lib/error/withErrorHandler";

const GET = withErrorHandler(async (request: NextRequest) => {
    await connection();
    const response = NextResponse.json({ message: 'Token refreshed successfully' }, { status: 200 });
    await refreshAuthTokens(request, response);
    return response;
});

export { GET };