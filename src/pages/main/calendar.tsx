import React from 'react';
import '../../assets/scss/calendar.scss';

const CalendarPage: React.FC = () => {
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