import React from 'react';
import '../../assets/scss/calendar.scss';

const CalendarPage: React.FC = () => {
    const [year, setYear] = React.useState<number>(new Date().getFullYear());
    const [month, setMonth] = React.useState<number>(new Date().getMonth() + 1);
    const [days, setDays] = React.useState<number[]>([1, 2, 3, 4, 5, 6, 7]);

    const getEvents = async (year: number, month: number): Promise<void> => {
        const jsonData = {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json"
            },
            "body": JSON.stringify({
                "year": year,
                "month": month
            })
        }

        const response: Response = await fetch('/api/calendar/events', jsonData);
        const data: number[] = await response.json();

        setDays(data);
    }

    React.useEffect(() => {
        getEvents(year, month);
    }, [year, month]);

    return (
        <section id="calendar">
            <div id="header">
                <h1>{new Date(year, month - 1).toLocaleString('en-US', { month: 'long' })} {year}</h1>
            </div>
            <div id="days">
                {days.map((day: number) => (
                    <div key={day} className="day">
                        <h3>{getDay(day, month, year)}</h3>
                    </div>

                ))}
            </div>
            <div id="weeks">
                {weeks.map((week: number) => (
                    <div key={week} className="week">
                        {days.map((day: number) => (
                            <div key={day} className="day">
                                <p>{(7 * week) + day - 7}</p>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </section>
    )
}

export default CalendarPage;