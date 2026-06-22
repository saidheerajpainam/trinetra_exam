/**
 * Anti-Cheat Utility
 * Features:
 * - Tab switch detection
 * - Right click disable
 * - Copy/Cut/Paste disable
 * - Auto-submit after max warnings
 */

export function enableAntiCheat(
  onViolation: () => void,
  maxWarnings: number = 3
) {
  let warnings = 0;

  /* ================= TAB SWITCH ================= */
  const handleVisibilityChange = () => {
    if (document.hidden) {
      warnings++;

      alert(`⚠️ Warning ${warnings}/${maxWarnings}: Do not switch tabs`);

      if (warnings >= maxWarnings) {
        alert("❌ Exam auto-submitted due to cheating");
        onViolation();
      }
    }
  };

  /* ================= RIGHT CLICK ================= */
  const disableRightClick = (e: MouseEvent) => {
    e.preventDefault();
  };

  /* ================= COPY / CUT / PASTE ================= */
  const disableCopy = (e: ClipboardEvent) => e.preventDefault();
  const disableCut = (e: ClipboardEvent) => e.preventDefault();
  const disablePaste = (e: ClipboardEvent) => e.preventDefault();

  /* ================= KEYBOARD BLOCK ================= */
  const disableKeys = (e: KeyboardEvent) => {
    // Block Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+U, Ctrl+S
    if (
      e.ctrlKey &&
      ["c", "v", "x", "u", "s"].includes(e.key.toLowerCase())
    ) {
      e.preventDefault();
    }

    // Block F12 (DevTools)
    if (e.key === "F12") {
      e.preventDefault();
    }
  };

  /* ================= ADD EVENTS ================= */
  document.addEventListener("visibilitychange", handleVisibilityChange);
  document.addEventListener("contextmenu", disableRightClick);
  document.addEventListener("copy", disableCopy);
  document.addEventListener("cut", disableCut);
  document.addEventListener("paste", disablePaste);
  document.addEventListener("keydown", disableKeys);

  /* ================= CLEANUP ================= */
  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    document.removeEventListener("contextmenu", disableRightClick);
    document.removeEventListener("copy", disableCopy);
    document.removeEventListener("cut", disableCut);
    document.removeEventListener("paste", disablePaste);
    document.removeEventListener("keydown", disableKeys);
  };
}