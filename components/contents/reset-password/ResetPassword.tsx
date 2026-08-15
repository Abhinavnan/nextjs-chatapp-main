'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import posthog from 'posthog-js';
import Link from 'next/link';
import { cn } from '@sglara/cn';
import { toast } from 'react-hot-toast';
import RegistrationForm from '@/components/contents/register/RegistrationForm';
import Input from '@/components/util/form/Input';
import useInput from '@/components/util/hooks/Input-hook';
import useHttp from "@/components/util/hooks/Http-hook";
import { formatArrayString } from '@/components/util/utility-functions';
import { ErrorFormatter, errorToast } from '@/components/util/utility-components';
import useAuth from '@/components/util/hooks/Auth-hook';

type Status = 'initial' | 'verify' | 'reset';

const inputsLabel: Record<string, string> = { email : 'email', verficationCode: 'verification code' }

const ResetPassword = ({type} : {type: 'reset' | 'verifyEmail'}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isLogin } = useAuth(false);
  const { isLoading, sendRequest } = useHttp();
  const { values, errors, handleChange, validateSubmit, clearForm } = useInput();
  const initialStatus = type === 'reset' ? 'initial' : 'verify';
  const paramStatus = searchParams.get('status');
  const [status, setStatus] = useState<Status>(initialStatus);
  const [prevParamStatus, setPrevParamStatus] = useState(paramStatus);
  const disableEmail = type === 'verifyEmail';
  const disableForm = status === 'reset';
  const isInitial = status === 'initial';
  const verifyStatus = status === 'verify'; 

  const thirdButton = [ 
    disableEmail && isLogin && { text: 'Back to Edit profile page', link: '/profile/edit',},
    disableEmail && { text: 'Back to Regitration page', link: '/register',},
    { text: 'Back to login page', link: '/login',}
  ].filter(Boolean)[0];
  
  if (paramStatus !== prevParamStatus) {
    setPrevParamStatus(paramStatus);
        if (paramStatus === 'new' && status !== initialStatus) {
        setStatus(initialStatus);
    }
  }

  useEffect(() => {
    if (paramStatus === 'new' && status !== initialStatus) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('status');
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [paramStatus, initialStatus, status, pathname, searchParams, router]);

  const verifyInputs = (inputs: string[]) => {
      const { isValid, emptyInputs, inputErrors } = validateSubmit(inputs);
      if (!isValid) {
        const emptyInputsLabel = emptyInputs.map(input => inputsLabel[input]); 
        const formattedMessage = emptyInputs.length > 0 ? 'Enter ' + formatArrayString(emptyInputsLabel) : '';
        toast.error(<div>
            <ErrorFormatter errorText={formattedMessage} />
            <ErrorFormatter errorText={inputErrors} />
        </div>);
      }
      return isValid;
  }
  
  const sendVerificationCode = async () => {
      const payload : Record<string, string> = {};
      if(isInitial && !disableEmail){
        payload['email'] = values.email;
      }
      try{
        const { message } = await sendRequest('post', '/user/verify/send-otp', payload);
        toast.success(<ErrorFormatter errorText={message} tostType='success' />);
      }catch(error: any){
        errorToast(error, 'Failed to send verification code');
      }
  }

  const sendVerificationCodeByEmail = async () => {
      const isValid = verifyInputs(['email']);
      if(!isValid) return;
      await sendVerificationCode();
      posthog.capture('password_reset_requested');
      setStatus('verify');
  }

  const verifyEmail = async () => {
      const isValid = verifyInputs(['verficationCode']);
      if(!isValid) return;
      const payload : Record<string, number> = {otp: Number(values.verficationCode)};
      const path = disableEmail ? '/user/verify/verify-email' : '/user/verify/verify-otp';
      try{
        const { message } = await sendRequest('patch', path, payload);
        toast.success(<ErrorFormatter errorText={message} tostType='success' />);
        if(type === 'reset'){
          setStatus('reset');
        }else{
          clearForm();
          posthog.capture('email_verified', { context: type });
          router.push(isLogin ? '/profile' : '/contact');
        }
      }catch(error: any){
        errorToast(error, 'Failed to verify email');
      }
  }
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isInitial) {
      await sendVerificationCodeByEmail();
    }
    else if(status === 'verify'){
      await verifyEmail();
    }
  }
  
  return (
    <div className="w-full md:w-96 items-center flex flex-col">
      <form onSubmit={handleSubmit}
        className={cn("grid grid-cols-1 place-items-center gap-1 w-[calc(100%-1.5rem)] p-6 bg-white rounded-lg shadow-md m-2", 
            disableForm ? "hidden" : "")}>
        <h1 className="text-2xl font-bold">Verify your email</h1>
        <Input type="email" label="Email" id="email" name="email" placeholder="Enter your email" required={!disableEmail} onChange={handleChange}
          errorText={errors.email} value={values.email || ''} disabled={verifyStatus} className={disableEmail ? "hidden" : ""} />
        <button type="button" onClick={() => setStatus('initial')}
          className={cn("bg-white text-blue-500 hover:text-blue-600 text-sm hover:underline mt-[-8] text-right", 
            "rounded-md hover:border-blue-600 transition w-full", (disableEmail || !verifyStatus) ? "hidden" : "" )}>
            Change email
        </button>
        <Input type="number" label="Verification Code" id="verficationCode" name="verficationCode" placeholder="Enter 6 digit verification code" 
          required={!isInitial} onChange={handleChange} value={values.verficationCode || ''} errorText={errors.verficationCode} pattern="[0-9]*"
          className={isInitial ? "hidden" : "no-arrows"}/>
        <button type="submit" disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition w-full mt-2 disabled:opacity-50 opacity-100">
            {isInitial ? 'Send verification code' : 'Verify email'}
        </button>
        <button type="button" disabled={isLoading} onClick={sendVerificationCode}
          className={cn("bg-white text-blue-500 hover:text-blue-600 px-4 py-2 rounded-md hover:border-blue-600 transition w-full",
            "border border-blue-500 hover:bg-blue-50 mt-1 opacity-100 disabled:opacity-80", isInitial ? "hidden" : "")}>
            Resend verification code
        </button>
        <Link href={thirdButton.link} 
          className={cn("bg-white text-green-500 hover:text-green-600 px-4 py-2 rounded-md hover:border-green-600 transition w-full",
            "border border-green-500 hover:bg-green-50 mt-1 text-center")}>
            {thirdButton.text}
        </Link>
      </form>
      { status === 'reset' && <RegistrationForm type="reset" />}
    </div>
  )
}

export default ResetPassword;
