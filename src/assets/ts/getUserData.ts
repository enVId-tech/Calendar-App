import { UserData } from "./interfaces";

async function getUserData(): Promise<UserData[] | null | undefined> {
    try {
        const response: Response = await fetch('/api/post/user', {"method": "POST", credentials: 'include'});
        
        if (response.status === 404) {
            console.error('Error: No user data found');
            window.location.href = '/login';
            return null;
        } else if (response.status === 400) {
            console.error('Error: Bad request');
            window.location.href = '/login';
            return null;
        } else if (response.status === 401) {
            console.error('Error: You must be logged in to view this page');
            window.location.href = '/login';
            return;
        } else if (response.status === 500) {
            console.error('Error: An error occurred. Please try again later.');
            window.location.href = '/login';
        }

        const result: UserData[] | null | undefined = await response.json();

        if (!result || result === null) {
            console.error(result);
            console.error('Error: No data found');
            return null;
        }

        return result;
    } catch (error: unknown) {
        console.error('Error:', error);
    }

    return;
}

export default getUserData;