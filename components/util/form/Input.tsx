'use client'
import React, { useState } from 'react';
import { cn } from '@sglara/cn';
import { EyeOff, Eye } from 'lucide-react';
import { ErrorFormatter } from "@/components/util/utility-components";

interface InputProps {
    label: string;
    id: string;
    name: string;
    placeholder: string;
    required?: boolean;
    errorText?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    className?: string;
    value?: string;
    type?: string;
    pattern?: string;
    disabled?: boolean;
    maxLength?: number;
    rows?: number;
}

const Input = ({ label, id, name, placeholder, required, errorText, onChange, className, value, type = "text", ...props }: InputProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const errorClass = errorText ? "focus:outline-red-600 border-red-500" : "";
    const showInput = type !== 'textArea';
    const showTextArea = type === 'textArea';

    return (
        <div className={cn("flex flex-col w-full input-container", className)}>
            <label htmlFor={id} className="block text-sm font-medium text-heading">{label}</label>
            <div className="relative">
                {showInput &&
                    <input type={showPassword ? 'text' : type} id={id} name={name} placeholder={placeholder} required={required} onChange={onChange}
                        value={value} {...props}
                        className={cn("bg-neutral-secondary-medium border border-gray-400  text-heading text-sm rounded-md disabled:opacity-50",
                            "focus:outline-gray-600 block w-full px-3 py-2.5 shadow-xs placeholder:text-body mb-1 disabled:cursor-not-allowed",
                            errorClass, className)} />}
                {showTextArea &&
                    <textarea id={id} name={name} placeholder={placeholder} required={required} onChange={onChange} value={value} {...props}
                        className={cn("bg-neutral-secondary-medium border border-gray-400  text-heading text-sm rounded-md disabled:opacity-50",
                            "focus:outline-gray-600 block w-full px-3 py-2.5 shadow-xs placeholder:text-body mb-1 disabled:cursor-not-allowed",
                            errorClass, className)} />}
                {type === 'password' && <div className="absolute top-1/4 right-2 cursor-pointer text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5 " />}
                </div>}
            </div>
            {errorText && <ErrorFormatter errorText={errorText} />}
        </div>
    )
}

export default Input;
