import React from 'react';
import '../../assets/scss/homepage.scss';
import UserData from '../../assets/ts/interfaces';
import getUserData from '../../assets/ts/getUserData';
import Sidebar from '../../assets/components/sidebar';

const HomePage: React.FC = (): React.JSX.Element => {
    const [data, setData] = React.useState<UserData | null | undefined>();

    React.useEffect(() => {
        try {
            const userId: string | null = document.cookie.split('=')[1];
            getUserData(userId).then((result: UserData | null | undefined) => {
                setData(result);
            });
        } catch (error: unknown) {
            console.error('Error:', error as string);
        }
    }, []);

    return (
        <section id="home">
            <Sidebar />
            <div id="container">
                <div id="content">
                    <h1>Welcome, {data?.username}!</h1>
                    <div id="motd">
                        <h2></h2>
                        <p>{data?.motd}</p>
                    </div>
                    <div id="events">
                        <h2>Upcoming Events</h2>
                        <div id="event-list">

                        </div>
                    </div>
                    <div id="mini-calendar">
                        <h2>Calendar</h2>
                        <div id="calendar">

                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HomePage;