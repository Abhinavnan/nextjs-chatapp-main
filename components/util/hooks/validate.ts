import { validatePassword } from '@/components/util/utility-functions';

interface ValidateProps {
  name: string;
  type: string;
  value: string;
}

const validate = ({name, type, value}: ValidateProps, values: Record<string, string>) => {
    let errorMessage = '';
    let sanitisedValue = value;
    if (type === 'email') {
        sanitisedValue = value.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        errorMessage = emailRegex.test(sanitisedValue) ? '' : 'Invalid email address'
    }
    else if(type === 'password') {
        errorMessage = validatePassword(value);
    }
    if(name === 'name') {
        errorMessage = sanitisedValue.length < 3 ? 'Name must be at least 3 characters long' : '';
    }
    if(name === 'about') {
        errorMessage = sanitisedValue.length < 20 ? 'About must be at least 20 characters long' : 
            sanitisedValue.length > 150 ? 'About must be at most 150 characters long' : '';
    }
    if(name === 'confirmPassword') {
        errorMessage = sanitisedValue !== values.password ? 'Passwords do not match' : '';
    }
    if(name === 'verficationCode') {
        errorMessage = !(/^\d{6}$/).test(sanitisedValue) ? 'Verification code must be 6 digits' : '';
    }
    return { errorMessage, sanitisedValue };
}

export default validate;
