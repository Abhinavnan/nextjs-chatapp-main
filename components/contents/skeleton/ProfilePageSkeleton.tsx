import { cn } from '@sglara/cn';
import { UserPen } from 'lucide-react';
import { MessageSquare, Info } from 'lucide-react';
import EditPasswordIcon from '@/components/util/Icons/EditPasswordIcon';

interface ProfilePageSkeletonProps {
  type: 'chat' | 'profile' | 'contact'
}

const componentStyle: Record<string, string> = {
    profile: "flex flex-col md:flex-row gap-8 p-4",
    contact: "flex flex-col md:flex-row gap-8 p-4",
    chat: "flex flex-row md:flex-col w-full md:w-60 lg:w-100 gap-4 md:gap-8 p-2 md:p-4 bg-slate-100 shadow-md rounded-md h-30 md:h-auto"
};

const imageStyle: Record<string, string> = {
    profile: "w-full h-[90vw] md:w-52 md:h-52",
    contact: "w-full h-[90vw] md:w-100 md:h-100",
    chat: "w-25 h-25 rounded-full md:size-40 lg:size-70 md:rounded-none md:mx-auto my-auto md:my-0"
}

const ProfilePageSkeleton = ({type} : ProfilePageSkeletonProps) => {
  const chatType = type === 'chat';
  const profileType = type === 'profile';
  const contactType = type === 'contact';
  
  return (
    <section className={componentStyle[type]}>
      <span  aria-description='Profile Picture' className={cn("skeleton bg-slate-200", imageStyle[type])}/>
      <div className={cn("flex flex-col gap-2", chatType ? "flex-1" : "")}>
        <div className="flex items-center gap-3">
            <span aria-description='Profile Name' 
              className={cn("skeleton bg-slate-200 w-full", chatType ? "h-6 md:h-7" : "h-7 md:w-100")} />
            <UserPen aria-description='Edit Profile' className={profileType ? "w-6 h-6 skeleton skeleton-text text-slate-300" : "hidden"}/>
            <EditPasswordIcon aria-description='Edit Password' 
              className={profileType ? "w-6 h-6 skeleton skeleton-text text-slate-300" : "hidden"}
            />
        </div>
        <span aria-description='Profile Email' 
          className={cn("skeleton bg-slate-200", chatType ? "w-[90%] h-4" : "w-[70%] md:w-85 h-4")} />
        <div aria-description='Profile About' className={`${chatType ? "hidden md:flex w-[80%]" : "flex w-[65%] md:w-60"} flex-col gap-1 mt-1`}>
          <span className="h-3 skeleton bg-slate-200" />
          <span className="h-3 skeleton bg-slate-200" />
          <span className="h-3 skeleton bg-slate-200" />
        </div>
        <span aria-description='Message Count' 
          className={profileType ? "w-5 h-5 bg-slate-300 hover:bg-slate-400 skeleton rounded-full text-center text-sm text-white" : 
            "hidden"} 
        />
        <MessageSquare aria-description='Message Icon' className={contactType ? "w-5 h-5 skeleton skeleton-text text-slate-300" : "hidden"} />
        <Info aria-description='Contact Info' 
          className={cn("w-6 h-6 skeleton flex-1 flex flex-col items-end justify-center md:hidden skeleton-text text-slate-300",
            chatType ? "" : "hidden")} 
        />
      </div>
    </section>
  )
}

export default ProfilePageSkeleton;
