/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import '../../assets/scss/calendar.scss';
import createCalendar from '../ts/calendar.ts';

const FormatCalendar: React.FC = (): React.JSX.Element => {
    const [year, setYear] = React.useState<number>(new Date().getFullYear());
    const [month, setMonth] = React.useState<number>(new Date().getMonth() + 1);
    const [shortenedDate, setShortenedDate] = React.useState<string>('');
    const [daysOfWeek, setDaysOfWeek] = React.useState<string[]>(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    const [days, setDays] = React.useState<number[][] | string[][]>([]);

    React.useEffect(() => {
        formatCalendar(createCalendar(year, month));
    }, [year, month]);

    const formatCalendar = (calendar: string): void => {
        const weeksInCalendar: string[][] | string[] = calendar.split('\n');
        const newWeeksInCalendar: string[][] = [];

        weeksInCalendar.forEach((week: string) => {
            newWeeksInCalendar.push(week.split(' ').filter((day: string) => day !== ''));
        });

        setShortenedDate(`${newWeeksInCalendar[0][0]} ${newWeeksInCalendar[0][1]}`);
        newWeeksInCalendar.shift();

        setDaysOfWeek(newWeeksInCalendar[0]);
        newWeeksInCalendar.shift();

        setDays(newWeeksInCalendar);

        console.log(newWeeksInCalendar);

        setDays(newWeeksInCalendar);
    };

    const changeYear = (): void => {
        
    }
    
    const changeMonth = (): void => {

    }

    return (
        <div id="calendar">
            <button></button>
            <h1>{shortenedDate}</h1>
            <table>
                <thead>
                    <tr>
                        {daysOfWeek.map((day: string, index: number) => (
                            <th key={index}>{day}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {days.map((week: number[] | string[], index: number) => (
                        <tr key={index}>
                            {week.map((day: number | string, index: number) => (
                                <td key={index}>{day}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default FormatCalendar;