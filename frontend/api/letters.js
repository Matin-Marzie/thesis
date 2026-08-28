import apiClient from './client.js';

export const getLettersByCode = async (language_code) => {
    try {
        const response = await apiClient.get(`/letters/${language_code}`);

        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'An error occurred';
        throw new Error(message);
    }
}
