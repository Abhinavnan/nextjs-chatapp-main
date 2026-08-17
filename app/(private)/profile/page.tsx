import { Suspense } from "react"
import ProfilePageRoot from "@/components/contents/profile/ProfilePageRoot"
import ProfilePageSkeleton from "@/components/contents/skeleton/ProfilePageSkeleton"

export const instant = false;

const ProfilePage = () => {
  return (
    <Suspense fallback={<ProfilePageSkeleton type='profile' />}>
      <ProfilePageRoot />
    </Suspense>
  )
}

export default ProfilePage
