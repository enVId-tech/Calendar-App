import React from 'react';
import '../../assets/scss/homepage.scss';
import { UserData } from '../../assets/ts/interfaces';
import getUserData from '../../assets/ts/getUserData';
import Sidebar from '../../assets/components/sidebar';
import FormatCalendar from '../../assets/components/format-calendar';

const HomePage: React.FC = (): React.JSX.Element => {
    const [data, setData] = React.useState<UserData | null | undefined>({});
    const [motd, setMotd] = React.useState<string>('');

    React.useEffect(() => {
        try {
            const userId: string | null = document.cookie.split(';')[1].split('=')[1];
            getUserData(userId).then((result: UserData | null | undefined) => {
                setData(result[0]);
            });
            console.log(data);
            setMotd('Welcome to the homepage!');
        } catch (error: unknown) {
            console.error('Error:', error as string);
        }
    }, []);

    return (
        <section id="home">
            <Sidebar />
            <div id="container">
                <h1>Welcome, {data?.firstName}!</h1>

                <div id="content">
                    <div id="events">
                        <h2>Upcoming Events</h2>
                        <div id="event-list">
                            <div className="event">
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
                            </div>
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