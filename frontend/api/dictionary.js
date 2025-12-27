import apiClient from './client.js';

export const getDictionaryByCodes = async (learning_language_code, native_language_code) => {
    try {
        const response = await apiClient.get(`/dictionary/${learning_language_code}/${native_language_code}`);
        
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'An error occurred';
        throw new Error(message);
    }
}   