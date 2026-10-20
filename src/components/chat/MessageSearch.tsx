// Workshop extension: enable this input and filter a derived message list.
export function MessageSearch() {
  return (
    <div className="message-search" title="Add message search during the workshop">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="10.5" cy="10.5" r="6.25" stroke="currentColor" strokeWidth="1.7" />
        <path d="m15 15 4.5 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
      <label className="sr-only" htmlFor="message-search">Search messages (workshop extension)</label>
      <input id="message-search" type="search" placeholder="Search · coming in the lab" disabled />
    </div>
  );
}
