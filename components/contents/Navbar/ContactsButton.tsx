'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const ContactsButton = () => {
    const pathname = usePathname();
    const hideButton = pathname.includes('/contact') && !pathname.startsWith('/contact/');

    return (
        <Link href="/contact">
            <button 
             className={hideButton ? "hidden" : "bg-white text-green-500 p-2 py-1 rounded-md font-semibold cursor-pointer"}>
                Contacts
            </button>
        </Link>
    )
}

export default ContactsButton;
