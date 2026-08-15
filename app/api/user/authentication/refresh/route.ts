import { NextResponse, NextRequest } from "next/server";
import { refreshAuthTokens } from "@/components/lib/services/authServices";
import { withErrorHandler } from "@/components/lib/error/withErrorHandler";

const GET = withErrorHandler(async (request: NextRequest) => {
    const response = NextResponse.json({ message: 'Token refreshed successfully' }, { status: 200 });
    await refreshAuthTokens(request, response);
    return response;
});

export { GET };