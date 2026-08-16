import { cn } from '@sglara/cn';
import ContactCard from '@/components/contents/contact/ContactCard';
import { getUserContacts } from '@/components/lib/services/contactServices';
import { validateTokenServerSide } from '@/components/lib/actions/authAction';

const ContactPageRoot = async () => {
  const { userId } = await validateTokenServerSide();
  const { contactList } = await getUserContacts(userId);

  return (
    <main className="p-2 sm:p-4">
        <ul className={cn("grid grid-flow-row grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2",
            "place-items-center justify-center w-full"
        )}>
          {contactList.map((contact)=> (
            <ContactCard key={contact.index} contact={contact} />
          ))}
        </ul>
    </main>
  )
}

export default ContactPageRoot;