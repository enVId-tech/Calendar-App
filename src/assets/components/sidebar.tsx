import React from "react";
import '../scss/sidebar.scss';
import getUserData from '../ts/getUserData';
import { UserData } from "../ts/interfaces";

const Sidebar: React.FC = (): React.JSX.Element => {
    const [data, setData] = React.useState<UserData | null | undefined>();

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const userId: string | null = document.cookie.split(';')[1].split('=')[1];

                const userData = await getUserData(userId);
                setData(userData);
            } catch (error: unknown) {
                console.error('Error:', error as string);
            }
        }

        fetchData();
    }, []);

    const account = (): void => {
        window.location.href = '/account';
    }

    return (
        <div id="sidebar">
            <div id="profile">
                <img src="https://via.placeholder.com/150" alt="Profile" />
                <h2>Logged in as <br/> {data?.firstName}</h2>
                <button onClick={() => account()}>Account</button>
            </div>
            <div id="pages">
                <span className="pageSelector">
                    <a href="/">
                        <h1>Home</h1>
                    </a>
                </span>

                <span className="pageSelector">
                    <a href="/calendar">
                        <h1>Calendar</h1>
                    </a>
                </span>

                <span className="pageSelector">
                    <a href="/events">
                        <h1>Events</h1>
                    </a>
                </span>

                <span className="pageSelector">
                    <a href='/logout'>
                        <h1>Logout</h1>
                    </a>
                </span>
            </div>
        </div>
    )
}

export default Sidebar;