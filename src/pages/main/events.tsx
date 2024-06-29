import React from 'react';
import '../../assets/scss/events.scss';
import Sidebar from '../../assets/components/sidebar';
import { EventData, UserData } from '../../assets/ts/interfaces';

const EventsPage: React.FC = (): React.JSX.Element => {
    const eventNameRef = React.useRef<HTMLInputElement>(null);
    const eventDateRef = React.useRef<HTMLInputElement>(null);
    const eventTimeRef = React.useRef<HTMLInputElement>(null);
    const eventLocationRef = React.useRef<HTMLInputElement>(null);
    const eventDescriptionRef = React.useRef<HTMLInputElement>(null);

    const [events, setEvents] = React.useState<EventData[]>([]);

    const sendEvents = async () => {
        try {
            const dataJson = {
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": JSON.stringify({
                    "userId": document.cookie.split("=")[1],
                    "eventValues": {
                        "eventName": eventNameRef.current!.value,
                        "eventDate": eventDateRef.current!.value,
                        "eventTime": eventTimeRef.current!.value,
                        "eventLocation": eventLocationRef.current!.value,
                        "eventDescription": eventDescriptionRef.current!.value
                    }
                })
            }

            const response = await fetch('/api/post/events', dataJson);
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

    const getEvents = async () => {
        try {
            const dataJson = {
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": JSON.stringify({
                    "userId": document.cookie.split(";")[1].split("=")[1]
                })
            }

            const response = await fetch('/api/get/events', dataJson);
            const data = await response.json();

            if (data.error) {
                console.error(data.error);
            } else {
                console.log(data.message);
            }

            setEvents(data.message);
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
                            <p id="default">No events found</p>
                            {
                                events.map((event: EventData, index: number) => {
                                    return (
                                        <div className="event" key={index}>
                                            <h3>{event.eventName}</h3>
                                            <p>{event.eventDescription}</p>
                                            <p>{event.eventDate}</p>
                                            <p>{event.eventTime}</p>
                                            <p>{event.eventLocation}</p>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                    <div id="right">
                        <p id="eventCreate">Create Event</p>
                        <form id="eventForm">
                            <input type="text" id="eventName" ref={eventNameRef} placeholder="Event Name" />
                            <input type="date" id="eventDate" ref={eventDateRef} placeholder="Event Date" />
                            <input type="time" id="eventTime" ref={eventTimeRef} placeholder="Event Time" />
                            <input type="search" id="eventLocation" ref={eventLocationRef} placeholder="Event Location" />
                            <input type="text" id="eventDescription" ref={eventDescriptionRef} placeholder="Event Description" />
                            <button type="button" onClick={() => sendEvents()}>Submit</button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default EventsPage;