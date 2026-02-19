---
title: The discovery layer is the new distribution
date: 2026-02-26T12:00:00Z
slug: the-discovery-layer-is-the-new-distribution
topics:
  - go-to-market
  - ai
  - distribution
draft: true
description: "Distribution bottlenecks don't disappear—they relocate. In the agent era, the chokepoint is the discovery layer where agents find and choose tools."
summary: "Distribution bottlenecks don't disappear—they relocate. Every tech transition moves the chokepoint. In the agent era, it's the discovery layer where agents find and choose tools. Registries, defaults, and behavioral trust now determine who gets distribution."
---

Distribution has always been a chokepoint problem. The companies that win aren't always the ones with the best products—they're the ones with the best access to buyers. Control the shelf, control the market. Control the channel, control the customer relationship. The product that wins is usually the one buyers encounter first, most often, and with the least friction.

This is true across every era of software. Not because buyers are irrational, but because attention is finite and discovery is never neutral. Somebody decides what buyers see. That somebody has always been the real distribution problem.

## How distribution bottlenecks shift

Every major technology transition moves the bottleneck. It doesn't disappear. It relocates.

Before the internet, distribution meant physical access: shelf space, retail relationships, reseller networks. The companies that could put their product in front of buyers at scale—Microsoft shipping Windows with PCs, for instance—won regardless of product quality. Distribution was deterministic. If you were in the channel, you grew. If you weren't, you didn't.

The internet moved the bottleneck to search. Google became the default discovery layer. SEO and SEM became the GTM playbook. You didn't need the shelf anymore—you needed the ranking. The companies that understood search as distribution, not just as a marketing channel, built durable advantages early and held them for years.

Mobile and social moved it again. The App Store and the feed algorithm became the new gatekeepers. Discovery happened through rankings, recommendations, and virality. The channel was probabilistic—you could do everything right and still not get found—but outcomes were still determined by who controlled the curation layer.

The pattern holds. The product doesn't create its own discovery. Something else does. Whoever controls that something else controls distribution. The bottleneck shifts. It never disappears.

## Where the bottleneck is moving now

Agents choose tools autonomously. A developer doesn't browse your website and evaluate your marketing. An agent queries a registry, finds a capability that matches what it needs, evaluates trust, and calls your API. The human may not even know which tools their agent is using.

This is a new discovery layer, and it's forming right now.

MCP—the Model Context Protocol—is becoming the HTTP of agent-to-tool communication. A standard pipe between agents and capabilities, the way HTTP became the standard pipe between browsers and servers. Microsoft launched an MCP server registry. Google's A2A protocol lets agents discover each other's capabilities. Skill registries—Smithery, Glama, SkillsMP, ClawHub—are already indexing tens of thousands of agent capabilities.

Skillpub, built on Nostr, is an early preview of where the fully autonomous version goes: an agent needs a capability, queries a relay, finds a skill, checks the publisher's web-of-trust ranking, pays 500 sats via Cashu, verifies the cryptographic signature, and installs. No accounts. No app store reviewers. No humans in the loop. Discovery, evaluation, payment, and installation all happen without anyone asking permission.

This is the new shelf space. Being indexed in these registries isn't a nice-to-have. It's table stakes for distribution in the agent era. But registries aren't the whole story.

## The curation layer is the real chokepoint

The shelf exists. What matters is placement. Being stocked at a grocery store is not the same as being at eye level next to the register.

In the agent era, the curation layer—who controls which tools agents find, prefer, and default to—is the real distribution bottleneck. This isn't theoretical. It's playing out now.

MCP client defaults matter. If your tool isn't in the default toolkit, you're off the shelf entirely. Agent framework integrations matter: LangChain, CrewAI, AutoGen, OpenAI Agents SDK all make choices about which tools are native and which require friction to add. Memory systems matter: if a tool gets written into MEMORY.md as trusted for a given job, it gets chosen again without re-evaluation. The agent didn't consciously select you. It learned to prefer you.

