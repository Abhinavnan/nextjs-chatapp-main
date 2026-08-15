import React from 'react';
import RegistrationForm from '@/components/contents/register/RegistrationForm';

const Login = () => {
  return (
    <section id="login" aria-labelledby="login" aria-label='Login form' 
      className="flex flex-col flex-1 items-center justify-center h-[100vh-3rem]">
      <RegistrationForm type="login" />
    </section>
  )
}

export default Login;