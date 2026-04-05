import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function generateCustomId(role) {
    const year = new Date().getFullYear().toString().slice(-2); // e.g., '26'

    if (role === 'teacher') {
        return `TCH${year}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    if (role === 'student') {
        const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
        return `ED${year}-${randomDigits}`;
    }
    return null;
}
