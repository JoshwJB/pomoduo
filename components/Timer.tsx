"use client";

import {useEffect, useState} from "react";
import {useInterval} from "@/components/hooks/UseInterval";
import {addMinutes, add} from "date-fns";
import {supabase} from "@/lib/SupabaseClient";
import {useParams} from "next/navigation";
import {Button} from "@/components/Button";
import useSound from "use-sound";

type TimerState = {
  hours: number;
  minutes: number;
  seconds: number;
};

interface Props {
  roomRow: any;
}

export const Timer = ({roomRow}: Props) => {
  const [playSound] = useSound("/success-fanfare-trumpets.mp3", {volume: 1});
  const params = useParams();
  const channel = supabase.channel(params.roomId);
  const [paused, setPaused] = useState(roomRow?.paused ?? false);
  const [timerEndDate, setTimerEndDate] = useState<Date | undefined>(
    roomRow?.timer_end_time ? new Date(roomRow.timer_end_time) : undefined,
  );
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
    if (difference < 0) {
      setTimerEndDate(undefined);
      playSound();
      return;
    }

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
    const newEndTime = addMinutes(new Date(), minutes);
    await supabase.from("pomoduo").upsert({
      room: params.roomId,
      timer_end_time: newEndTime.toISOString(),
      paused: false,
    });
  };

  const resume = async () => {
    const newEndTime = add(new Date(), timerState);
    await supabase.from("pomoduo").upsert({
      room: params.roomId,
      timer_end_time: newEndTime.toISOString(),
      paused: false,
    });
  };

  const reset = async () => {
    await supabase.from("pomoduo").upsert({
      room: params.roomId,
      timer_end_time: null,
      paused: false,
    });
  };

  const pause = async () => {
    await supabase.from("pomoduo").update({paused: true}).eq("room", params.roomId);
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-4xl mb-8 font-bold">{formatTimeRemaining()}</h2>

      <div className="flex justify-between gap-2">
        {paused && timerEndDate && (
          <Button
            variant="outline"
            onClick={resume}
            size="lg"
          >
            Resume
          </Button>
        )}

        {!paused && timerEndDate && (
          <Button
            variant="outline"
            onClick={pause}
            size="lg"
          >
            Pause
          </Button>
        )}

        {timerEndDate && (
          <Button
            variant="outline"
            onClick={reset}
            size="lg"
          >
            Reset
          </Button>
        )}
      </div>

      {!timerEndDate && (
        <div>
          <h5>Choose a duration:</h5>
          <div className="flex gap-2">
            {[5, 10, 15, 20, 25, 30].map((minutes) => (
              <Button
                variant="outline"
                className="w-16"
                key={minutes}
                onClick={() => start(minutes)}
              >
                {minutes}m
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
