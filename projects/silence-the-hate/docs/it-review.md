# IT review brief: Silence The Hate

**For Josh to take to ZAK IT. Draft, 25 Nov 2026.**

## What we're asking IT to look at

ZAK and pflag canada are shipping a small **desktop app** (macOS and Windows, built in Rust by Kyle) that the public downloads from a campaign microsite. It watches which song is playing in the user's music app and skips songs flagged as homophobic or transphobic. Behind it sit a small back end (a signed list of flagged songs, an anonymous skip counter, a content API) and an internal review tool. Launch 17 May 2027, with heavy press. That makes it a target.

## Design choices that reduce risk (already proposed)

- **No user accounts, no listening data collected.** Matching happens on the user's computer; today the app's only network call is downloading the public block list. A future skip counter would be anonymous and opt-in.
- **Signed flag list.** The app checks a signature before using a new list, so nobody can tamper with what gets skipped even if hosting is compromised.
- **Static microsite on a CDN.** Little to attack, cheap to scale.
- **Cloudflare Workers + D1** (Kyle's prototype). D1 has no Canada-only region that we know of; only reviewer emails are stored.

## Questions for IT

**Ownership and accounts**
1. The back end (two Workers + D1) runs on the **Zulubot Cloudflare account**, the review dashboard behind Cloudflare Access with email one-time codes. Right home for a public client launch? Who else needs access? Where should the code live (ZAK GitHub org), including access for pflag contributors?
2. Who should be the **publisher of record** on the Apple Developer ID and Windows code-signing certificate: ZAK or pflag? (Being the named publisher of a hate-related tool may draw harassment. It also decides who can ship updates.)
3. Where are the signing keys and API keys kept, and who can use them? (Proposed: CI-only signing, keys in a secrets manager, never on laptops.)

**Security**
4. What security review does ZAK require before shipping software to the public? Pen test budget?
5. Expected threats: DDoS and harassment around launch, attempts to tamper with the flag list, abuse of the skip counter (which drives donations), fake "suggest a song" submissions. Is our mitigation enough? (WAF, rate limits, signed feed, kill switch.)
6. The internal review tool: SSO via ZAK's identity provider, or a separate login for pflag reviewers?

**Data and AI**
7. Any concerns sending licensed lyrics to the Claude API for classification? (No personal data is involved; lyrics are the provider's content under licence.)
8. Data residency requirements for pflag (a Canadian charity) and for ZAK.
9. Retention: we plan to keep only aggregate counts and the flag catalog. Anything else IT needs logged for audit?

**Endpoints and testing**
10. Can ZAK staff install unsigned or developer-signed beta builds on work machines? Does MDM block Automation / Accessibility permissions the app needs on macOS?
11. Testing on managed Windows machines: any policies that block media-control access?

**Operations**
12. Who is on call for launch week (17–21 May)? Escalation path out of hours?
13. After the campaign: who maintains it, for how long, and how do we retire it cleanly (stop the feed, show a goodbye message, remove downloads)?
14. Does ZAK's cyber insurance cover a public software release like this? Does pflag's?

**Maintainability**
15. Rust: who besides Kyle can maintain the app if he's unavailable? Should we require documentation or a second reviewer on every change?

## What we need back

A yes / no / conditions on each question, a named IT contact for the project, and any policy documents we have to follow. Ideally before **Gate 1 on Friday 18 December**.
