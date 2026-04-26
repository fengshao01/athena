"use client";

import { useSyncExternalStore } from "react";

function greetingFor(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const subscribe = () => () => {};
const getSnapshot = () => greetingFor(new Date());
const getServerSnapshot = (): string | null => null;

export default function Greeting() {
  const greeting = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
      {greeting ?? " "}
    </h1>
  );
}
