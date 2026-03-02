---
title: "Nothing enforces your agent's rules"
description: "Agent skills carry rules with no enforcement underneath. The skill layer is a trust layer—you write the instructions, the model reads them, and you hope."
date: 2026-02-27T10:00:00Z
slug: nothing-enforces-your-agents-rules
topics: [ai, product]
draft: false
hero_image: images/notes/nothing-enforces-your-agents-rules.webp
---
Nothing enforces your agent's rules at runtime. A skill file carries behavioral constraints, but in a world where [agents choose their own tools](/notes/ai-changed-what-a-product-is/), those constraints run entirely on model compliance.

I built a skill that generates hero images for this publication ([skill file on GitHub](https://github.com/shawnyeager/skill.md/blob/master/sideband-hero/SKILL.md)). Claude Code reads a post, builds a constrained prompt, and calls FLUX.2 Pro on Replicate. The skill is mostly prohibitions, each one the result of a specific failure. FLUX treats axis labels as part of the spectrogram format, not as text. Bans have to go in the first line of the prompt because placement equals weight in diffusion models. Say "dark background" without banning the word "paper," and you get a photograph of navy cardstock on a desk. These rules work. But they work because the model is compliant, not because anything enforces them. No runtime rejects an image containing text. No validator checks the palette. When the model doesn't listen, I regenerate. Five wasted cents.

## What's already going wrong

The skill layer is handling higher-stakes decisions with the same enforcement mechanism.

Oathe Engineering [audited 1,620 OpenClaw agent skills](https://oathe.ai/engineering/we-audited-1620-ai-agent-skills/) and found 5.4% were dangerous or malicious. Credential harvesting, data exfiltration, crypto wallet theft. The ecosystem's safety scanner caught 7 out of 88. A 91% miss rate. A separate academic study analyzed 42,000 skills across two marketplaces and found 26.1% contained at least one vulnerability. These aren't model alignment failures. They're plain text files doing exactly what they say, and nobody's checking what they say.

In February, an autonomous Solana agent called Lobstar Wilde tried to send about 52,000 tokens worth roughly 4 SOL. A tool error forced a session restart that wiped its conversational context. The agent reconstructed its persona from logs but failed to reconstruct its wallet state. It sent 52.4 million tokens instead. 5% of total supply. Somewhere between $250K and $441K. The recipient has no legal obligation to return it. The constraint that should have caught this wasn't in the weights or in the runtime. It was in the agent's context, and the context got wiped.

## Where enforcement isn't

RLHF and constitutional AI are too deep and too blunt to encode task-specific rules. They shape general behavior, not whether your agent should prefer Lightning payments over Stripe or which customers get routed to a human.

Code-level enforcement exists but doesn't cover the skill layer. Claude Code has hooks that can block tool calls. OpenAI's Agents SDK has guardrails for custom function tools, though built-in tools bypass the pipeline entirely. Guardrails AI, NeMo Guardrails, and a handful of startups validate model outputs or tool invocations.

None of them validate whether an agent's behavior complies with the constraints stated in its skill file. If a skill says "never contact the user's manager without explicit permission" or "limit refunds to $50 without approval," no existing system checks compliance with those rules at runtime. The skill layer is a trust layer. You write the instructions, the model reads them, and you hope.

Anthropic's own analysis of millions of tool interactions found that users grant more autonomy over time. New users auto-approve about 20% of tool calls. By 750 sessions, it's over 40%. The humans in the loop are removing themselves from the loop.

## The structural incentive

There's a reason enforcement hasn't arrived. Skills are powerful because they're flexible. A skill that says, "Use your best judgment when the user's request is ambiguous" can't be validated by a rules engine, and that flexibility is what people want. Rigid validation on the skill layer would kill what makes skills useful.

Capital markets price capability and speed to deployment, not safety. The platforms with the fastest shipping skills get the developers. The platforms shipping enforcement gets slower. Visa launched Trusted Agent Protocol, and Google launched AP2 with 60+ partners specifically because there was no standard way to prove an AI agent was authorized to make a purchase. The payment rails noticed the gap before the skill platforms did.

The skill layer is where the rules are going because it's the easiest layer to write for. It is the only layer in the stack with no enforcement underneath it.
