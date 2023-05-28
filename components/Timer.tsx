'use client';

import {FC, useState} from 'react';
import {useInterval} from "@/components/hooks/UseInterval";
import {addMinutes, add} from 'date-fns'

type TimerState = {
    hours: number;
    minutes: number;
    seconds: number;
}

export const Timer: FC = () => {
    const [paused, setPaused] = useState(false);
    const [timerEndDate, setTimerEndDate] = useState<Date | undefined>(undefined);
    const [timerState, setTimerState] = useState<TimerState>({hours: 0, minutes: 0, seconds: 0});

    // update every second
    useInterval(() => {
        if (paused) return;
        if (timerEndDate === undefined) return setTimerState({hours: 0, minutes: 0, seconds: 0});
        const now = new Date();
        const difference = timerEndDate.getTime() - now.getTime();
        if (difference < 0) return setTimerEndDate(undefined);

        const hours = Math.floor(difference / 1000 / 60 / 60);
        const minutes = Math.floor(difference / 1000 / 60) % 60;
        const seconds = Math.floor(difference / 1000) % 60;
        setTimerState({hours, minutes, seconds});
    }, 1000);

    const formatTimeRemaining = (): string => {
        const {hours, minutes, seconds} = timerState;
        let string = "";

        if (hours > 0) string += `${hours}h `;
        if (minutes >= 0) string += `${minutes}m `;
        if (seconds >= 0) string += `${seconds}s`;
        return string;
    };

    const start = () => {
        setPaused(false);
        if (timerEndDate === undefined) return setTimerEndDate(addMinutes(new Date(), 25));
        setTimerEndDate(add(new Date(), timerState));
    }

    const pause = () => {
        setPaused(true);
    }

    return (
        <div>
            <h2 className="text-4xl py-6">{formatTimeRemaining()}</h2>

            <button onClick={start}>Start</button>
            <button onClick={pause}>Pause</button>
        </div>
    );
}