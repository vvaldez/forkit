# Milestone standard operating procedure (SOP)

## Principles

- **Be explicit:** state intent clearly—in names, docs, plans, and configuration—so the next reader (human or agent) does not have to guess.
- **Be efficient:** avoid redundant work and duplicate sources of truth (the same value in two files, two docs, or two parallel processes). Prefer one canonical place and wire consumers to it.

This extends step 1 below: research should reduce duplicated effort, not repeat it.

## Development environment

- **Dev machine:** Windows (PowerShell)
- **Mobile testing:** iPhone on the same LAN (access via the dev machine's local IP, e.g. `192.168.86.x:3000`)
- **Target deployment:** Publicly hosted (Vercel or equivalent) so the app is reachable beyond the local network

Keep these constraints in mind when choosing tools, writing scripts, and configuring servers. Anything that only works on Unix or only on localhost should be flagged.

## Milestone workflow

For each milestone, follow these steps in order:

1. **Research & discovery:** Before designing, research the existing codebase and any relevant libraries or APIs. Understand the current state and options; weigh pros and cons so work is not duplicated and recommendations are informed.
2. **Design & propose:** From that research, produce a design and implementation plan.
3. **Discussion & approval:** Review the plan with the project owner. Do not implement until they approve.
4. **Implement:** Build the approved design in code.
5. **Update docs:** If the milestone introduces new setup steps, dependencies, environment variables, or dev workflow changes, update `README.md` before moving to testing.
6. **Test:** Add automated tests (e.g. unit or integration) for new behavior and run the full test suite to catch regressions.
7. **Review & verify:** When implementation and tests are done, tell the project owner so they can run the app, manually verify, and give feedback.
8. **Mark as done:** After they confirm they are satisfied, mark the milestone complete in `PLAN.md`.
9. **Commit:** Stage all milestone changes and create a single descriptive commit. If multiple commits were made during implementation, squash them into one commit per milestone before moving on.
