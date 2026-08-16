import { NextResponse, NextRequest, connection } from "next/server";
import { withErrorHandler } from "@/components/lib/error/withErrorHandler";
import { validateTokenServerSide } from "@/components/lib/actions/authAction";

const GET = withErrorHandler(async (request: NextRequest) => {
    await connection();
    const response = NextResponse.json({ message: "Profile fetched successfully" }, { status: 200 });
    const { about, email, name, profilePicture, contacts } = await validateTokenServerSide(request);
    return NextResponse.json({ about, email, name, profilePicture, contacts }, { status: 200, headers: response.headers });
});

export { GET };
