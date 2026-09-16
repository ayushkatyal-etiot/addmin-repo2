---
title: "About AddMin"
layout: "company"
description: "Why we're building an office administration operating system, and who it's for."
---

{{< section-container class="bg-gradient-to-b from-primary-50 via-primary-50 to-white pt-20 pb-32" >}}
    <div class="text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-6">Office admin shouldn't run on spreadsheets and WhatsApp reminders</h1>
        <p class="text-xl text-gray-600 mb-16">We tell admin teams what to manage, instead of waiting for them to remember.</p>
        <div class="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8">
            <h2 class="text-3xl font-bold mb-4">Our Mission</h2>
            <p class="text-xl text-gray-600">
                Office Admin teams at mid-to-large companies run utility bills, rent, DG/UPS/Solar maintenance, statutory compliance, vendor AMCs, and asset custody through spreadsheets, WhatsApp groups, and email threads. Bills get missed, leases lapse, and licences expire — not from negligence, but because no system knows what's owed until it's already late. AddMin exists to be that system: obligation-first, not expense-first.
            </p>
        </div>
    </div>
{{< /section-container >}}

{{< section-container class="py-20" >}}
    <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold text-center mb-12">What we believe</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            {{< value-card
                title="Office-first, not expense-first"
                icon="lightbulb"
                description="Every flow starts from an office and its obligations — never from a blank expense form."
            >}}
            {{< value-card
                title="Authorization enforced server-side"
                icon="lock"
                description="Role and office scope are checked at the API layer, not hidden behind a disabled button. This is a compliance and audit product first."
            >}}
            {{< value-card
                title="No dummy dashboards, ever"
                icon="eye"
                description="No seeded or hard-coded KPI data appears in any dashboard shown to a real user. If it's on screen, it's live."
            >}}
        </div>
    </div>
{{< /section-container >}}

{{< section-container class="py-20 bg-gray-50" >}}
    <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {{< stat number="18" label="P0 features shipping in v1" >}}
            {{< stat number="3-50" label="Offices per organization we're built for" >}}
            {{< stat number="0" label="Dummy KPIs on any live dashboard" >}}
            {{< stat number="2" label="Consecutive billing cycles to call an office live" >}}
        </div>
    </div>
{{< /section-container >}}
