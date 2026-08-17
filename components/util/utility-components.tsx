import React, { ReactNode } from "react";
import { cn } from "@sglara/cn";
import { toast } from "react-hot-toast";

interface TooltipProps {
    text: string;
    children: ReactNode;
    className?: string;
}

type TostType = 'success' | 'error';

const Tooltip = ({ text, children, className }: TooltipProps) => {
    return (
        <div className="group relative flex items-center">
            {children}
            <span
                className={cn("absolute bottom-full hidden left-1/2 -translate-x-1/2 group-hover:block px-2 py-1 text-sm",
                    "text-white bg-gray-500 rounded shadow-lg whitespace-nowrap dark:bg-gray-800", className)}>
                {text}
            </span>
        </div>
    );
};

const textColor: Record<TostType, string> = {
    success: 'text-green-500',
    error: 'text-red-800 error-text dark:text-red-700',
}

const ErrorFormatter = ({ errorText, tostType = 'error' }: { errorText: string, tostType?: TostType }) => {
    if (typeof errorText !== 'string')
        return '';
    return (
        <div className="flex flex-col items-start gap-1">
            {errorText.split('\n').map((line, index) => (
                <p key={index} className={`text-sm ${textColor[tostType]}`}>{line}</p>
            ))}
        </div>
    )
}

const errorToast = (error: any, heading: string) => toast.error(<div className="flex flex-col gap-2">
    <h3>{heading}</h3>
    <ErrorFormatter errorText={error} />
</div>);

export { Tooltip, ErrorFormatter, errorToast };