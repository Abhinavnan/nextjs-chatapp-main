import React from 'react'
import ContactDetails from "@/components/contents/contact/ContactDetails"
import { getReceiverDetailsByIndex } from "@/components/lib/services/contactServices";
import { validateTokenServerSide } from "@/components/lib/actions/authAction";
import { sanitiseContactData } from "@/components/util/utility-functions";

interface ContactDetailsPageProps {
  params: Promise<{ index: string; }>;
}

const ContactIndexPageRoot = async ({ params }: ContactDetailsPageProps) => {
  const { userId } = await validateTokenServerSide(false);
  const { index } = await params;
  const receiverData = await getReceiverDetailsByIndex(userId, Number(index));
  const contactData = sanitiseContactData(receiverData);

  return (<ContactDetails type="contact" contactData={contactData} />)
}

export default ContactIndexPageRoot;
