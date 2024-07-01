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
            const response = await fetch('/api/get/events', { "method": "POST", "credentials": "include" });
            
            if (response.status === 401) {
                alert("You must be logged in to view events");
                return;
            } else if (response.status === 500) {
                alert("Server error");
                return;
            } else if (response.status === 404) {
                alert("No events found");
                return;
            }

            const data = await response.json();

            if (data.error) {
                console.error(data.error);
            }
            
            setEvents(data.events);
        } catch (error: unknown) {
            console.error('Error:', error as string);
        }
    }

    const userData = async () => {
        try {
            const userData: UserData[] | undefined | null = await getUserData();

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
                            {
                                events === null || events === undefined || events.length < 1 ? <p id="default">No events found</p> :
                            events?.map((event, index) => {
                                return (
                                    <div key={index} className="event">
                                        <h3>{event?.eventName}</h3>
                                        <p>{event?.eventDescription}</p>
                                        <p>{event?.eventLocation}</p>
                                        <p>{event?.eventDate}</p>
                                        <p>{event?.eventTime}</p>
                                    </div>
                                )
                            })
                        }
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