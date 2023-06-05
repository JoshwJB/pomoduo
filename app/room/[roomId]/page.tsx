import {Timer} from "@/components/Timer";
import {supabase} from "@/lib/SupabaseClient";
import {Metadata} from "next";

export async function generateMetadata({params}: Props): Promise<Metadata> {
  return {
    title: `${params.roomId} | PomoDuo`,
  };
}

export const metadata = ({params}: Props) => ({
  title: `${params.roomId} | PomoDuo`,
});

interface Props {
  params: {roomId: string};
}

export default async function TimerRoom({params}: Props): Promise<JSX.Element> {
  const {data} = await supabase.from("pomoduo").select().eq("room", params.roomId);

  return <Timer roomRow={data[0]} />;
}
