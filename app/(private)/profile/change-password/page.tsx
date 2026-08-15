import React from 'react';
import RegistrationForm from '@/components/contents/register/RegistrationForm';

const ChangePasswordPage = () => {
  return (
    <div className="flex flex-col flex-1 items-center justify-center h-[100vh-3rem]">
      <RegistrationForm type="changePassword" />
    </div>
  )
}

export default ChangePasswordPage;
