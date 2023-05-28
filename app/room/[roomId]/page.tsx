import {Timer} from "@/components/Timer";

export default function TimerRoom() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <h1 className="text-6xl font-bold">PomoDuo</h1>

            <Timer timerEndDate={undefined} />
        </main>
    );
}
