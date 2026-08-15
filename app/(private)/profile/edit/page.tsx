import { Suspense } from "react";
import EditProfilePageRoot from "@/components/contents/profile/EditProfilePageRoot";
import EditProfilePageSkeleton from "@/components/contents/skeleton/EditProfilePageSkeleton";


const EditProfile = () => {
  return (
    <Suspense fallback={<EditProfilePageSkeleton />}>
      <EditProfilePageRoot />
    </Suspense>
  )
}

export default EditProfile;
