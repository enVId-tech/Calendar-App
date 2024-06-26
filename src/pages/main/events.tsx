import React from 'react';
import '../../assets/scss/events.scss';
import Sidebar from '../../assets/components/sidebar';

const EventsPage: React.FC = (): React.JSX.Element => {
    const sendEvents = async () => {
        try {
            const dataJson = {
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": JSON.stringify({
                    "userId": document.cookie.split("=")[1],
                    "events": []
                })
            }

            const response = await fetch('/api/get/events', dataJson);
            const data = await response.json();

            if (data.error) {
                console.error(data.error);
            } else {
                console.log(data.message);
            }
        } catch (error: unknown) {
            console.error('Error:', error as string);
        }
    }

    return (
        <section id="events">
            <Sidebar />
            <div id="container">
                <div id="content">
                    <h1>Events</h1>
                </div>
                <div id="events">
                    <div id="left">

                    </div>
                    <div id="right">

                    </div>
                </div>
            </div>
        </section>
    )
}

export default EventsPage;