"use client";

import {useEffect, useState} from "react";
import {useInterval} from "@/components/hooks/UseInterval";
import {addSeconds, differenceInSeconds} from "date-fns";
import {supabase} from "@/lib/SupabaseClient";
import {useParams} from "next/navigation";
import {Button} from "@/components/Button";
import useSound from "use-sound";
import {pause, reset, resume, start} from "@/lib/TimerActions";

interface Props {
  roomRow: any;
  roomId: string;
}

export const Timer = ({roomRow, roomId}: Props) => {
  const [playSound] = useSound("/success-fanfare-trumpets.mp3", {volume: 1});
  const params = useParams();

  const channel = supabase.channel(roomId);
  const [timerPausedDate, setTimerPausedTime] = useState(
    roomRow?.timer_paused_time ? new Date(roomRow.timer_paused_time) : undefined,
  );
  const [timerEndDate, setTimerEndDate] = useState<Date | undefined>(
    roomRow?.timer_end_time ? new Date(roomRow.timer_end_time) : undefined,
  );
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  useEffect(() => {
    if (timerEndDate && timerPausedDate) {
      const seconds = differenceInSeconds(
        addSeconds(new Date(), differenceInSeconds(timerEndDate, timerPausedDate)),
        new Date(),
      );
      setSecondsRemaining(seconds);
    }

    channel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pomoduo",
          filter: `room=eq.${roomId}`,
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
    if (timerEndDate === undefined) return setSecondsRemaining(0);
    const secondsLeft = differenceInSeconds(timerEndDate, new Date());
    if (secondsLeft < 0) {
      setTimerEndDate(undefined);
      playSound();
      return;
    }
    setSecondsRemaining(secondsLeft);
  }, 100);

  const formatTimeRemaining = (): string => {
    let string = "";
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;

    if (minutes >= 0) string += `${Math.floor(secondsRemaining / 60)}m `;
    if (seconds >= 0) string += `${seconds}s`;
    return string;
  };

  const resumeTimer = async () => {
    if (!timerEndDate || !timerPausedDate) return;
    const newEndTime = addSeconds(new Date(), differenceInSeconds(timerEndDate, timerPausedDate));
    await resume(roomId, newEndTime);
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
            onClick={() => pause(roomId)}
            size="lg"
          >
            Pause
          </Button>
        )}

        {timerEndDate && (
          <Button
            variant="outline"
            onClick={() => reset(roomId)}
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
                onClick={() => start(roomId, minutes)}
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
