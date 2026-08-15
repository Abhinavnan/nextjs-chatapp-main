import { MessageSquare, Info } from 'lucide-react';
import { cn } from '@sglara/cn';

const contactList = Array.from('12345678');

const ConatctPageSkeleton = () => {
  return (
    <main className="p-2 sm:p-4">
        <ul className={cn("grid grid-flow-row grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2",
            "place-items-center justify-center w-full"
        )}>
            {contactList.map((contact)=> (
                <li key={contact} 
                    className="flex items-center space-x-4 p-4 bg-slate-100 skeleton rounded-lg shadow w-full sm:w-75">
                    <span aria-description='Profile picture' className="w-14 h-14 bg-slate-300 skeleton shrink-0 aspect-square rounded-full" />
                    <div className="flex flex-col w-full">
                            <span aria-description='Contact Name' className="bg-slate-300 skeleton w-40 h-4" />
                            <span aria-description='Contact Email' className="bg-slate-300 skeleton w-37 h-3 mt-1" />
                        <div className="flex items-start justify-between gap-2 mt-2 w-full">
                            <div aria-description='Contact Status' className="flex items-center">
                                <span className="status skeleton"/>
                                <span className="ml-2 bg-slate-300 skeleton w-7 h-2" />
                            </div>  
                            <div className="flex items-center gap-2">
                                <span aria-description='Message Count' 
                                 className="w-5 h-5 bg-slate-300 hover:bg-slate-400 skeleton rounded-full text-center text-sm text-white" />
                                <MessageSquare aria-description='Message Icon' className="w-5 h-5 skeleton skeleton-text text-slate-300" />
                                <Info aria-description='Contact Info' className="w-6 h-6 skeleton skeleton-text text-slate-300" />
                            </div>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    </main>
  )
}

export default ConatctPageSkeleton;
