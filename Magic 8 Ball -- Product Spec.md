# Enhanced Magic 8 Ball — Product Spec

**Product name:** Enhanced Magic 8 Ball

**Browser/app title:** Enhanced Magic 8 Ball

## Product Summary

Enhanced Magic 8 Ball is a digital Magic 8 Ball that preserves the classic ritual while using the full curated saying catalog in this specification: a user privately considers a yes-or-no question, shakes or activates the ball, and receives one randomly selected response. The question never affects the outcome.

**Core interaction:** **Ask → Shake → Reveal → Ask Again**

## Vision

Recreate the small ritual and suspense of the physical toy in a fast, tactile, and uncluttered digital experience. The product should feel playful and mysterious—not analytical, advisory, or AI-driven.

## Classic Toy Reference

The original Magic 8 Ball is a palm-sized black plastic sphere styled like a billiards 8-ball, with a white circle and black “8” on top and a small clear answer window on the bottom. A floating blue 20-sided die presents a response through that window when the ball is turned over.

The 8-ball version debuted in 1950, developed by Albert C. Carter and Abe Bookman after Brunswick Billiards asked their company to package an earlier fortune-telling device in the form of a billiard ball. It was originally marketed as a novelty/paperweight.

## Product Formats

The product must support a later choice among the three formats below. The build target is intentionally **undecided**; this specification provides requirements for each option so a build agent can recommend or implement the selected one without changing product behavior.

| Format | Primary interaction | Notes |
| --- | --- | --- |
| Web app | Visible **Shake the Ball** button | Fast, browser-based experience. |
| Mobile app | On-screen **Shake the Ball** button | Silent and without haptics. |
| AI skill | User invokes the ball in conversation | Returns a randomly selected catalog answer; it does not interpret a question. |

### Format-Specific Build Requirements

| Capability | Web app | Mobile app | AI skill |
| --- | --- | --- | --- |
| Activation | Visible **Shake the Ball** button; keyboard-accessible | On-screen **Shake the Ball** button | Explicit “ask” invocation or conversational command |
| Visual reveal | Animated 8-ball and blue answer window | Same visual reveal, silently | Text response; optional ball image or animation if the host supports it |
| Question input | None; the user thinks of the question privately | None; the user thinks of the question privately | Invocation may be as simple as “Ask the ball”; no question text is collected |
| Random selection | Local client-side selection | Local on-device selection | Random selection within the skill/backend |
| Accessibility fallback | Keyboard-accessible button and reduced motion | On-screen button; no motion sensing used | Plain-text answer format |
| Privacy default | Do not collect or store questions | Do not collect or store questions | Do not request question text |

### Build-Target Decision Gate

Before implementation begins, choose one initial target based on desired distribution, development effort, platform access, and whether a visual/tactile ball is essential. The response catalog, 50/25/25 outcome weighting, and question-independent randomness are shared requirements across all targets.

The web and mobile versions persist their local no-repeat decks across visits. The AI skill starts a fresh no-repeat cycle for each invocation or conversation and does not persist answer-deck state between conversations.

## Target Experience

1. The user thinks of a yes-or-no question privately; the product does not collect it.
2. The user activates the ball by pressing the on-screen **Shake the Ball** button on mobile or web.
3. The button is disabled and its label changes to **Shaking** while the ball moves with a short suspense animation.
4. A blue answer window reveals one randomly selected response.
5. The response remains visible until the user chooses **Ask Again**, which returns immediately to the initial screen with no reset animation.

## Functional Requirements

### Classic Randomness

- Select exactly one response at random per activation.
- Do not use the user’s question to select, weight, or generate an answer.
- Use the full answer catalog in this specification by default, including the original 20 and all curated additional sayings.
- Preserve the original outcome weights: **50% affirmative**, **25% noncommittal**, and **25% negative**. First select the outcome category using these weights, then select uniformly at random from the sayings assigned to that category.
- Within each outcome category, shuffle its sayings into a no-repeat deck. Do not repeat a saying from that category until every saying in that category has appeared; then reshuffle only that category's deck. This preserves the 50% / 25% / 25% category weighting.
- Keep no visible answer history. Persist the no-repeat deck state locally across visits until each category is exhausted; the state is internal only and must never expose prior answers to the user.
- Do not provide a user-facing reset control; reset each category's deck automatically only after that category is exhausted.
- Prevent a second activation while the shake/reveal animation is in progress.

