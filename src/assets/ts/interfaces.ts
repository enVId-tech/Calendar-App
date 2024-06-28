interface CreateCalendarProps {
    year: number;
    month: number;
}

interface UserData {
    displayName: string;
    email: string;
    firstName: string;
    hd: string | null;
    lastName: string | null;
    profilePicture: string;
}

export type { CreateCalendarProps, UserData }