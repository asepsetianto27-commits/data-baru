"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogoutIcon } from "@/components/ui/icons";

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }
  return (
    <Button variant="outline" size="sm" onClick={logout}>
      <LogoutIcon size={14} />
      Logout
    </Button>
  );
}
