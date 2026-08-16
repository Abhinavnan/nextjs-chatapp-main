import { Suspense } from "react";
import EditProfilePageRoot from "@/components/contents/profile/EditProfilePageRoot";
import EditProfilePageSkeleton from "@/components/contents/skeleton/EditProfilePageSkeleton";

export const instant = false;

const EditProfile = () => {
  return (
    <Suspense fallback={<EditProfilePageSkeleton />}>
      <EditProfilePageRoot />
    </Suspense>
  )
}

export default EditProfile;
