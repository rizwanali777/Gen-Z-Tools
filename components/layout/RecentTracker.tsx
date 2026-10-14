"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

export function RecentTracker({ slug }: { slug: string }) {
  const track = useAppStore((state) => state.track);
  useEffect(() => {
    track(slug);
  }, [slug, track]);
  return null;
}
