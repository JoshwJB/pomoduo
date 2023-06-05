"use client";

import {useRouter} from "next/navigation";
import {useEffect} from "react";
import {generateSlug} from "random-word-slugs";

export function RoomMaker(): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    const slug = generateSlug();
    router.push(`/room/${slug}`);
  });

  return <h1>Joining Room...</h1>;
}