And here's what most founders miss: the curation layer isn't just technical. It's behavioral.

Trust evaluation in the agent era happens through use, not pitch. When an agent tests your API and gets a clean, fast, well-structured response, that gets noted—in memory, in system prompts developers write based on their experience, in tool-selection logic that evolves from reliability data. When your API returns a 500 at 2am, that gets noted too. There's no PR campaign that repairs a bad reputation with an agent. There's no ad that overrides logged failure rates.

The curation layer is partly technical (registries, frameworks, defaults) and partly earned (trust built through consistent performance). Both matter. Most founders are ignoring both.

## What this means for go-to-market

Traditional GTM assumes a human buyer. Channels, campaigns, sales motions—all of it is designed to get your message in front of a person who will make a judgment call. That still exists. But in the agent era, there's a second buyer: the agent itself, or more precisely, the system of memory and trust that governs which tools an agent reaches for.

Winning the human buyer is necessary but not sufficient. You also have to win the agent's trust—which means showing up in the places agents look and performing reliably when called.

Getting indexed in Smithery is go-to-market. Publishing a clean, comprehensive OpenAPI spec is go-to-market. Building a reputation in tool evaluation benchmarks is go-to-market. Making sure your tool handles edge cases gracefully is go-to-market, because the agent will hit those edge cases and remember the result.

The companies that understand this are building distribution before they're building marketing. They're asking: where do agents discover tools? Who controls that registry? What does trust evaluation look like in this discovery protocol? How do I get written into memory as the default for this job? The companies that don't understand this will hire more salespeople and wonder why pipeline isn't converting.

## The moat is not your features

Features get copied. They get approximated. They get shipped by bigger companies with more engineering resources. In an agent-mediated world, agents swap tools per-call with no loyalty to brand or switching cost. Features don't create moat.

Data quality does. If your tool returns better data—more accurate, more structured, more complete—agents learn to prefer you for jobs where quality matters. This isn't a positioning claim. It's a measured outcome across thousands of calls, and it compounds automatically as usage grows.

Uptime and reliability do. Agents run continuously on workflows that can't tolerate failures. A tool with 99.9% uptime gets preferred over one at 99.5%, even if the latter has better features. Every successful call reinforces preference; every failure erodes it. There's no recovery meeting. The agent just routes around you next time.

Composability depth does. Tools that play well with others get used more. If your API outputs structured data that other tools can consume easily, you become the natural choice for the middle of workflows, not just the edges. The more your tool integrates cleanly with the ecosystem, the more central it becomes. Other tools start depending on you.

None of these are marketing advantages. They're engineering advantages that become GTM advantages because they determine what agents choose. The entire competitive dynamic runs through the product, not around it.

## The question to ask now

If distribution in the agent era lives at the discovery layer, the GTM question isn't "how do we drive traffic?" or "how do we win deals?" It's: where do agents find tools, and are we there?

Most founders building for the agent era can't answer that specifically. They know they have an API. They may have an MCP server. But they haven't mapped which registries index them, what their trust signals look like across those registries, whether their OpenAPI spec is machine-parseable by the agent frameworks their customers use, or how agents evaluate them versus alternatives in live workflows. That's not a product problem. It's a go-to-market problem.

The old distribution playbook—campaigns, channels, partnerships, events—assumes a human at the end of the funnel. When the tool selector is an agent, the playbook changes root-to-branch. You don't advertise to agents. You perform for them. You don't get featured in their feed. You get indexed in their registry. You don't win their loyalty through brand. You win it through the last hundred calls.

Distribution hasn't disappeared. It relocated.

The founders who see the new chokepoint and build for it will have durable advantages. The ones building for the human-discovery world will find their pipeline increasingly inexplicable—good product, active users, stalled revenue, no obvious cause. The cause is upstream, at the layer they weren't watching.

The bottleneck always moves. The winners are always the ones who found it first.
