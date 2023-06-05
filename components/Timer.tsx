"use client";

import {useEffect, useState} from "react";
import {useInterval} from "@/components/hooks/UseInterval";
import {addMinutes, add} from "date-fns";
import {supabase} from "@/lib/SupabaseClient";
import {useParams} from "next/navigation";

type TimerState = {
  hours: number;
  minutes: number;
  seconds: number;
};

interface Props {
  roomRow: any;
}

export const Timer = ({roomRow}: Props) => {
  const params = useParams();
  const channel = supabase.channel(params.roomId);
  const [paused, setPaused] = useState(roomRow?.paused ?? false);
  const [timerEndDate, setTimerEndDate] = useState<Date | undefined>(roomRow?.timer_end_time);
  const [timerState, setTimerState] = useState<TimerState>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    channel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pomoduo",
          filter: `room=eq.${params.roomId}`,
        },
        (payload: any) => {
          console.log(payload);
          setTimerEndDate(new Date(payload.new.timer_end_time));
          setPaused(payload.new.paused);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channel, params]);

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

  const start = async () => {
    setPaused(false);
    const newEndTime = timerEndDate === undefined ? addMinutes(new Date(), 25) : add(new Date(), timerState);
    setTimerEndDate(newEndTime);
    await supabase.from("pomoduo").upsert({
      room: params.roomId,
      timer_end_time: newEndTime.toISOString(),
      paused: false,
    });
  };

  const pause = async () => {
    setPaused(true);
    await supabase.from("pomoduo").update({paused: true}).eq("room", params.roomId);
  };

  return (
    <div>
      <h2 className="text-4xl py-6">{formatTimeRemaining()}</h2>

      <button onClick={start}>Start</button>
      <button onClick={pause}>Pause</button>
    </div>
  );
};
