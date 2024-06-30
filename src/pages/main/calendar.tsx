import React from 'react';
import '../../assets/scss/calendar.scss';
import Sidebar from '../../assets/components/sidebar.tsx';
import FormatCalendar from '../../assets/components/format-calendar.tsx';
import { EventData, UserData } from '../../assets/ts/interfaces.ts';
import getUserData from '../../assets/ts/getUserData.ts';

const CalendarPage: React.FC = () => {
    const [year, setYear] = React.useState<number>(new Date().getFullYear());
    const [month, setMonth] = React.useState<number>(new Date().getMonth() + 1);
    const [days, setDays] = React.useState<number[]>([1, 2, 3, 4, 5, 6, 7]);

    const [data, setData] = React.useState<UserData>();
    const [events, setEvents] = React.useState<EventData>();

    const getEvents = async () => {
        try {
            if (document.cookie.split(";")[1].split("=")[1] === "") {
                window.location.href = '/login';
                return;
            } else if (document.cookie.split(";")[1].split("=")[1] === "guest") {
                return;
            }
            const dataJson = {
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": JSON.stringify({
                    "userId": document.cookie.split("=")[1]
                })
            }

            const response = await fetch('/api/post/events', dataJson);
            const data = await response.json();

            if (data.error) {
                console.error(data.error);
            } else {
                console.log(data.message);
            }

            setEvents(data);

        } catch (error: unknown) {
            console.error('Error:', error as string);
        }
    }

    const userData = async () => {
        try {
            const userId: string | null = document.cookie.split(';')[1].split('=')[1];
            
            const userData: UserData[] | undefined | null = await getUserData(userId);

            if (!userData) {
                window.location.href = '/login';
                return;
            }

            setData(userData[0]);

            getEvents();
        } catch (error: unknown) {
            console.error('Error:', error as string);
        }
    }

    React.useEffect(() => {
        try {
            userData();
        } catch (error: unknown) {
            console.error('Error:', error as string);
        }
    }, []);

    return (
        <section id="calendar">
            <Sidebar />
            <div id="container">
                <FormatCalendar />
            </div>
        </section>
    )
}

export default CalendarPage;