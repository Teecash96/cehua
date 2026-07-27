# Glaze Build Prompt — Cehua

Build **Cehua** (策划 — "to strategize"), a beautiful, production-ready Mac app that transforms a raw product idea into a structured PRD and visual user-flow diagram in seconds.

Cehua is designed for the Glaze Store. Every screen, interaction, and piece of copy should feel intentional, polished, and worth featuring. This is not a utility — it is the tool product people wish existed before they started writing.

## Brand identity

Cehua's personality is calm intelligence. It feels like opening a blank Moleskine and finding it already organized. The brand should communicate:

- Clarity from chaos — raw ideas become structured plans
- Quiet confidence — no flashy animations, no chat bubbles, no noise
- Desktop-native pride — this could not exist as a website, and it should feel that way

Include a simple, distinctive app icon: a stylized Chinese character 策 rendered in the accent color on a neutral background. The icon should read clearly at both 128px and 16px sizes.

## Why people will use this every week

Every product person — founders, PMs, indie developers — has the same problem: the gap between a rough idea and a first draft PRD is painful and slow. They stare at a blank doc, copy templates, and waste an hour formatting before they even think clearly.

Cehua eliminates that gap. You describe the idea in plain language, and within seconds you have a structured PRD and a visual user flow you can share with your team, attach to a ticket, or build from. It is the fastest path from thought to plan.

People will return because every new idea starts here. It becomes the first step in their product process.

## Main user journey

1. The user opens Cehua and sees a calm, inviting empty state with a clear prompt to begin.
2. They enter a product idea and optionally add context.
3. They click **Generate plan**.
4. Cehua uses Glaze AI to generate a concise PRD and user flow.
5. The result appears in a clean workspace with **PRD** and **User Flow** tabs.
6. The user edits, copies, or exports the result — and saves it to their local library.

## Screen 1: New plan

The empty state should feel like a fresh canvas, not a blank form. Use generous whitespace and a single clear call to action.

The form contains:

- Product or feature name
- Describe your idea — required multiline field with a placeholder that inspires (e.g., "An app that helps freelancers track unpaid invoices…")
- Target user — optional
- Main problem — optional
- Primary goal — optional
- **Generate plan** button — prominent, using the accent color

Below the form, show three clickable example ideas that demonstrate the app's range:

- "A habit tracker for remote workers"
- "A meal planner that reduces food waste"
- "A peer feedback tool for small teams"

Disable the Generate button until the idea field contains text. Show a gentle inline message if the user tries to submit without an idea.

## Screen 2: Generated workspace

After generation, show the project name at the top and two tabs. The transition should feel smooth and intentional — not jarring.

### PRD tab

Generate an editable, concise PRD with these sections:

- Product summary
- Problem
- Target user
- User goal
- Core features — maximum five
- User stories — maximum five
- Success criteria — maximum five
- Assumptions
- Out of scope

The PRD should be practical and honest. Never invent market statistics, customer research, or unsupported facts. Clearly label reasonable assumptions. The output should read like something a senior PM wrote in 20 minutes — not like AI-generated filler.

### User Flow tab

This is Cehua's signature feature. Generate one primary user flow based on the PRD and display it as a clean vertical sequence of connected cards with subtle connector lines. Include one decision point shown as a branching card.

Every step should have:

- A short step title
- The user action
- The expected result

The flow should include:

- Entry point
- Main actions (3-5 steps)
- One decision point with two outcomes
- Success outcome
- Exit or next step

Keep the flow limited to five to eight steps. Below the visual flow, include a plain-text numbered version for easy copying. The diagram should be the most visually distinctive element in the app — the kind of thing users screenshot and share.

## Screen 3: Saved plans library

Save projects locally on the Mac. Add a sidebar listing recent plans with their name and last-edited time. The sidebar should feel like a personal library — organized, browsable, satisfying to use.

The user can open, rename, or delete a saved plan. Ask for confirmation before deletion.

## AI behavior

Use Glaze AI for generation. Give the AI the form inputs and request structured output for the PRD and user-flow steps. While generation is running, show a friendly, on-brand loading state such as "Turning your idea into a plan…" — not a generic spinner.

If generation fails, keep the user's input and show **Try again**. Never leave the user on a blank screen. The user must be able to manually edit all generated text.

## Export actions

Provide three simple actions:

- **Copy PRD** — copies the PRD as formatted text
- **Copy user flow** — copies the numbered flow
- **Export Markdown** — saves one `.md` file named `{project-name}-plan.md` containing the project title, PRD, and numbered user flow

Show a brief, satisfying confirmation after a successful copy or export — a subtle toast or checkmark, not a dialog.

## Visual direction — this is what wins the award

Cehua must feel like the most beautiful app in the Glaze Store. Every detail matters:

- **Typography** — use a refined, readable type scale. Headings should feel authoritative; body text should feel effortless.
- **Spacing** — generous, consistent, intentional. Whitespace is a feature, not wasted space.
- **Color** — one restrained accent color (indigo or deep blue) used sparingly for actions and emphasis. Everything else is neutral.
- **Borders and depth** — subtle, purposeful. No heavy shadows. No gradients. Let the layout breathe.
- **Dark mode** — full support, not an afterthought. Dark mode should feel like the default for power users.
- **Micro-interactions** — smooth tab transitions, subtle hover states, satisfying button feedback. Nothing flashy, everything deliberate.

Avoid: gradients, decorative dashboards, excessive cards, complex animations, chat-style bubbles, generic loading spinners, and anything that looks like a SaaS template.

## Accessibility and essential states

- Support keyboard navigation and visible focus.
- Give buttons and diagram steps clear labels.
- Do not rely on color alone to communicate meaning.
- Include empty, generating, success, error, and no-saved-plans states — each should feel designed, not default.
- Preserve the user's form input when generation fails.

## Scope boundaries

Keep the app ruthlessly focused. Do not add:

- Accounts, sign-in, teams, or collaboration
- Cloud databases or sync
- Third-party integrations
- Code generation or execution
- Analytics, payments, or subscriptions
- PDF generation
- Multiple AI providers or API-key settings

Use local storage only. The app should feel complete and polished within its focused scope. Every screen should be one a user would be proud to screenshot.

## Definition of done

Cehua is ready for the Glaze Store when a user can download it, choose an example or enter an idea, generate a concise PRD and visual user flow, edit the result, save it locally, reopen it from the sidebar, copy either output, and export the complete plan as Markdown — all without encountering a broken state, placeholder, or unfinished screen.

The app should make the user think: *"I wish I had this last week."*
