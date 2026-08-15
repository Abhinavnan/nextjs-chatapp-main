'use client'
import Image from 'next/image';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@sglara/cn';
import DummyProfile from '@/public/dummy-profile.svg';
import useAuth from '@/components/util/hooks/Auth-hook';
import useActivity from '@/components/util/hooks/Activity-hook';

const Avatar = ({profilePicture}: {profilePicture: string}) => {
  const pathname = usePathname();
  const activity = useActivity();
  const { handleLogout } = useAuth(true);
  const [isOpen, setIsOpen] = useState(true);
  const hideProfileButton = pathname.endsWith('/profile');

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  }
  
  return (
    <div className="dropdown dropdown-end relative">
      <button tabIndex={0} className="items-center flex cursor-pointer" onClick={toggleDropdown}>
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <Image src={ profilePicture || DummyProfile } alt="avatar" width={44} height={44} loading="eager" 
            className={cn("w-full h-full object-cover object-top pointer-events-none", profilePicture ? "" : "bg-slate-100")} />
        </div>
      </button>
      {isOpen && (
        <ul tabIndex={-1}
          className="absolute right-0 mt-2 p-2 shadow menu dropdown-content bg-olive-50 rounded-box">
          <li className={hideProfileButton ? "hidden" : ""}>
            <a className="justify-between" href="/profile">
              Profile
            </a>
          </li>
          <div className={hideProfileButton ? "hidden" : "border-t border-gray-200 my-1"}/>
          <li>
            <button onClick={handleLogout} className="cursor-pointer justify-between">Logout</button>
          </li>
        </ul>
      )}
    </div>
  )
}

export default Avatar;