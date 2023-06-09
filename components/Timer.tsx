"use client";

import {useEffect, useState} from "react";
import {useInterval} from "@/components/hooks/UseInterval";
import {addSeconds, differenceInSeconds} from "date-fns";
import {supabase} from "@/lib/SupabaseClient";
import {useParams} from "next/navigation";
import {Button} from "@/components/Button";
import useSound from "use-sound";
import {pause, reset, resume, start} from "@/lib/TimerActions";

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
  const [timerPausedDate, setTimerPausedTime] = useState(
    roomRow?.timer_paused_time ? new Date(roomRow.timer_paused_time) : undefined,
  );
  const [timerEndDate, setTimerEndDate] = useState<Date | undefined>(
    roomRow?.timer_end_time ? new Date(roomRow.timer_end_time) : undefined,
  );
  const [timerState, setTimerState] = useState<TimerState>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (timerEndDate && timerPausedDate) {
      const now = new Date();
      const difference =
        addSeconds(new Date(), differenceInSeconds(timerEndDate, timerPausedDate)).getTime() - now.getTime();

      const hours = Math.floor(difference / 1000 / 60 / 60);
      const minutes = Math.floor(difference / 1000 / 60) % 60;
      const seconds = Math.floor(difference / 1000) % 60;
      setTimerState({hours, minutes, seconds});
    }
  }, []);

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
          console.log("subscription", payload.new);
          setTimerEndDate(payload.new.timer_end_time ? new Date(payload.new.timer_end_time) : undefined);
          setTimerPausedTime(payload.new.timer_paused_time ? new Date(payload.new.timer_paused_time) : undefined);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // update every second
  useInterval(() => {
    if (timerPausedDate) return;
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
  }, 100);

  const formatTimeRemaining = (): string => {
    const {hours, minutes, seconds} = timerState;
    let string = "";

    if (hours > 0) string += `${hours}h `;
    if (minutes >= 0) string += `${minutes}m `;
    if (seconds >= 0) string += `${seconds}s`;
    return string;
  };

  const resumeTimer = async () => {
    if (!timerEndDate || !timerPausedDate) return;
    const newEndTime = addSeconds(new Date(), differenceInSeconds(timerEndDate, timerPausedDate));
    await resume(params.roomId, newEndTime);
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-4xl mb-8 font-bold">{formatTimeRemaining()}</h2>

      <div className="flex justify-between gap-2">
        {timerPausedDate && timerEndDate && (
          <Button
            variant="outline"
            onClick={resumeTimer}
            size="lg"
          >
            Resume
          </Button>
        )}

        {!timerPausedDate && timerEndDate && (
          <Button
            variant="outline"
            onClick={() => pause(params.roomId)}
            size="lg"
          >
            Pause
          </Button>
        )}

        {timerEndDate && (
          <Button
            variant="outline"
            onClick={() => reset(params.roomId)}
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
                onClick={() => start(params.roomId, minutes)}
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
