"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/patient/dashboard/emergency"); // redirect to default section
  }, [router]);

  return null;
}
