import { useState } from 'react';
import validate from './validate';

const useInput = () => {
    const [values, setValues] = useState<Record<string, any>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const updateValue = (name: string, value: string | File) => setValues({ ...values, [name]: value });
    const updateForm = (data: Record<string, any>) => setValues(data);
    const clearForm = () => setValues({});

    const validateSubmit = (inputs: string[]) => {
        const emptyInputs = inputs.filter(input => !values[input]);
        const inputErrors = inputs.map(input => errors[input]).filter(Boolean).join('\n');
        const inputFieldsWithErrors = inputs.filter(input => errors[input]);
        const isValid = emptyInputs.length === 0 && inputErrors.length === 0;
        return { isValid, emptyInputs, inputErrors, inputFieldsWithErrors };
    }

    const limitInputLength = ({name, value}: { name: string, value: string }) => {
        if(name === 'verficationCode' && String(value).length > 6){
            return true;
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name } = e.target;
        const limitExceeded = limitInputLength(e.target);
        if(limitExceeded) return;
        
        const { errorMessage, sanitisedValue } = validate(e.target, values as Record<string, string>);
        setValues({ ...values, [name]: sanitisedValue });
        setErrors({ ...errors, [name]: errorMessage});
    };  

    return { values, errors, handleChange, validateSubmit, updateValue, clearForm, updateForm };
}

export default useInput;
