// Workshop extension: replace this disabled slot with an accessible picker.
export function EmojiPicker() {
  return (
    <button
      type="button"
      className="emoji-button"
      aria-label="Emoji picker (workshop extension)"
      title="Add an emoji picker during the workshop"
      disabled
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8 14a4.4 4.4 0 0 0 8 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="9" cy="9" r="1" fill="currentColor" />
        <circle cx="15" cy="9" r="1" fill="currentColor" />
      </svg>
    </button>
  );
}
