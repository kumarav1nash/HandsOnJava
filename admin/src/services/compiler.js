import { adminApi } from './api'

export const runJava = async (code, input = '') => {
    // Using the same endpoint as client, but proxied through admin api helper if needed
    // or directly fetch if we want to bypass admin auth headers (but backend might need auth?)
    // The JavaController /api/java/run is likely public or needs user auth.
    // Since we are admin, we can use adminApi to fetch it, assuming backend allows admin to run code.

    // Actually, JavaController might be open. Let's try using adminApi to send the request.
    // If /api/java/run is not under /api/admin, we might need a direct fetch or update adminApi to support non-admin endpoints.

    // Let's assume we can use fetch directly to /api/java/run for now, 
    // but we might need to handle CORS or Auth if it's protected.
    // Best bet: Use adminApi but point to /java/run (relative to base /api)

    // adminApi base is /api or /api/admin? 
    // In api.js: const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api');
    // And apiRequest does `${API_BASE_URL}${endpoint}`

    // So if we pass '/java/run', it becomes '/api/java/run'. Perfect.

    return adminApi.runCode({ code, input })
}

// We need to add runCode to adminApi in api.js first.
// Or just use a custom fetch here.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api');

export const runJavaDirect = async (code, input = '') => {
    const response = await fetch(`${API_BASE_URL}/java/run`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, input })
    });
    if (!response.ok) {
        throw new Error('Compilation failed');
    }
    return response.json();
}
