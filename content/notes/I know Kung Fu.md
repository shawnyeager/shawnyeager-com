---
title: I know Kung Fu
description: "Agent skills work like The Matrix's upload scene. Literally."
date: 2026-02-25T12:00:00Z
slug: i-know-kung-fu
topics: [ai, go-to-market]
tags: [note]
draft: false
---
There's a scene in The Matrix where Tank loads a combat program into Neo's brain. Ten seconds of upload. Neo opens his eyes: "I know Kung Fu." Morpheus doesn't quiz him on theory. He says "Show me" and they spar.

That's how agent skills work right now.

A `SKILL.md` file is a plain text document. A hundred lines describing how to do something---audit an SEO page, run a TDD workflow, write cold outreach emails. The agent reads it and immediately operates at that level. No training run, no fine-tuning. Just a file and a context window.

Neo got one program at a time. Tank had to swap discs. Agents stack skills and self-select. An agent running TDD can pull in a debugging skill mid-test, switch to frontend design for the UI, then run a code review before committing. The skill library is open and the agent decides what to load.

I wrote in [AI changed what a product is](/notes/ai-changed-what-a-product-is/) that the real power is shifting to whoever controls tool registries, agent defaults, and discovery protocols. Skills are what that looks like in practice. When an agent loads a skill that defaults to a specific API or vendor, that vendor just got chosen without a sales call or a pricing page. The skill is the channel.

And it introduces a buyer that nobody's sales playbook accounts for: the skill author. I wrote about agents creating [two buyers](/notes/ai-changed-what-a-product-is/)---the human with budget and the agent choosing tools. The person who writes the skill is a third. They decide which tools the agent reaches for, and they might not even realize they're doing distribution.

The [pricing problem](/notes/nobody-knows-how-to-price-for-agents/) gets weirder too. Skills are free. Plain text in a repo. The value is in what the skill routes to. A skill that teaches an agent to run analytics might default to Posthog. One that handles email sequences might wire in Resend. The skill author is an unpaid distribution channel---or a very intentional one. Either way, no seat to price.

I keep coming back to verticals. Horizontal skills---code review, debugging, copywriting---will commoditize fast. But a skill that encodes how to navigate FDA submissions, or how to structure a Bitcoin custody audit? The expertise is in the file. Writing that file requires domain knowledge that most people don't have, and that's harder to replicate than any SaaS feature.

Plugins, extensions, package managers---we've had modular capability before. Skills are the version where the consumer can actually understand the instructions. And whoever builds the default skill library is Tank. Not the hero of the story. But the one who decided Neo could fight.
