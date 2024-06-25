import React from 'react';

const CreateCalendar: React.FC = ({year, month}): React.JSX.Element => {
    const weeks = Array.from({ length: 6 }, (_, i) => i + 1);
    const days = Array.from({ length: 7 }, (_, i) => i + 1);

    const getDaysInMonth = (month: number, year: number): number => {
        return new Date(year, month, 0).getDate();
    }

    const getFirstDayOfMonth = (month: number, year: number): number => {
        return new Date(year, month, 1).getDay();
    }

    const getLastDayOfMonth = (month: number, year: number): number => {
        return new Date(year, month, getDaysInMonth(month, year)).getDay();
    }

    const getWeeksInMonth = (month: number, year: number): number => {
        return Math.ceil((getDaysInMonth(month, year) + getFirstDayOfMonth(month, year)) / 7);
    }

    const getDay = (day: number, month: number, year: number): string => {
        return new Date(year, month, day).toLocaleString('en-US', { weekday: 'long' });
    }

    return (
        <section id="calendar">
            <div id="header">
                <h1>{year}</h1>
                <h2>{month}</h2>
            </div>
            <div id="days">
                {days.map((day: number) => (
                    <div key={day} className="day">
                        <h3>{getDay(day, month, year)}</h3>
                        <p>{day}</p>
                    </div>
                ))}
            </div>
            <div id="weeks">
                {weeks.map((week: number) => (
                    <div key={week} className="week">
                        {days.map((day: number) => (
                            <div key={day} className="day">
                                <p>{day}</p>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </section>
    )
}

export default CreateCalendar;