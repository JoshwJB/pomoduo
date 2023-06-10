"use server";

import {supabase} from "@/lib/SupabaseClient";
import {addMinutes} from "date-fns";

const revalidate = async (roomId: string) => {
  if (!process.env.URL || !process.env.REVALIDATE_SECRET) throw Error("Missing env variable/s");
  const requestHeaders: HeadersInit = new Headers();
  requestHeaders.set("x-vercel-reval-key", process.env.REVALIDATE_SECRET);
  await fetch(`${process.env.URL}/api/revalidate`, {
    method: "POST",
    body: roomId,
    headers: requestHeaders,
  });
};

export async function pause(roomId: string) {
  await supabase.from("pomoduo").update({timer_paused_time: new Date().toISOString()}).eq("room", roomId);
  await revalidate(roomId);
}

export async function reset(roomId: string) {
  await supabase.from("pomoduo").upsert({
    room: roomId,
    timer_end_time: null,
    timer_paused_time: null,
  });
  await revalidate(roomId);
}

export async function resume(roomId: string, newEndTime: Date) {
  await supabase.from("pomoduo").upsert({
    room: roomId,
    timer_end_time: newEndTime.toISOString(),
    timer_paused_time: null,
  });
  await revalidate(roomId);
}

export async function start(roomId: string, minutes: number) {
  const newEndTime = addMinutes(new Date(), minutes);
  await supabase.from("pomoduo").upsert({
    room: roomId,
    timer_end_time: newEndTime.toISOString(),
    timer_paused_time: null,
  });
  await revalidate(roomId);
}
