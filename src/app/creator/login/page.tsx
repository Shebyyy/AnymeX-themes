"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreatorLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/auth?tab=signin");
  }, [router]);

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <p className="text-neutral-400">Redirecting...</p>
    </div>
  );
}
