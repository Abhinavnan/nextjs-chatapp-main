import RegistrationForm from '@/components/contents/register/RegistrationForm';
import { validateTokenServerSide } from '@/components/lib/actions/authAction';

const EditProfilePageRoot = async () => {
  const { profilePicture, name, email, about, verified } = await validateTokenServerSide();
  const profileData = { profilePicture, name, email, about, verified };
  return (
    <main className="flex flex-col flex-1 items-center justify-center h-[100vh-3rem]">
      <RegistrationForm type="edit" profileData={profileData} />
    </main>
  )
}

export default EditProfilePageRoot;