import { Suspense } from "react";
import ContactIndexPageRoot from "@/components/contents/contact/ContactIndexPageRoot";
import ProfilePageSkeleton from "@/components/contents/skeleton/ProfilePageSkeleton";

interface ContactDetailsPageProps {
  params: Promise<{ index: string; }>;
}

export const instant = false;

const ContactDetailsPage = ({ params }: ContactDetailsPageProps) => {
  return (
    <Suspense fallback={<ProfilePageSkeleton type='contact' />} >
      <ContactIndexPageRoot params={params} />
    </Suspense>
  )
}

export default ContactDetailsPage;