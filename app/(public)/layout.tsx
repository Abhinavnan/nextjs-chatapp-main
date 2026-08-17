import React, { ReactNode } from 'react';
import Link from 'next/link';

export const instant = false;

const PublicLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <nav className="navbar bg-green-500 shadow-sm h-12 flex flex-row items-center px-2">
                <div className="flex-1 flex justify-center">
                    <Link className="text-white text-2xl font-bold home" href="/" aria-description="Go to home page">Chat App</Link>
                </div>
                <div className="flex flex-row gap-2">
                    <Link href="/login" aria-description="Go to login page"
                        className="bg-white text-green-500 p-2 py-1 rounded-md font-semibold">
                        Login
                    </Link>
                    <Link href="/register" aria-description="Go to registration page"
                        className="bg-white text-green-500 p-2 py-1 rounded-md font-semibold">
                        Register
                    </Link>
                </div>
            </nav>
            {children}
        </div>
    )
}

export default PublicLayout;