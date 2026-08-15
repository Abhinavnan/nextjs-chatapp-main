import RegistrationForm from '@/components/contents/register/RegistrationForm';

const profileData = {
    name: '',
    email: '',
    profilePicture: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
    about: '',
    verified: false
}

const EditProfilePageSkeleton = () => {
  return (
    <main className="flex flex-col flex-1 items-center justify-center h-[100vh-3rem]">
        <RegistrationForm type="edit" profileData={profileData} />
    </main>
  )
}

export default EditProfilePageSkeleton;
