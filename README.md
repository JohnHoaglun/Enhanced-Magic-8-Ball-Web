# Enhanced Magic 8 Ball Web

A single-screen, portrait-oriented web experience for **Enhanced Magic 8 Ball**.

## Experience

1. The user privately thinks of a yes-or-no question.
2. They press **Shake the Ball**.
3. The button becomes disabled and reads **Shaking** while the ball rocks in place for one second.
4. A random answer appears in the blue answer window and remains until **Ask Again** is pressed.

The question is never collected or used to determine the response. The web app uses the complete curated saying catalog, preserves the 50% affirmative / 25% noncommittal / 25% negative weighting, and prevents repeats within each outcome category until that category is exhausted.

## Requirements

- Dark-only, title-free, one-screen UI with no scrolling.
- Centered portrait, phone-like layout on wide displays.
- Visible, keyboard-accessible **Shake the Ball** button; Enter and Space activate it when focused.
- Silent; no haptics, analytics, question storage, or visible history.
- Fully offline after initial load, with local storage for the saying catalog and no-repeat deck state.
- Reduce Motion reveals the answer immediately.

## Product Materials

- [Product specification](Magic%208%20Ball%20--%20Product%20Spec.md)
- `Magic 8 Ball -- Approved Idle UI Concept.png` — approved idle-state visual reference.

## Status

Product requirements and design direction are complete. Implementation is pending.
