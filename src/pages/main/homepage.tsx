import React from 'react';
import '../../assets/scss/homepage.scss';
import UserData from '../../assets/ts/interfaces';
import getUserData from '../../assets/ts/getUserData';
import Sidebar from '../../assets/components/sidebar';
import FormatCalendar from '../../assets/components/format-calendar';

const HomePage: React.FC = (): React.JSX.Element => {
    const [data, setData] = React.useState<UserData | null | undefined>();
    const [motd, setMotd] = React.useState<string>('');

    React.useEffect(() => {
        try {
            const userId: string | null = document.cookie.split('=')[1];
            getUserData(userId).then((result: UserData | null | undefined) => {
                console.log(result);
                setData(result);
            });
            setMotd('Welcome to the homepage!');
        } catch (error: unknown) {
            console.error('Error:', error as string);
        }
    }, []);

    return (
        <section id="home">
            <Sidebar />
            <div id="container">
                <h1>Welcome, {data?.username}!</h1>
                <div id="motd">
                        <p>{motd}</p>
                </div>

                <div id="content">
                    <div id="events">
                        <h2>Upcoming Events</h2>
                        <div id="event-list">

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