"use client";

import { useState, type FormEvent } from "react";
import { MAX_DISPLAY_NAME_LENGTH } from "@/config/chat";
import { isValidDisplayName } from "@/lib/message";

interface ParticipantSetupProps {
  onJoin: (displayName: string) => boolean;
}

export function ParticipantSetup({ onJoin }: ParticipantSetupProps) {
  const [displayName, setDisplayName] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onJoin(displayName);
  }

  return (
    <form className="participant-setup" onSubmit={submit} aria-label="Join the workshop">
      <div className="join-heading"><h2>Say hello to the team.</h2><p>Choose the name everyone in this room will see.</p></div>
      <div className="join-fields">
        <label className="sr-only" htmlFor="display-name">Your display name</label>
        <input id="display-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Your name, e.g. Alex" maxLength={MAX_DISPLAY_NAME_LENGTH} autoComplete="nickname" />
        <button className="send-button" type="submit" disabled={!isValidDisplayName(displayName)}>Join conversation</button>
      </div>
      <p className="join-caption">Display names identify participants without accounts. Your name stays in this browser tab.</p>
    </form>
  );
}
