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

    const getEvents = () => {
        try {
            const dataJson = {
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": JSON.stringify({
                    "userId": document.cookie.split("=")[1]
                })
            }

            fetch('/api/get/events', dataJson)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        console.error(data.error);
                    } else {
                        console.log(data.message);
                    }
                }
            );
        } catch (error: unknown) {
            console.error('Error:', error as string);
        }
    }

    React.useEffect(() => {
        getEvents();
    }, []);

    return (
        <section id="events">
            <Sidebar />
            <div id="container">
                <div id="content">
                    <h1>Events</h1>
                </div>
                <div id="eventsLists">
                    <div id="left">
                        <p id="eventList">Event List</p>
                        <div id="eventListContent">
                            <div className="event">
                                <h1>Event Name</h1>
                                <p>Event Date</p>
                                <p>Event Time</p>
                                <p>Event Location</p>
                                <p>Event Description</p>
                            </div>
                        </div>
                    </div>
                    <div id="right">
                        <p id="eventCreate">Create Event</p>
                        <form id="eventForm">
                            <input type="text" id="eventName" placeholder="Event Name" />
                            <input type="text" id="eventDate" placeholder="Event Date" />
                            <input type="text" id="eventTime" placeholder="Event Time" />
                            <input type="text" id="eventLocation" placeholder="Event Location" />
                            <input type="text" id="eventDescription" placeholder="Event Description" />
                            <button type="button" onClick={() => sendEvents()}>Submit</button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default EventsPage;