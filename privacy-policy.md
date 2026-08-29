# ForkIt Privacy Policy

**Last updated: 2026-08-29**

ForkIt works without an account. If you never sign in, nothing in this app
leaves your device except crash diagnostics (see *Crash diagnostics* below).

## What we collect

**Email address** — collected only when you choose to sign in. Used solely to
authenticate your account via Supabase, and to send you a one-time sign-in
code. Never sold, and never shared with third parties for their own purposes.

**Recipe data you create** — custom recipes, favorites, cart lines, and
leftovers are stored in a local database on your device.

- **Signed out:** this data stays on your device. Nothing is uploaded.
- **Signed in:** this data is synced to your private account on our Supabase
  database so it is available on your other devices. It is visible only to
  you; it is not published, not shared with other users, and not used to
  build a profile of you.

Meal history, grocery lists, and app settings are **not** synced — they remain
on the device that created them.

**Community recipes** — if you choose to share a recipe, it is published to a
shared database and is visible to all app users. Published recipes carry an
author display name derived from your email address with the domain removed:
an address like `alex.smith@example.com` is published as `alex.smith`. Your
full email address is never published. If that local part identifies you and
you would rather it did not, do not publish, or withdraw the recipe from
Settings.

**Crash diagnostics** — ForkIt uses Sentry to report crashes and errors so we
can fix them. When the app crashes, what is sent is: the stack trace, your
device model, OS version, app version, and the recent internal log lines
leading up to the crash. Crash reports are **not linked to your identity** —
no email address, no account ID, and no advertising identifier is attached.
Tracing, performance monitoring, and session replay are all switched off.

## What we do not collect

- Location data
- Device identifiers or advertising IDs
- Contacts or calendar data
- Behavioural or usage analytics — we do not track which screens you visit,
  what you cook, or how often you use the app
- Any data purchased or obtained from third-party sources

## Where your data is stored

- **On your device:** all recipe, cart, history, and settings data lives in a
  local SQLite database. Uninstalling the app removes it.
- **Sign-in sessions:** stored encrypted on your device using the platform
  keychain, not on our servers. The keychain is deliberately not part of the
  app's own storage, and on iOS it is not erased when an app is deleted. So
  **reinstalling ForkIt normally signs you out on that device**: the app
  clears the stored session the first time it starts and finds its local
  database gone, and your synced recipes do not come back until you sign in
  again.

  Three things that does not cover, stated plainly rather than left to the
  word "normally":

  - Deleting the app does not by itself end the session, because nothing runs
    to end it. The stored credential stays in the device keychain until ForkIt
    is installed and opened again.
  - The app works out that it is a fresh install by looking for its own local
    database. If it cannot tell -- an unreadable path, a storage error -- it
    assumes you did not reinstall and leaves you signed in, because wrongly
    signing out someone who never reinstalled is the worse mistake to make
    automatically.
  - On Android, the system may restore an app's files from a cloud backup
    during a reinstall. When it does, the local database comes back with them
    and the app cannot see that anything was reinstalled, so the session is
    kept.

  If you are giving a device away, sign out from **Settings** first, or erase
  the device. That is the only path that does not depend on any of the above.
- **Supabase:** your synced recipe data and any community recipes you publish
  are stored on a Supabase-hosted PostgreSQL database. Supabase retains
  encrypted backups on its own schedule; deleted rows may persist in those
  backups for a limited period before ageing out.
- **Sentry:** crash reports are retained by Sentry under its own retention
  policy.

## Deleting your data

You can delete your account from inside the app, at any time, without
contacting us: **Settings → Delete account**. It asks you to confirm twice,
then takes effect immediately.

What deletion removes, immediately:

- your account and sign-in credentials
- every synced row belonging to you: custom recipes, favorites, cart lines,
  and leftovers

What deletion does **not** remove:

- **Recipes and lists stored on your device.** These are yours and are left
  alone. To remove them, delete the app. Reinstalling it later starts you
  signed out.
- **Community recipes you published.** These are hidden from the community
  and their author name is replaced with "Deleted user", but they are not
  erased, because other users may have saved their own copies and those
  copies belong to them.

If you cannot access the app — for example, you have lost the device or
uninstalled it — email **vinny.valdez@gmail.com** with the subject
"Delete my ForkIt account", from the address you signed in with. We will
action it within 30 days.

## Third-party services

- **Supabase** — authentication, synced account data, and community recipe
  storage. [Supabase Privacy Policy](https://supabase.com/privacy)
- **Sentry** — crash and error diagnostics.
  [Sentry Privacy Policy](https://sentry.io/privacy/)
- **TheMealDB** — the recipes bundled with the app are sourced from TheMealDB
  and are read-only. No data about you is sent to TheMealDB.

## Children

ForkIt is not directed at children under 13, and we do not knowingly collect
personal information from them.

## Changes to this policy

If this policy changes materially, the "Last updated" date above will change.
Continued use of the app after that date means you accept the revised policy.

## Contact

Questions about this policy or your data? Email **vinny.valdez@gmail.com**.
