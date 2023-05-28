import JoinRoom from "@/components/JoinRoom";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <h1 className="text-6xl font-bold">PomoDuo</h1>
            <JoinRoom/>
        </main>
    );
}
