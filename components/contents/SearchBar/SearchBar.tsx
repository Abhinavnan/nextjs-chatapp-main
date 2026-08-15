'use client'
import { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@sglara/cn';
import { useLazySearchContactsQuery } from '@/components/redux/reduxSearch';
import SearchContactCard from './SearchContactCard';

const SearchBar = () => {
  const [triggerSearch, { data: contacts = [], isFetching }] = useLazySearchContactsQuery();
  const [query, setQuery] = useState('');
  const [openContacts, setOpenContacts] = useState(false);
  const containerRef = useRef<HTMLUListElement>(null);
  const activeRequest = useRef<ReturnType<typeof triggerSearch> | null>(null);
  const trimmedQuery = query.trim();
  const isSearching = isFetching && contacts.length === 0;
  const noResult = !isFetching && contacts.length === 0;

  const handleClickOutside = (event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setOpenContacts(false);
    }
  };

  useEffect(() => {
    if(!trimmedQuery)
      return;
    const timer = window.setTimeout(() => {
      activeRequest.current?.abort();
      activeRequest.current = triggerSearch({ query: trimmedQuery, limit: 10 });
    }, 500);
    return () => { 
      window.clearTimeout(timer) 
      activeRequest.current?.abort();
    };
  }, [trimmedQuery, triggerSearch]);

  useEffect(() => {
    if (!openContacts) return;

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openContacts]);

  const handleClose = () => {
    setQuery('');
    setOpenContacts(false);
  }

  const handleClick = () => {
    if(!openContacts){
      activeRequest.current?.abort();
      activeRequest.current = triggerSearch({ query: trimmedQuery, limit: 10 });
      setOpenContacts(true);
    }
  }
    
  return (
    <div className="w-full max-w-xl relative">
      <input
        type="text"
        value={query}
        onClick={handleClick}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search Contacts..."
        className={cn('input input-bordered w-full bg-white opacity-80 h-9 p-2 rounded-sm border-2 border-green-600',
          'ring-2 ring-transparent focus:outline-none focus:ring-white'
        )}
      />
      <button onClick={handleClose}
        className={cn("absolute top-2 right-2 hover:cursor-pointer", openContacts ? "" : "hidden")}>
        <X className="w-5 h-5 black opacity-60" />
      </button>
      {openContacts && (
        <ul ref={containerRef}
          className={cn("absolute top-10 p-2 w-fit bg-teal-100/90 rounded-md shadow-md z-10 grid grid-flow-row grid-cols-1 gap-2",
            "max-h-[85vh] overflow-y-auto w-[90vw] md:w-auto" 
          )}>
          {contacts.map((contact) => (
            <SearchContactCard key={contact.index || contact.email} contact={contact} onClose={handleClose} />
          ))}
          {isSearching &&
            <li key={1} className={cn("flex items-center space-x-4 p-4 bg-mist-50 rounded-lg shadow",
              "hover:bg-gray-50, w-full sm:w-75")}>
                <p className="text-lg font-semibold">Searching...</p>
            </li>
          }
          {noResult &&
            <li key={1} className={cn("flex items-center space-x-4 p-4 bg-mist-50 rounded-lg shadow",
              "hover:bg-gray-50, w-full sm:w-75")}>
                <p className="text-lg font-semibold">No contacts found</p>
            </li>
          }
        </ul>
      )}
    </div>
  );
};

export default SearchBar;