import React from 'react'
import { cn } from '@sglara/cn';

const RoundProfilePictureSkeleton = ({className}: {className?: string}) => {
  return (
    <span aria-description='Profile picture' 
      className={cn("w-14 h-14 bg-slate-300 skeleton shrink-0 aspect-square rounded-full", className)} />
  )
}

export default RoundProfilePictureSkeleton;
