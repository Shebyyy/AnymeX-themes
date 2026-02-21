"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreatorRegisterRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/auth?tab=register");
  }, [router]);

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <p className="text-neutral-400">Redirecting...</p>
    </div>
  );
}
