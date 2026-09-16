---
title: "Recurring Obligation Engine"
description: "Every utility, lease, AMC, and compliance item gets a recurring schedule that generates itself ahead of time — and flags what's missing before it becomes a crisis."
layout: "feature"
badge: "Core Engine"
badgeColor: "#0B0B0B"
features:
  - title: "Guided Office Onboarding"
    description: "A checklist across Property, Utilities, Facilities, Compliance, Vendors, Assets, and Roles replaces the blank expense form new offices usually start from."
  - title: "Automatic obligation generation"
    description: "Every active utility connection, lease, AMC contract, or compliance item automatically gets a RecurringObligationSchedule — no manual setup per bill cycle."
  - title: "Missing Bill / Expected Item Alert"
    description: "If an expected bill, rent instance, or renewal doesn't show up by its window, the system flags it Missing and notifies the Office Admin — before a vendor call forces the issue."
  - title: "Lease and compliance renewal reminders"
    description: "Lease renewals fire at 180/90/60/30 days out. Compliance certificates move Valid → Expiring → Expired with escalation to the Office Head within a configurable SLA."
demo:
  description: "See the obligation calendar in action."
  image: "/images/feature-demo.svg"
---

## Obligation-first, not expense-first

Generic expense tools wait for a receipt to show up. AddMin's Recurring Obligation Engine works the other way: the moment an office registers a utility connection, a lease, an AMC contract, or a compliance requirement, a recurring schedule is created for it — and the next expected instance appears in the admin's queue *before* it's due.

### How it works

1. A utility connection, active lease, AMC contract, or applicable compliance item is set up (usually during Guided Office Onboarding).
2. A nightly job evaluates every active schedule and generates the next period's obligation instance ahead of its expected date.
3. The instance shows up in **My Actions** as *Expected* — before any invoice has arrived.
4. When a bill, renewal, or invoice is entered against it, the instance moves to *Received / In Process*, then *Closed* once the workflow finishes.
5. If the expected date passes with nothing entered, the instance flips to *Missing* and escalates.

### Why it matters

- Nothing depends on someone remembering a due date — the schedule remembers for them.
- A missed bill is caught the day it should have arrived, not weeks later when service is cut.
- Deactivating a lease or utility stops future generation without deleting the audit history.
