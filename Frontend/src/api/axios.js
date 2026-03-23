import axios from 'axios'
import ApiError from '../utils/ApiError'
import ApiResponse from '../utils/ApiResponse'

const api = axios.create({
    // creating base url 
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
    withCredentials: true, // send cookies
});

// ─── Response Interceptor ───────────────────────────────────────────
// Automatically wraps every response in ApiResponse and every error in ApiError
// so no manual parsing is needed in contexts or pages.

api.interceptors.response.use(
    // ✅ Success — wrap in ApiResponse
    (response) => {
        const parsed = ApiResponse.from(response);
        // Attach the parsed response to the original so both are accessible
        response.parsed = parsed;
        return response;
    },

    // ❌ Error — wrap in ApiError and reject
    (error) => {
        const apiError = ApiError.from(error);

        // Log in development only
        if (import.meta.env.DEV) {
            console.error(`${apiError}`);
        }

        return Promise.reject(apiError);
    }
);

export default api;