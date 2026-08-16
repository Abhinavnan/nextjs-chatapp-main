import { Suspense  } from "react";
import ContactPageRoot from "@/components/contents/contact/ContactPageRoot";
import RoundProfilePictureSkeleton from '@/components/contents/skeleton/ConatctPageSkeleton';

export const instant = false;

const ContactPage = () => {
  return (
    <Suspense fallback={<RoundProfilePictureSkeleton />}>
      <ContactPageRoot />
    </Suspense>
  );
}

export default ContactPage;