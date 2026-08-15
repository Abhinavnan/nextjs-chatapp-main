import {ReactNode, Suspense} from 'react'
import SearchBar from '@/components/contents/SearchBar/SearchBar';
import ContactsButton from '@/components/contents/Navbar/ContactsButton';
import AvatarRoot from '@/components/contents/Navbar/AvatarRoot';
import RoundProfilePictureSkeleton from '@/components/contents/skeleton/RoundProfilePictureSkeleton';

const PrivateLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="navbar bg-green-500 shadow-sm h-12 flex flex-row gap-2 items-center px-2">
        <div className="flex-1 flex justify-start ml-5">
          <SearchBar />
        </div>
        <nav className="flex flex-row gap-4 items-center">
          <ContactsButton />
          <Suspense fallback={<RoundProfilePictureSkeleton className="w-10 h-10 bg-green-600/40" />}>
            <AvatarRoot />
          </Suspense>
        </nav>
      </header>
      {children}
    </div>
  )
}

export default PrivateLayout;