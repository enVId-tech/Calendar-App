import { UserData } from "./interfaces";

async function getUserData(): Promise<UserData[] | null | undefined> {
    try {
        const response: Response = await fetch('/api/post/user', {"method": "POST", credentials: 'include'});
        
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