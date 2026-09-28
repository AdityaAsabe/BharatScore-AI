"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { BharatScoreApp } from "@/components/bharat/app-shell";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  return <BharatScoreApp />;
}