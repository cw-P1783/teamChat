"use client";

import { useEffect, useState } from "react";
import { IDENTITY_STORAGE_KEY } from "@/config/chat";
import { isValidClientId, isValidDisplayName, normalizeDisplayName } from "@/lib/message";
import type { ChatIdentity } from "@/types/chat";

export function useIdentity() {
  const [session, setSession] = useState<{ identity: ChatIdentity | null; isReady: boolean }>({ identity: null, isReady: false });

  useEffect(() => {
    let active = true;
    // Restore after hydration so server and browser render the same first frame.
    void Promise.resolve().then(() => {
      let identity: ChatIdentity | null = null;
      try {
        const value = sessionStorage.getItem(IDENTITY_STORAGE_KEY);
        const stored = value ? JSON.parse(value) : null;
        if (stored && typeof stored.clientId === "string" && typeof stored.displayName === "string" && isValidClientId(stored.clientId) && isValidDisplayName(stored.displayName)) {
          identity = { clientId: stored.clientId, displayName: normalizeDisplayName(stored.displayName) };
        }
      } catch {
        // A new name can still be used when browser storage is unavailable.
      }
      if (active) setSession({ identity, isReady: true });
    });
    return () => { active = false; };
  }, []);

  function join(displayName: string): boolean {
    if (!isValidDisplayName(displayName)) return false;
    const identity = {
      clientId: session.identity?.clientId ?? crypto.randomUUID(),
      displayName: normalizeDisplayName(displayName),
    };
    try { sessionStorage.setItem(IDENTITY_STORAGE_KEY, JSON.stringify(identity)); } catch { /* The current tab can still join. */ }
    setSession({ identity, isReady: true });
    return true;
  }

  return { ...session, join };
}
