"use server";

import {supabase} from "@/lib/SupabaseClient";
import {addMinutes} from "date-fns";
import {revalidatePath} from "next/cache";

const revalidate = async () => revalidatePath("/room/[roomId]");

export async function pause(roomId: string) {
  await supabase.from("pomoduo").update({timer_paused_time: new Date().toISOString()}).eq("room", roomId);
  await revalidate();
}

export async function reset(roomId: string) {
  await supabase.from("pomoduo").upsert({
    room: roomId,
    timer_end_time: null,
    timer_paused_time: null,
  });
  await revalidate();
}

export async function resume(roomId: string, newEndTime: Date) {
  await supabase.from("pomoduo").upsert({
    room: roomId,
    timer_end_time: newEndTime.toISOString(),
    timer_paused_time: null,
  });
  await revalidate();
}

export async function start(roomId: string, minutes: number) {
  const newEndTime = addMinutes(new Date(), minutes);
  await supabase.from("pomoduo").upsert({
    room: roomId,
    timer_end_time: newEndTime.toISOString(),
    timer_paused_time: null,
  });
  await revalidate();
}
