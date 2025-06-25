export function cleanBarcode(raw) {
  if (!raw) return null

  const cleaned = raw
    .replace(/Shift|Control|Alt|Meta|Tab|Enter|Backspace|CapsLock|Escape|Arrow\w*/g, '') // Remove modifier keys
    .replace(/[^a-zA-Z0-9\-]/g, '') // Keep only valid characters
    .trim()

  // Ignore if it's too short or obviously junk
  if (cleaned.length < 3) {
    return null
  }

  return cleaned
}
