'use client'
import { useEffect } from 'react';
import Image from 'next/image';

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset, }: ErrorProps) {
  useEffect(() => {
    console.error('Chat error:', error)
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center h-134 max-h-screen bg-gray-100 p-2">
      <div className="py-5">
        <h2 className="text-2xl font-bold text-red-500">Something went wrong in Chat!</h2>
      </div>
      <Image src="https://iberikatrail.barrel.cloud/assets/error-D5dwkC3o.png" alt="Error" width={700} height={700} loading='eager'
        className="max-w-xl max-h-xl mx-auto rounded-md" />
      <p className="text-lg text-gray-700 py-2">{error.message}</p>
      <button onClick={() => reset()}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition cursor-pointer"
      >
        Try again
      </button>
    </div>
  )
}
