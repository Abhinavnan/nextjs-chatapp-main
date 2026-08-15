import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ReduxProvider from "../components/redux/ReduxProvider";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chat APP",
  description: "A simple chat application built with Next.js, React, and Redux.",
  authors: [{ name: "ABHINAV U V", url: "https://github.com/Abhinavnan" }],
  creator: "ABHINAV U V",
  applicationName: "Chat APP",
};

export default function RootLayout({ children}: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}antialiased min-h-screen flex flex-col`}>
        <ReduxProvider>
          {children}
        </ReduxProvider>
        <Toaster position="top-center" reverseOrder={false} />
      </body>
    </html>
  );
}
