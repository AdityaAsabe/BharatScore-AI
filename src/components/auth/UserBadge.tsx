"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

function getSnapshot() {
  if (typeof window === "undefined") {
    return "";
  }

  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    return "";
  }

  try {
    const user = JSON.parse(storedUser);
    return user?.name || "";
  } catch {
    return "";
  }
}

function getServerSnapshot() {
  return "";
}

export default function UserBadge() {
  const userName = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  if (!userName) {
    return null;
  }

  return (
    <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 shadow-sm sm:flex">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-teal-500 text-xs font-bold text-white">
        {userName.charAt(0).toUpperCase()}
      </div>

      <span className="max-w-[120px] truncate text-xs font-semibold text-slate-700">
        {userName}
      </span>
    </div>
  );
}