"use client";

import {generateSlug} from "random-word-slugs";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {Input} from "@/components/Input";
import {Button} from "@/components/Button";

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
    <div className="flex flex-col items-center">
      <div className="flex gap-2 justify-between mb-8">
        <Input
          onBlur={(event) => setRoomName(event.target.value)}
          placeholder={"Room Name"}
        />

        <Button
          variant="outline"
          onClick={joinRoom}
        >
          Join
        </Button>
      </div>

      <Button
        variant="outline"
        onClick={createRoom}
        size="lg"
      >
        Create New Room
      </Button>
    </div>
  );
};

export default JoinRoom;
