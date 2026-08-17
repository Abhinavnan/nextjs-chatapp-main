'use client';
import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import posthog from "posthog-js";
import Image from "next/image";
import { Image as ImageIcon, ImageMinus } from 'lucide-react';
import { cn } from "@sglara/cn";
import { toast } from "react-hot-toast";
import useInput from "@/components/util/hooks/Input-hook";
import Input from "@/components/util/form/Input";
import useHttp from "@/components/util/hooks/Http-hook";
import { formatArrayString } from "@/components/util/utility-functions";
import { ErrorFormatter, errorToast } from "@/components/util/utility-components";
import { UserDetails } from "@/components/util/types";
import DummyProfile from "@/public/dummy-profile.svg";

interface RegistrationFormProps {
  type: 'register' | 'login' | 'reset' | 'edit' | 'changePassword';
  profileData?: UserDetails
}

const inputFields = {
  register: ['name', 'email', 'password', 'confirmPassword'],
  login: ['email', 'password'],
  reset: ['password', 'confirmPassword'],
  edit: ['name', 'email', 'about'],
  changePassword: ['password', 'confirmPassword', 'oldPassword']
}
const formTitle = {
  register: 'Create an account',
  login: 'Login',
  reset: 'Reset Password',
  edit: 'Edit Profile',
  changePassword: 'Change Password'
}
const inputLabels: Record<string, string> = {
  name: 'Name',
  email: 'Email',
  password: 'Password',
  confirmPassword: 'Confirm Password'
}
const primaryButtonText = {
  register: 'Register',
  login: 'Login',
  reset: 'Reset Password',
  edit: 'Save',
  changePassword: 'Change Password'
}
const secondaryButtonText = {
  register: 'Already have an account? Login',
  login: 'Don\'t have an account? Register',
  reset: 'Back to Login',
  edit: 'Back to Profile',
  changePassword: 'Back to Profile'
}
const secondaryButtonLinks = {
  register: '/login',
  login: '/register',
  reset: '/login',
  edit: '/profile',
  changePassword: '/profile'
}

