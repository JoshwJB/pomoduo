"use client";

import {useEffect} from "react";
import {generateSlug} from "random-word-slugs";
import {useRouter} from "next/navigation";

export function Room() {
  const router = useRouter();

  useEffect(() => {
    const slug = generateSlug();
    router.push(`/room/${slug}`);
  });

  return <h1>Joining Room...</h1>;
}
