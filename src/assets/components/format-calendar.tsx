import React from 'react';
import '../../assets/scss/calendar.scss';
import createCalendar from '../ts/calendar.ts';

const FormatCalendar: React.FC = (): React.JSX.Element => {
    const [year, setYear] = React.useState<number>(new Date().getFullYear());
    const [month, setMonth] = React.useState<number>(new Date().getMonth() + 1);
    const [days, setDays] = React.useState<number[]>([1, 2, 3, 4, 5, 6, 7]);
    const [calendar, setCalendar] = React.useState<string>('');

    React.useEffect(() => {
        // createCalendar(year, month).then((result: number[]) => {
        //     setDays(result);
        // });
        formatCalendar(createCalendar(year, month));
    }, [year, month]);

    const formatCalendar = (calendar: string): string => {
        console.log(calendar.split('\n'));
    };

    return (
        <div id="calendar">

        </div>
    )
}

export default FormatCalendar;