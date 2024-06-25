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
                    <p>Click on the links above to navigate the website.</p>
                </div>
            </div>
        </section>
    )
}

export default HomePage;