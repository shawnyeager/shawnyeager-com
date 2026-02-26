---
title: I know Kung Fu
description: "Agent skills work like The Matrix's upload scene."
date: 2026-02-25T12:00:00Z
slug: i-know-kung-fu
topics: [ai, go-to-market]
tags: [note]
draft: false
---
There's a scene in The Matrix where Tank loads a combat program into Neo's brain. Ten seconds of upload. Neo opens his eyes: "I know Kung Fu." Morpheus doesn't quiz him on theory. He says, "Show me," and they spar.

That's how agent skills work right now.

A `SKILL.md` file is a plain text document. A hundred lines describing how to do something---audit an SEO page, write cold outreach emails, run a security review. The agent reads it and immediately operates at that level. No training run, no fine-tuning. Just a file and a context window.

Neo got one program at a time. Tank had to swap discs. Agents stack skills and self-select. An agent writing code can pull in a debugging skill when something breaks, switch to frontend design for the UI, and then run a code review before shipping. The skill library is open, and the agent decides what to load.

I wrote in [AI changed what a product is](/notes/ai-changed-what-a-product-is/) about distribution shifting to whoever controls tool registries, agent defaults, and discovery protocols. Skills make that concrete. When an agent loads a skill that defaults to a specific API or vendor, that vendor just got chosen without a sales call or a pricing page. The skill is the channel.

And it introduces a buyer that nobody's sales playbook accounts for: the skill author. I wrote about agents creating [two buyers](/notes/ai-changed-what-a-product-is/)---the human with a budget and the agent choosing tools. The person who writes the skill is a third. They decide which tools the agent reaches for, and they might not even realize they're doing distribution.

The [pricing problem](/notes/nobody-knows-how-to-price-for-agents/) gets weirder too. Skills are free. Plain text in a repo. The value is in what the skill routes to. A skill that teaches an agent to run analytics might default to PostHog. One that handles email sequences might wire in Resend. The skill author is an unpaid distribution channel---or a very intentional one. Either way, no seat to price.

Verticals are where it gets durable. Horizontal skills---code review, debugging, copywriting---will commoditize fast. But a skill that encodes how to navigate FDA submissions or how to structure a Bitcoin custody audit? Writing that file requires domain knowledge that most people don't have.

Everyone's watching the models. I'm watching the people who know how to do hard things and can write it down clearly enough for an agent to execute. In the movie, Neo got the glory. Tank was the one who made him dangerous.
