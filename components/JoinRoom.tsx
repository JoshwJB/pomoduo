"use client";

import {generateSlug} from "random-word-slugs";
import {useRouter} from "next/navigation";
import {useState} from "react";

const JoinRoom = () => {
  const [roomName, setRoomName] = useState<string>("");
  const router = useRouter();

  const joinRoom = async () => {
    await router.push(`/room/${roomName}`);
  };

  const createRoom = async () => {
    const slug = generateSlug();
    await router.push(`/room/${slug}`);
  };

  return (
    <div>
      <input
        className="placeholder:italic placeholder:text-slate-400 block bg-white w-full border text-black border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
        onBlur={(event) => setRoomName(event.target.value)}
        placeholder={"Room Name"}
      />
      <button onClick={joinRoom}>Join Room</button>
      <button onClick={createRoom}>Create Room</button>
    </div>
  );
};

export default JoinRoom;
