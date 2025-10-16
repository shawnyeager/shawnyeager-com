---
title: "Trust Revolution"
description: "Trust Revolution podcast: Unfiltered conversations with builders, thinkers, and operators in Bitcoin. Exploring trust, decentralization, and what comes next."
subtitle: "Rethinking trust for a decentralized future"
date: 2025-10-11
type: page
layout: podcast
---

<section class="media-section">

<div class="podcast-header">
    <img src="/images/trust-revolution-cover.webp" alt="Trust Revolution Podcast" class="podcast-art">
    <div class="podcast-info">
        <p>Unfiltered conversations with builders, thinkers, and operators in Bitcoin and beyond. Exploring the systems we trust, why they work (or don't), and what comes next.</p>
    </div>
</div>

</section>

<section class="media-section">

### Listen & Subscribe

<div class="podcast-services-card">
    <div class="podcast-services">
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
    <code id="rss-url" class="rss-url">{{ .Site.Params.podcast_rss }}</code>
    <button onclick="copyRSS()" id="copy-btn" class="rss-copy-btn">Copy</button>
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
