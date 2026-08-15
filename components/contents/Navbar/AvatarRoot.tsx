import Avatar from '@/components/contents/Navbar/Avatar';
import { validateTokenServerSide } from '@/components/lib/actions/authAction';

const AvatarRoot = async () => {
  const { profilePicture } = await validateTokenServerSide();
  return (
    <Avatar profilePicture={profilePicture} />
  )
}

export default AvatarRoot;
