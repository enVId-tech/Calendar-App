import React from 'react';
import '../scss/calendar.scss';

const CreateCalendar: React.FC = ({ month, year }): CreateCa => {
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

export default CreateCalendar;