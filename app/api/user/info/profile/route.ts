import { NextResponse } from "next/server";
import { withErrorHandler } from "@/components/lib/error/withErrorHandler";
import { validateTokenServerSide } from "@/components/lib/actions/authAction";

const GET = withErrorHandler(async () => {
    const response = NextResponse.json({ message: "Profile fetched successfully" }, { status: 200 });
    const { about, email, name, profilePicture, contacts } = await validateTokenServerSide(true);
    return NextResponse.json({ about, email, name, profilePicture, contacts }, { status: 200, headers: response.headers });
});

export { GET };
