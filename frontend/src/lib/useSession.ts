"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, getToken } from "@/requests";
import type { AuthUser } from "@/lib/types";

export function useSession(options?: { requireAdmin?: boolean }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const currentToken = getToken();
    const currentUser = getStoredUser();

    if (!currentToken || !currentUser) {
      router.replace("/login");
      return;
    }

    if (options?.requireAdmin && currentUser.role !== "ADMIN") {
      router.replace("/dashboard");
      return;
    }

    setUser(currentUser);
    setToken(currentToken);
    setReady(true);
  }, [options?.requireAdmin, router]);

  return useMemo(
    () => ({ ready, user, token }),
    [ready, token, user],
  );
}
