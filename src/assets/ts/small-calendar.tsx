import React from "react";

const SmallCalendar: React.FC = (): React.JSX.Element => {
    const [year, setYear] = React.useState<number>(new Date().getFullYear());
    const [month, setMonth] = React.useState<number>(new Date().getMonth() + 1);
    const [days, setDays] = React.useState<number[]>();

    const setAmountOfDays = (year: number, month: number): number => {
        return new Date(year, month, 0).getDate();
    }

    // const getEvents = async (year: number, month: number): Promise<void> => {
    //     const jsonData = {
    //         "method": "POST",
    //         "headers": {
    //             "Content-Type": "application/json"
    //         },
    //         "body": JSON.stringify({
    //             "year": year,
    //             "month": month
    //         })
    //     }

        // const response: Response = await fetch('/api/calendar/events', jsonData);
        // const data: number[] = await response.json();

        // setDays(data);
    // }

    // React.useEffect(() => {
    //     getEvents(year, month);
    // }, [year, month]);

    React.useEffect(() => {
        setDays(Array.from({ length: setAmountOfDays(year, month) }, (_, i) => i + 1));
    }, [year, month]);

    return (
        <section id="calendar">
            <div id="header">
                <h1>{new Date(year, month - 1).toLocaleString('en-US', { month: 'long' })} {year}</h1>
            </div>
            <div id="days">
                {days?.map((day: number) => (
                    <div key={day} className="day">
                        <h3>{day}</h3>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default SmallCalendar;