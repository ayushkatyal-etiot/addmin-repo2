---
title: "Pricing"
description: "Per-organization pricing, tiered by office count. Value compounds with the number of offices and users you coordinate, not usage volume."
layout: "pricing"
---

{{< pricing-table-1 >}}
{
    "title": "Priced by offices, not seats",
    "description": "Every plan includes unlimited users per office. Annual contracts include a discounted paid-pilot rate for early design partners.",
    "plans": [
        {
            "name": "Starter",
            "price": "15,000",
            "description": "For a single office finding its footing.",
            "features": [
                "Up to 5 offices",
                "Guided Office Onboarding",
                "Recurring Obligation Engine",
                "Maker-Checker approval workflow",
                "Office Home & My Actions",
                "Email support"
            ],
            "button": {
                "text": "Start Free Trial",
                "url": "http://192.168.30.22:3000/signup?plan=starter"
            }
        },
        {
            "name": "Growth",
            "price": "25,000",
            "description": "For companies actively opening new branches.",
            "featured": true,
            "features": [
                "Up to 10 offices",
                "Everything in Starter",
                "TDS calculation on rent",
                "Vendor & AMC tracking",
                "Executive cross-office dashboard",
                "Priority support"
            ],
            "button": {
                "text": "Start Free Trial",
                "url": "http://192.168.30.22:3000/signup?plan=growth"
            }
        },
        {
            "name": "Enterprise",
            "price": "Custom",
            "description": "For 10+ offices with dedicated rollout support.",
            "features": [
                "Unlimited offices",
                "Everything in Growth",
                "Dedicated onboarding support",
                "Custom compliance certificate types",
                "SLA guarantee",
                "Priority roadmap input"
            ],
            "button": {
                "text": "Contact Sales",
                "url": "/contact"
            }
        }
    ]
}
{{< /pricing-table-1 >}}

{{< faq >}}
{
    "title": "Frequently Asked Questions",
    "description": "What Admin and Finance teams ask before rolling AddMin out.",
    "questions": [
        {
            "question": "How is pricing calculated?",
            "answer": "Per organization, tiered by number of offices. Prices shown are per month for up to 5 or 10 offices respectively; the Enterprise tier is priced by negotiation above 10 offices."
        },
        {
            "question": "Does AddMin execute payments, or just track them?",
            "answer": "AddMin records payments made outside the platform — date, amount, mode, and reference number — with full authorization control and audit trail. It is not a payment gateway."
        },
        {
            "question": "Is role and office access enforced on the backend, not just the UI?",
            "answer": "Yes. Every API call checks the caller's role and office scope before executing, independent of any client-side check — this is enforced at the server, not hidden behind a hidden button."
        },
        {
            "question": "Can we run a paid pilot before committing to an annual contract?",
            "answer": "Yes. Starting a free trial gives you 14 days on the Starter or Growth plan with no card required. If you want a discounted paid-pilot rate as a design-partner organization instead, contact sales."
        },
        {
            "question": "What happens when I click Start Free Trial?",
            "answer": "You create your account, complete the Guided Office Onboarding checklist for your first office, then choose a plan to activate it. Your trial starts the moment your account is created — no payment method is needed until you choose to subscribe."
        }
    ]
}
{{< /faq >}}
