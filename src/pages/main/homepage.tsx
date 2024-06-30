/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import '../../assets/scss/homepage.scss';
import { EventData, UserData } from '../../assets/ts/interfaces';
import getUserData from '../../assets/ts/getUserData';
import Sidebar from '../../assets/components/sidebar';
import FormatCalendar from '../../assets/components/format-calendar';

const HomePage: React.FC = (): React.JSX.Element => {
    const [data, setData] = React.useState<UserData | null | undefined>();
    const [events, setEvents] = React.useState<EventData[]>([]);

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
        <section id="home">
            <Sidebar />
            <div id="container">
                <h1>Welcome, {data?.displayName}!</h1>

                <div id="content">
                    <div id="events">
                        <h2>Upcoming Events</h2>
                        <div id="event-list">
                            <p id="default">No events found</p>
                            {/* <div className="event">
                                <h3>Event 1</h3>
                                <p>Event 1 Description</p>
                            </div>
                            <div className="event">
                                <h3>Event 2</h3>
                                <p>Event 2 Description</p>
                            </div>
                            <div className="event">
                                <h3>Event 3</h3>
                                <p>Event 3 Description</p>
                            </div> */}
                        </div>
                    </div>

                    <div id="calendar">
                        <FormatCalendar />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HomePage;