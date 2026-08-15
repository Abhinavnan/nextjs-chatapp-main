import React from 'react';
import ResetPassword from '@/components/contents/reset-password/ResetPassword';

const VerifyEmailPage = () => {
  return (
    <div className="flex flex-col flex-1 items-center justify-center h-[100vh-3rem]">
      <ResetPassword type="verifyEmail" />
    </div>
  )
}

export default VerifyEmailPage;