const RegistrationForm = ({ type, profileData }: RegistrationFormProps) => {
  const router = useRouter();
  const { isLoading, sendRequest } = useHttp();
  const { values, errors, handleChange, validateSubmit, updateValue, clearForm, updateForm } = useInput();
  const [profilePicture, setProfilePicture] = useState<string | null | undefined>(profileData?.profilePicture || null);
  const [imageUrl, setImageUrl] = useState<string | null | undefined>(profilePicture);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const islogin = type === 'login';
  const formFields = inputFields[type];
  const enableImageUpload = ['register', 'edit'].includes(type);
  const checkField = (field: string) => formFields.includes(field);

  useEffect(() => {
    if (profileData && type === 'edit') {
      updateForm(profileData);
    }
  }, [type])

  const registerUser = async () => {
    const formData = new FormData();
    if (values.profilePicture) {
      formData.append('profilePicture', values.profilePicture);
    }
    formFields.forEach(field => formData.append(field, values[field]));
    try {
      const { message } = await sendRequest('post', '/user/create', formData);
      posthog.identify(values.email, { name: values.name });
      posthog.capture('user_registered');
      toast.success(<ErrorFormatter errorText={message} tostType='success' />);
      router.push('/register/verify-email');
      clearForm();
    } catch (error: any) {
      errorToast(error, 'Failed to register user');
    }
  }

  const loginUser = async () => {
    const payload = { email: values.email, password: values.password };
    try {
      const { message, verified } = await sendRequest('post', '/user/authentication/login', payload);
      clearForm();
      if (!verified) {
        errorToast(message, 'Account not verified');
        router.push('/register/verify-email');
        return;
      }
      toast.success(message);
      posthog.identify(values.email);
      posthog.capture('user_logged_in');
      router.push('/contact');
    } catch (error: any) {
      errorToast(error, 'Failed to login');
    }
  }

  const updatePassword = async () => {
    const isReset = type === 'reset';
    const path = isReset ? '/user/update/reset-password' : '/user/update/change-password';
    try {
      const { message } = await sendRequest('patch', path, values);
      toast.success(message);
      clearForm();
      if (isReset) {
        posthog.capture('password_reset_completed');
        router.push('/login');
      } else {
        posthog.capture('password_changed');
        router.push('/profile');
      }
    } catch (error: any) {
      errorToast(error, isReset ? 'Failed to reset password' : 'Failed to update password');
    }
  }

  const updateUserDetails = async () => {
    const formData = new FormData();
    if (values.profilePicture) {
      formData.append('profilePicture', values.profilePicture);
    }
    formFields.forEach(field => formData.append(field, values[field]));
    try {
      const { message } = await sendRequest('patch', '/user/update/profile', formData);
      posthog.capture('profile_edited');
      toast.success(message);
      clearForm();
      if (profileData?.email === values.email && profileData?.verified) {
        router.push('/profile');
      } else {
        router.push('/register/verify-email');
        toast.success('Please verify your new email.');
      }
    } catch (error: any) {
      errorToast(error, 'Failed to update user');
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { isValid, emptyInputs, inputErrors, inputFieldsWithErrors } = validateSubmit(formFields);
    if (!isValid) {
      const customError = ['login', 'changePassword'].includes(type) ? 'Incorrect password' : '';
      const inputErrorLabels = inputFieldsWithErrors.map(input => ['password', 'oldPassword'].includes(input) ? customError : errors[input])
        .filter(Boolean).join('\n');
      const emptyInputLabels = emptyInputs.map(input => inputLabels[input]);
      const formattedMessage = emptyInputs.length > 0 ? 'Enter ' + formatArrayString(emptyInputLabels) : '';
      toast.error(<div>
        <ErrorFormatter errorText={formattedMessage} />
        <ErrorFormatter errorText={customError ? inputErrorLabels : inputErrors} />
      </div>);
      return;
    }
    if (type === 'register') {
      await registerUser();
    } else if (type === 'login') {
      await loginUser();
    } else if (['reset', 'changePassword'].includes(type)) {
      await updatePassword();
    } else if (type === 'edit') {
      await updateUserDetails();
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > 1) {
        toast.error('File size is too large. Please select a file less than 1MB.');
        return;
      }
      const imageUrl = URL.createObjectURL(file);
      setImageUrl(imageUrl);
      updateValue('profilePicture', file);
    }
  }

  const handleRemoveProfilePicture = async () => {
    let existingProfilePicture = profilePicture;
    if (profileData?.profilePicture === values.profilePicture) {
      if (isLoading) return;
      try {
        const { message } = await sendRequest('delete', '/user/delete/profile-picture');
        posthog.capture('profile_picture_removed');
        toast.success(message);
        existingProfilePicture = null;
        setProfilePicture(null);
      } catch (error: any) {
        errorToast(error, 'Failed to remove profile picture');
        return;
      }
    }
    setImageUrl(existingProfilePicture || null);
    updateValue('profilePicture', existingProfilePicture || null as any);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <form onSubmit={handleSubmit}
      className="grid grid-cols-1 place-items-center gap-1 w-[calc(100%-2rem)] md:w-96 p-6 bg-white rounded-lg shadow-md m-2">
      <h2 className="text-2xl font-bold mb-4">{formTitle[type]}</h2>
      {enableImageUpload && <Image src={imageUrl || DummyProfile} loading="eager" alt="Profile Picture"
        width={100} height={100} className="w-35 h-35 object-cover object-top mb-2" />}
      {checkField('name') && <Input id="name" name="name" label="Name" placeholder="Enter your name" required onChange={handleChange}
        errorText={errors.name} value={values.name || ''} />}
      {checkField('email') && <Input id="email" name="email" label="Email" placeholder="Enter your email" required onChange={handleChange}
        errorText={errors.email} value={values.email || ''} type="email" />}
      {checkField('about') && <Input id="about" name="about" label="About" placeholder="Enter about yourself" required rows={3}
        onChange={handleChange} errorText={errors.about} value={values.about || ''} type="textArea" />}
      {checkField('oldPassword') && <Input id="oldPassword" name="oldPassword" label="Current Password" required onChange={handleChange}
        type="password" placeholder="Enter your current password" value={values.oldPassword || ''} />}
      {checkField('oldPassword') && <Link href="/reset-password?status=new"
        className="text-sm text-green-600 hover:underline w-full flex justify-end mt-[-8] dark:text-green-500">
        forgot password?
      </Link>}
      {checkField('password') && <Input id="password" name="password" label="Password" placeholder="Enter your password" required
        type="password" value={values.password || ''} onChange={handleChange} errorText={islogin ? '' : errors.password} />}
      {islogin && <Link href="/reset-password?status=new"
        className="text-sm text-green-600 hover:underline w-full flex justify-end mt-[-8] dark:text-green-500">
        forgot password?
      </Link>}
      {checkField('confirmPassword') && <Input id="confirmPassword" name="confirmPassword" label="Confirm Password"
        placeholder="Confirm your password" required type="password" value={values.confirmPassword || ''} onChange={handleChange}
        errorText={errors.confirmPassword || ''} />}
      {enableImageUpload && <div className="flex flex-col w-full items-center">
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isLoading}
          className="bg-sky-500 text-white p-2 mt-2 rounded hover:bg-sky-600 w-full flex disabled:opacity-50 cursor-pointer">
          <ImageIcon aria-label="upload profile picture" />
          <p className="flex-1 text-center">Upload Profile Picture</p>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>}
      {(imageUrl || values.profilePicture) && <button type="button" disabled={isLoading} onClick={handleRemoveProfilePicture}
        className="bg-red-500 text-white p-2 mt-2 rounded hover:bg-red-600 w-full flex disabled:opacity-50 cursor-pointer">
        <ImageMinus />
        <p className="flex-1 text-center">Remove Profile Picture</p>
      </button>}
      <button type="submit" disabled={isLoading}
        className={cn("bg-green-500 text-white p-2 mt-2 rounded hover:bg-green-600 w-full disabled:opacity-50 cursor-pointer",
          "disabled:cursor-not-allowed")}>
        {primaryButtonText[type]}
      </button>
      <Link href={secondaryButtonLinks[type]}
        className={cn("border border-green-500 text-green-500 p-2 mt-2 rounded text-center secondary dark:hover:bg-mist-900/90",
          "hover:border-green-600 w-full hover:text-green-600 hover:bg-green-100 dark:hover:text-green-400")}>
        {secondaryButtonText[type]}
      </Link>
    </form>
  )
}

export default RegistrationForm;
