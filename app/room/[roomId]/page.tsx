import {Timer} from "@/components/Timer";
import {supabase} from "@/lib/SupabaseClient";

interface Props {
  params: {roomId: string};
}

export default async function TimerRoom({params}: Props): Promise<JSX.Element> {
  const {data} = await supabase.from("pomoduo").select().eq("room", params.roomId);

  return <Timer roomRow={data[0]} />;
}