### Input and Controls

- Do not display a text field or speech-input control. The user thinks of their question privately.
- Mobile: provide an on-screen **Shake the Ball** button; do not require or request motion-sensor permission.
- Web: provide a visible, keyboard-accessible **Shake the Ball** button.
- When the web button has keyboard focus, **Enter** and **Space** activate it.
- Provide an **Ask Again** control after each response.
- Support keyboard activation on the web for accessibility.

### Offline Operation

- After its initial load or installation, the app must work fully offline.
- Store the built-in saying catalog, artwork, and internal no-repeat deck state locally.
- Do not require a network request to activate the ball or reveal an answer.

### Presentation

- The initial screen is title-free and shows only the ball and the **Shake the Ball** button; do not show instructions, onboarding copy, a question field, or additional controls.
- Keep the entire experience within a single viewport; do not allow scrolling.
- Design for portrait orientation only.
- Use dark mode only; do not provide a light-mode variant.
- On wide web screens, present the experience as a centered portrait, phone-like layout rather than expanding it to fill the browser window.
- Center a glossy black ball modeled after a billiards 8-ball on a dark, quiet background.
- On the idle screen, show no answer window; reveal the blue triangular answer window only after **Shake the Ball** is pressed.
- Use subtle dark, rounded, outlined buttons matching the selected concept for both **Shake the Ball** and **Ask Again**.
- Use a **one-second** rocking-in-place animation before reveal; do not rotate or flip the ball.
- Display the answer in white text inside a flat, classic-blue triangular answer window; preserve each saying’s capitalization rather than forcing uppercase; wrap longer sayings across multiple lines at a consistent readable size. Expand the window as needed rather than shrinking, clipping, or excluding a saying. Do not use a luminous glow.
- Display only the selected saying; never show its category, theme, source, or outcome label.
- During the reveal state, show only the ball and its answer window plus the **Ask Again** button; do not show a separate text transcript.
- The experience is silent by default and does not use sound effects.
- Do not use haptic feedback.
- When the device’s Reduce Motion preference is enabled, skip the animation and reveal the answer immediately.

**Approved visual direction:** closely replicate the classic glossy black 8-ball, with a dark minimal interface and flat classic-blue answer window. Approved idle-state reference asset: `Magic 8 Ball -- Approved Idle UI Concept.png` (keep it beside this specification when moving the product materials to a repository).

### App and Site Icon

- Create a custom app/site icon based on the glossy black 8-ball, showing only the white **8** emblem (no answer window).

## Answer Catalog: Original 20

The original set contains 20 responses, distributed across the physical toy's floating 20-sided die. These remain part of the app's default catalog.

### Affirmative (10)

- It is certain
- It is decidedly so
- Without a doubt
- Yes definitely
- You may rely on it
- As I see it, yes
- Most likely
- Outlook good
- Yes
- Signs point to yes

### Noncommittal (5)

- Reply hazy, try again
- Ask again later
- Better not tell you now
- Cannot predict now
- Concentrate and ask again

### Negative (5)

- Don’t count on it
- My reply is no
- My sources say no
- Outlook not so good
- Very doubtful

Within the original set, the 10 / 5 / 5 mix preserves the classic answer distribution.

## Content Architecture

Keep sayings separate from application code, using a small theme-pack data structure. The complete built-in catalog ships with the product and is always available.

```json
{
  "id": "all-sayings",
  "name": "Magic 8 Ball — All Sayings",
  "answers": {
    "yes": ["It is certain", "Outlook good"],
    "maybe": ["Ask again later", "Reply hazy, try again"],
    "no": ["Very doubtful", "My reply is no"]
  }
}
```

## Answer Catalog: Additional Sayings

All sayings in the following sections are included in the default app catalog—not held for a future release. This includes the complete movie-line list and the original rock-inspired list. Categories are organizational metadata; users do not need to select a theme for these responses to be eligible. A later release may add an optional theme filter, but the initial experience randomly draws from the complete catalog.

### Sarcastic Pack

**Yes:** Yes, duh. · Absolutely, unless you mess it up. · The stars say go for it. · For sure, chief. · Signs point to yep. · Obviously.

