import { useState, useCallback, useEffect, useRef } from 'react';
import axios, { AxiosRequestConfig, Method } from 'axios';

const useHttp = () => {
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<string | null>(null);
    const activeHttpRequests = useRef<AbortController[]>([]);
    const isLoading = Object.keys(loading).some((key) => loading[key]);

    const sendRequest = useCallback(
        async (method: Method, path: string, data?: any, timeout = 11000) => {
            const url = '/api' + path;
            setError(null);
            setLoading((prevState) => ({ ...prevState, [path]: true }));
            const abortCtrl = new AbortController();
            activeHttpRequests.current.push(abortCtrl);
            const signal = abortCtrl.signal;
            try {
                let request: AxiosRequestConfig = { url, method, signal, timeout };
                if (method === 'get') {
                    request = { ...request, params: data };
                } else if (['patch', 'post', 'put'].includes(method)) {
                    request = { ...request, data };
                }
                const response = await axios(request);
                activeHttpRequests.current = activeHttpRequests.current.filter((reqCtrl) => reqCtrl !== abortCtrl);
                return response.data;
            } catch (err) {
                let message = 'Something went wrong!\nPlease try again.';
                if (axios.isAxiosError(err)) {
                    message = err.response?.data?.message || err.message || message;
                } else if (err instanceof Error) {
                    message = err?.message || message;
                }
                setError(message);
                throw message;
            } finally {
                setLoading((prevState) => ({ ...prevState, [path]: false }));
            }
        },
        []
    );

    useEffect(() => {
        return () => {
            activeHttpRequests.current.forEach((abortCtrl) => abortCtrl.abort());
        };
    }, []);

    const clearError = () => setError(null);

    return { error, isLoading, loading, sendRequest, clearError };
};

export default useHttp;