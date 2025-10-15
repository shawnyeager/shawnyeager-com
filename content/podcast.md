---
title: "Trust Revolution"
description: "Trust Revolution podcast: Unfiltered conversations with builders, thinkers, and operators in Bitcoin. Exploring trust, decentralization, and what comes next."
subtitle: "Rethinking trust for a decentralized future"
date: 2025-10-11
type: page
layout: podcast
---

<section class="media-section">

<div class="podcast-header" style="margin-bottom: 4rem;">
    <img src="/images/trust-revolution-cover.webp" alt="Trust Revolution Podcast" class="podcast-art" style="width: 180px; height: 180px;">
    <div class="podcast-info">
        <p style="margin: 0;">Unfiltered conversations with builders, thinkers, and operators in Bitcoin and beyond. Exploring the systems we trust, why they work (or don't), and what comes next.</p>
    </div>
</div>

</section>

<section class="media-section">

### Listen & Subscribe

<div class="podcast-services-card">
    <div class="podcast-services" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
        <a href="https://fountain.fm/show/Mk0fJte5vrfiDQ5RyCZd" target="_blank">Fountain</a>
        <a href="https://podcasts.apple.com/us/podcast/trust-revolution/id1801093421" target="_blank">Apple Podcasts</a>
        <a href="https://open.spotify.com/show/28nrs8ROe8mhjtyA7kftYZ" target="_blank">Spotify</a>
        <a href="https://www.youtube.com/@trustrev" target="_blank">YouTube</a>
        <a href="https://trustrevolution.substack.com" target="_blank">Substack</a>
        <a href="https://pocketcasts.com/podcast/trust-revolution/b34ae280-e76a-013d-1b17-0acc26574db2" target="_blank">Pocket Casts</a>
    </div>
</div>

</section>

<section class="media-section">

### RSS Feed

Copy this URL to subscribe in any podcast app:

<div class="rss-feed-card">
    <code id="rss-url" style="font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Droid Sans Mono', 'Source Code Pro', monospace; font-size: 0.9rem; color: var(--text-primary); word-break: break-all; display: block; padding-right: 4rem;">{{ .Site.Params.podcast_rss }}</code>
    <button onclick="copyRSS()" id="copy-btn" style="position: absolute; right: 1.5rem; top: 50%; transform: translateY(-50%); background: transparent; color: var(--text-secondary); border: 1px solid var(--border-color); padding: 0.4rem 0.75rem; border-radius: 4px; cursor: pointer; font-weight: 500; font-size: 0.85rem; transition: all 0.2s;">Copy</button>
</div>

<script>
function copyRSS() {
    const url = document.getElementById('rss-url').textContent;
    const btn = document.getElementById('copy-btn');

    navigator.clipboard.writeText(url).then(() => {
        btn.textContent = 'Copied!';
        btn.style.color = 'var(--brand-orange)';
        btn.style.borderColor = 'var(--brand-orange)';

        setTimeout(() => {
            btn.textContent = 'Copy';
            btn.style.color = 'var(--text-secondary)';
            btn.style.borderColor = 'var(--border-color)';
        }, 2000);
    });
}
</script>

</section>
