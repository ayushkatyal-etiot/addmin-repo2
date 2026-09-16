---
title: "Approvals & Payments"
description: "Maker-Checker-Payment Authorizer routing enforced at the API layer, with automatic TDS calculation on rent — control Finance can actually trust."
layout: "feature"
badge: "Workflow"
badgeColor: "#008D49"
features:
  - title: "Server-side role and office scope"
    description: "Every API call checks the caller's role and assigned office before it executes — not just the UI. A user scoped to Office A cannot read or write Office B's records, full stop."
  - title: "Maker-Checker segregation of duties"
    description: "The person who enters a bill can't also approve it, unless an organization explicitly configures the exception. Approval routing follows office- and amount-based thresholds automatically."
  - title: "Payment Authorizer limits"
    description: "Payments are restricted to the Payment Authorizer role and blocked outright — not just warned — if they exceed that authorizer's configured limit."
  - title: "TDS calculated automatically on rent"
    description: "TDS is computed against the configured organization or landlord-specific rate, net payable is shown alongside gross rent, and a landlord missing TDS configuration blocks payment with a clear error instead of a silent zero."
demo:
  description: "Walk through a bill from entry to paid."
  image: "/images/feature-demo.svg"
---

## Control Finance can sign off on

Office Admin owns the process. Finance retains authorization control. AddMin enforces the boundary between the two at the API layer, so it can't be bypassed by a clever UI workaround.

### The approval path

1. A bill is entered and submitted — it lands in the Checker's queue based on configured routing by office, utility type, or amount threshold.
2. The Checker approves, rejects with a mandatory remark, or returns it for correction.
3. An approved bill moves to **Awaiting Payment** and enters the Payment Authorizer's queue.
4. The Payment Authorizer records date, amount, mode, and reference number — validated against their authorization limit.
5. Every approve, reject, return, and payment action is written to the audit trail with a before/after status.

### Built for the Finance co-buyer

- No approver configured for a transaction blocks submission with a clear configuration error — never a silent failure.
- Unauthorized access attempts are logged to the audit module, not dropped.
- TDS history is exportable landlord-wise for reconciliation against your ERP.
