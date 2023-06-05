"use client";

import {useEffect, useState} from "react";
import {useInterval} from "@/components/hooks/UseInterval";
import {addMinutes, add} from "date-fns";
import {supabase} from "@/lib/SupabaseClient";
import {useParams} from "next/navigation";
import {Button} from "@/components/Button";

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

  const start = async (minutes: number) => {
    setPaused(false);
    const newEndTime = addMinutes(new Date(), minutes);
    setTimerEndDate(newEndTime);
    await supabase.from("pomoduo").upsert({
      room: params.roomId,
      timer_end_time: newEndTime.toISOString(),
      paused: false,
    });
  };

  const resume = async () => {
    setPaused(false);
    const newEndTime = add(new Date(), timerState);
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
    <div className="flex flex-col items-center">
      <h2 className="text-4xl mb-8 font-bold">{formatTimeRemaining()}</h2>

      {!paused && timerEndDate && (
        <Button
          variant="outline"
          onClick={resume}
          size="lg"
        >
          Resume
        </Button>
      )}

      {paused && timerEndDate && (
        <Button
          variant="outline"
          onClick={pause}
          size="lg"
        >
          Pause
        </Button>
      )}

      <div>
        <h5>Choose a duration:</h5>
        <div>
          {[5, 10, 15, 20, 25, 30].map((minutes) => (
            <Button
              key={minutes}
              onClick={() => start(minutes)}
            >
              {minutes}m
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