**No:** Hard no. · Absolutely not. · Not looking good, chief. · Don't hold your breath. · Yikes, probably not. · In your dreams.

**Maybe:** Do I look like Google? · Ask your mom. · Meh. · Again with this? · That's what you're asking? · Error 404: Answer not found. · Decide yourself, coward.

### Surfer Pack

- **Yes:** Totally tubular, bro. · Green light, drop in. · Stoke levels are high.
- **No:** Caught in the impact zone. · Complete wipeout. · Flat spell ahead.
- **Maybe:** Check the surf report later. · Paddle out and see.

### Sports Pack

- **Yes:** Safe! · Nothing but net. · Touchdown!
- **No:** Out of bounds. · Strike three, you're out. · Defense won this round.
- **Maybe:** Under further review. · Time-out, try again.

### Weather Pack

- **Yes:** 100% chance of clear skies. · High pressure system says yes. · Sunny days ahead.
- **No:** Severe storm warning. · Complete washout. · Blizzard conditions.
- **Maybe:** Unpredictable microclimate. · Foggy outlook, check back.

### Tech Pack

- **Yes:** Status 200: OK. · Features deployed successfully. · LGTM (Looks good to me).
- **No:** Error 404: Answer not found. · Access denied. · Hardware failure.
- **Maybe:** System rebooting, try again. · Buffering...

### Movie-Inspired Pack

These lines are manually categorized so they participate in the 50% / 25% / 25% outcome weighting.

- **Yes:** “May the Force be with you.” (*Star Wars*) · “Here’s looking at you, kid.” (*Casablanca*) · “Show me the money!” (*Jerry Maguire*) · “There’s no place like home.” (*The Wizard of Oz*) · “Nobody puts Baby in a corner.” (*Dirty Dancing*) · “Life finds a way.” (*Jurassic Park*) · “To infinity and beyond!” (*Toy Story*) · “I’m king of the world!” (*Titanic*) · “Carpe diem. Seize the day.” (*Dead Poets Society*)
- **Maybe:** “I’ll be back.” (*The Terminator*) · “Why so serious?” (*The Dark Knight*) · “Roads? Where we’re going we don't need roads.” (*Back to the Future*)
- **No:** “You can’t handle the truth!” (*A Few Good Men*) · “I see dead people.” (*The Sixth Sense*) · “Keep the change, ya filthy animal.” (*Home Alone*)

### ’80s & ’90s Rock-Inspired Pack

These are original, rock-inspired phrases—not song lyrics.

- **Yes:** Turn it up—this one goes to eleven. · Stadium lights are calling. · Take the encore. · The chorus says yes. · Plug in and play it loud.
- **Maybe:** Wait for the guitar solo. · Check back after the bridge. · The signal is fuzzy. · Let the feedback settle. · One more track should decide it.
- **No:** The amp just blew. · That riff isn’t landing. · Save it for the B-side. · The crowd has gone quiet. · Not every song needs a sequel.

### Theme-Pack Management

- The full built-in catalog ships with the product and is enabled by default.
- Built-in packs can ship as bundled JSON.
- Users could create private custom packs in-app.
- Import/export can enable personal sharing of validated JSON packs.
- A public pack library, if introduced, requires schema validation and content moderation.

## Non-Goals for the Classic Release

- No AI interpretation, advice, or contextual answer generation.
- No accounts, social feed, or question history.
- No collection, typing, or speaking of a question.
- No promise that answers are meaningful, predictive, or factual.
- No theme selector or customization is required for launch; all built-in sayings are available automatically.

## Accessibility and Privacy

- Provide button/keyboard alternatives to shaking.
- Respect reduced-motion and system accessibility preferences.
- Announce the selected answer through screen-reader accessibility text; do not add a separate visible answer transcript.
- Do not collect or store questions.
- Collect no analytics, telemetry, usage events, or identifiers.
- Keep the interface completely free of explanatory and disclaimer text.

## Launch Acceptance Criteria

- A user can receive a result in no more than two actions after opening the product.
- Every saying in the Original 20 and Additional Sayings catalog sections is available and eligible for random selection.
- A question has no influence on the result.
- Mobile and web each have a non-motion activation method.
- The reveal is legible, responsive, and usable with reduced motion enabled.
