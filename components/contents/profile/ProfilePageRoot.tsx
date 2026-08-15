import Image from 'next/image';
import Link from 'next/link';
import { UserPen } from 'lucide-react';
import EditPasswordIcon from '@/components/util/Icons/EditPasswordIcon';
import { Tooltip } from '@/components/util/utility-components';
import { validateTokenServerSide } from '@/components/lib/actions/authAction';
import DummyProfile from '@/public/dummy-profile.svg';

const ProfilePageRoot = async () => {
  const profileData = await validateTokenServerSide();
  return (
    <section className="flex flex-col md:flex-row gap-8 p-4">
      <Image src={profileData.profilePicture || DummyProfile} alt='profile picture' width={300} height={300} loading='eager' 
        className="w-full md:w-52"/>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
            <h1 className="text-5xl font-bold">{profileData.name}</h1>
            <Tooltip text="Edit Profile" className="cursor-pointer">
                <Link href="/profile/edit" className="w-6 h-6 text-gray-600 hover:text-gray-800 transition">
                    <UserPen className="w-6 h-6 text-gray-600 hover:text-gray-800 transition" />
                </Link>
            </Tooltip>
            <Tooltip text="Change Password" className="cursor-pointer">
                <Link href="/profile/change-password" className="w-6 h-6 text-gray-600 hover:text-gray-800 transition">
                    <EditPasswordIcon className="w-6 h-6 text-gray-600 hover:text-gray-800 transition"/>
                </Link>
            </Tooltip>
        </div>
        <p className="text-lg text-gray-500">{profileData.email}</p>
        <p className="text-md text-gray-700">{profileData.about}</p>
      </div>
    </section>
  )
}

export default ProfilePageRoot;