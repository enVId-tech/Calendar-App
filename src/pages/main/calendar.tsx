import React from 'react';
import '../../assets/scss/calendar.scss';
import Sidebar from '../../assets/components/sidebar.tsx';
import FormatCalendar from '../../assets/components/format-calendar.tsx';

const CalendarPage: React.FC = () => {
    const [year, setYear] = React.useState<number>(new Date().getFullYear());
    const [month, setMonth] = React.useState<number>(new Date().getMonth() + 1);
    const [days, setDays] = React.useState<number[]>([1, 2, 3, 4, 5, 6, 7]);

    return (
        <section id="calendar">
            <Sidebar />
            <div id="container">
                <FormatCalendar />
            </div>
        </section>
    )
}

export default CalendarPage;