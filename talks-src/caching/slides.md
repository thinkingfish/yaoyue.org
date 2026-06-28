---
theme: default
title: Datacenter caching — a round-trip to the ephemeral store
info: |
  Yao's Systems Meetup presentation on cache
layout: default
class: text-center
highlighter: shiki
transition: slide-left
mdc: true
fonts:
  sans: IBM Plex Sans
  mono: IBM Plex Mono
  weights: '300,400,500,600,700'
---

<div class="title-slide">
  <h1>Datacenter caching:<br />A round-trip to the ephemeral store</h1>
  <p class="byline mono">Yao Yue</p>
</div>

<!-- Design system lives in styles/index.css (global). Edit there, not here. -->

---

<div class="divider">
  <div class="kicker">Part One</div>
  <h1>The Landscape</h1>
</div>

---

# Cache research

<div class="cards" style="margin-top:2.2rem">
  <div class="card">
    <div class="head"><span class="label">1946</span><span class="phase">Memory hierarchy</span></div>
  </div>
  <div class="card">
    <div class="head"><span class="label">1962</span><span class="phase">"One-level store" in Atlas computer: automated data shuffle</span></div>
  </div>
  <div class="card">
    <div class="head"><span class="label">1965</span><span class="phase">"Slave Memories": first description of CPU cache</span></div>
  </div>
  <div class="card">
    <div class="head"><span class="label">1968</span><span class="phase">"Cache" in IBM System/360 Model 85</span></div>
  </div>
</div>

<h2  style="margin-top:3.2rem"> Almost as old as computers; 50+ years of research </h2>

---

# A decade+ of cache work at Twitter and beyond

<div class="cards decade" style="margin-top:2.2rem">
  <div class="card" v-click>
    <div class="head"><span class="label">2010 – 2020</span><span class="phase"><a href="https://danluu.com/cache-incidents/" target="_blank" rel="noopener noreferrer" style="color:inherit;">A decade of (Twitter) cache incidents</a></span></div>
    <div class="reveal">tail latency · scalability · observability</div>
    <div class="reveal" style="font-weight:300;"><em>klog: cache request logging at line rate</em></div>
  </div>
  <div class="card" v-click>
    <div class="head"><span class="label">2015 – </span><span class="phase"><a href="https://pelikan.io/" target="_blank" rel="noopener noreferrer" style="color:inherit;">Pelikan: a modular cache system</a></span></div>
    <div class="reveal">clean abstraction ·  composable design · new hardware </div>
    <div class="reveal">pluggable cache systems</div>
  </div>
</div>

<style>
.decade .slidev-vclick-target { transition: opacity .45s ease, transform .45s ease; }
.decade .slidev-vclick-hidden { transform: translateY(1.4rem); }
</style>

---

<div class="divider">
  <div class="kicker">Part Two</div>
  <h1>An arc for cache research:<br /> Who, When, and What</h1>
</div>

---

# Who

<div style="display:flex; justify-content:center; align-items:flex-start; gap:16rem; margin-top:0rem;">
  <div style="text-align:center;">
    <Img src="JunchengYang.jpg" alt="Juncheng Yang" style="height:220px; object-fit:contain;" />
    <div class="mono" style="margin-top:0.3rem; color:var(--ink-2); font-size:0.8rem;"><a href="https://jasony.me/" target="_blank" rel="noopener noreferrer">Juncheng Yang</a></div>
  </div>
  <div style="text-align:center;">
    <Img src="YazhuoZhang.jpg" alt="Yazhuo Zhang" style="height:220px; object-fit:contain;" />
    <div class="mono" style="margin-top:0.3rem; color:var(--ink-2); font-size:0.8rem;"><a href="https://yazhuozhang.com/" target="_blank" rel="noopener noreferrer">Yazhuo Zhang</a></div>
  </div>
</div>

<div style="display:flex; justify-content:center; align-items:flex-start; gap:12rem; margin-top:1.8rem;">
  <div style="text-align:center;">
    <Img src="RashmiVinayak.jpeg" alt="K.V. Rashmi" style="height:110px; object-fit:contain;" />
    <div class="mono" style="margin-top:0.2rem; color:var(--ink-2); font-size:0.6rem;"><a href="https://www.cs.cmu.edu/~rvinayak/" target="_blank" rel="noopener noreferrer">K.V. Rashmi</a></div>
  </div>
  <div style="text-align:center;">
    <Img src="YmirVigfusson.jpg" alt="Ymir Vigfusson" style="height:110px; object-fit:contain;" />
    <div class="mono" style="margin-top:0.2rem; color:var(--ink-2); font-size:0.6rem;"><a href="https://ymsir.com/" target="_blank" rel="noopener noreferrer">Ymir Vigfusson</a></div>
  </div>
  <div style="text-align:center;">
    <Img src="YaoYue.jpg" alt="Yao Yue" style="height:110px; object-fit:contain;" />
    <div class="mono" style="margin-top:0.2rem; color:var(--ink-2); font-size:0.6rem;"><a href="https://yaoyue.org" target="_blank" rel="noopener noreferrer">Yao Yue</a></div>
  </div>
</div>

---

# Let there be data

<div class="card" style="margin-top:0.8rem">
  <div class="head">
    <div style="display:flex; align-items:center; gap:0.55rem;"><span class="label label--accent">OSDI '20, TOS</span><span class="name">A Large-scale Analysis of Hundreds of In-memory Key-value Cache Clusters at Twitter</span></div>
    <div class="links" style="margin-top:0; margin-left:1.25rem">
      <a class="pill" href="https://www.usenix.org/conference/osdi20/presentation/yang" target="_blank" rel="noopener noreferrer">OSDI '20 ↗</a>
    <a class="pill" href="https://dl.acm.org/doi/pdf/10.1145/3468521" target="_blank" rel="noopener noreferrer">TOS — extended ↗</a>
    <a class="pill" href="https://github.com/twitter/cache-trace" target="_blank" rel="noopener noreferrer">open-source ↗</a>
    </div>
  </div>
  <ul>
    <li>Clusters: 200+ collected, 54 published</li>
    <li>one week · one shard · 100% production traffic</li>
    <li>14&nbsp;TB of data, open-sourced</li>
  </ul>

</div>

<div class="eyebrow" style="margin-top:3rem">Key takeaway</div>
<div class="takeaway">Unsampled raw data is <span class="accent">so</span> useful.</div>
<div class="quote">
  "This will be one of the most cited cache publications within a decade."
  <span class="who">— Juncheng</span>
</div>

<div class="note" style="margin-top:2rem">Many more traces have been released over the past five years — the more, the merrier.</div>

---

# Design a new cache system

<div class="card" style="margin-top:0.8rem">
  <div class="head">
    <div style="display:flex; align-items:center; gap:0.55rem;"><span class="label label--accent">NSDI '21</span><span class="name">Segcache</span></div>
    <div class="links" style="margin-top:0; margin-left:1.25rem">
      <a class="pill" href="https://www.usenix.org/conference/nsdi21/presentation/yang-juncheng" target="_blank" rel="noopener noreferrer">paper ↗</a>
    <a class="pill" href="https://pelikan.io/2021/segcache.html" target="_blank" rel="noopener noreferrer">blog ↗</a>
    <a class="pill" href="https://github.com/pelikan-io/cache-rs/tree/main/crates/segcache" target="_blank" rel="noopener noreferrer">cache-rs ↗</a>
    </div>
  </div>

  <div class="eyebrow">Key takeaway</div>
  <div class="takeaway">Grouping allows amortization of <span class="accent">bookkeeping</span> overhead and bulk I/O.</div>
  <div class="takeaway"><span class="accent">TTL</span> is extremely important for web cache.</div>
  <div class="eyebrow blue" style="margin-top:0.45rem">Also matters</div>
  <div class="secondary">throughput &amp; latency matter a lot in production; scalability necessary for future-proofing </div>
</div>

<div style="text-align:center; margin-top:0.2rem">
  <Img src="segcache.png" alt="Segcache Architecture Overview" style="width:90%; object-fit:contain; display:block; margin:0 auto;" />
  <div class="mono" style="margin-top:0.7rem; color:var(--ink-2); font-size:0.9rem;">Architecture Overview</div>
</div>

---

# A hot take

<div style="display:flex; max-width:100%;">
  <div class="card">
    <div class="head" style="row-gap:0.2rem;"><span class="label label--accent">HotOS '23</span><span class="name">FIFO can be Better than LRU: the Power of Lazy Promotion and Quick Demotion</span></div>
    <div class="links" style="margin-top:0.45rem; flex-wrap:nowrap;">
      <a class="pill" href="https://dl.acm.org/doi/abs/10.1145/3593856.3595887" target="_blank" rel="noopener noreferrer">paper ↗</a>
      <a class="pill" href="https://blog.jasony.me/system/cache/2023/06/24/fifo-lru" target="_blank" rel="noopener noreferrer">blog ↗</a>
    </div>
    <div class="secondary" style="margin-top:0.55rem">A bold claim made on the back of an even larger scale study across thousands of traces</div>
  </div>
  <Img src="fifoAllTheWay.jpg" alt="FIFO all the way" style="margin-left:1rem; width:30%; object-fit:contain; flex-shrink:0;" />
</div>

<div class="cards c2" style="margin-top:1.8rem">
  <div class="card">
    <span class="phase" style="color:var(--orange);">Lazy Promotion (LP)</span>
    <div v-click>
      <div class="reveal">→ performs promotion only when necessary</div>
      <div class="reveal">→ <em>minimizes data movement for throughput and scalability</em></div>
    </div>
  </div>
  <div class="card">
    <span class="phase" style="color:var(--orange);">Quick Demotion (QD)</span>
    <div v-click>
      <div class="reveal">→ rejects long-tail objects early</div>
      <div class="reveal">→ <em>improves effective memory size</em></div>
    </div>
  </div>
</div>

---

# FIFO, FIFO, FIFO

<div class="card">
  <div class="head">
    <div style="display:flex; align-items:center; gap:0.55rem;"><span class="label label--accent">SOSP '23</span><span class="name">FIFO queues are all you need for cache eviction</span></div>
    <div class="links" style="margin-top:0; margin-left:1.25rem">
      <a class="pill" href="https://dl.acm.org/doi/abs/10.1145/3600006.3613147" target="_blank" rel="noopener noreferrer">paper ↗</a>
      <a class="pill" href="https://s3fifo.com/blog/2023/08/01/fifo-queues-are-all-you-need-for-cache-eviction/" target="_blank" rel="noopener noreferrer">blog ↗</a>
    </div>
  </div>
  <div class="secondary" style="margin-top:0.35rem">Simple, Scalable caching with three Static queues</div>
  <div style="margin-top:0.7rem;">
    <div class="eyebrow">Key takeaway</div>
    <div class="takeaway">A tiny FIFO queue filters out one-hit wonders; queue transitions achieve both LP &amp; QD.</div>
  </div>
</div>
<Img src="diagram_s3fifo.svg" alt="S3-FIFO illustration" style="display:block; width:66%; margin:1.5rem auto 0;" />

---

# The better LRU hidden under our nose

<div class="card" style="margin-top:0.7rem">
  <div class="head">
    <div style="display:flex; align-items:center; gap:0.55rem;"><span class="label label--accent">NSDI '24</span><span class="name">SIEVE</span></div>
    <div class="links" style="margin-top:0; margin-left:1.25rem">
      <a class="pill" href="https://www.usenix.org/conference/nsdi24/presentation/zhang-yazhuo" target="_blank" rel="noopener noreferrer">paper ↗</a>
      <a class="pill" href="https://cachemon.github.io/SIEVE-website/blog/2023/12/17/sieve-is-simpler-than-lru/" target="_blank" rel="noopener noreferrer">blog ↗</a>
    </div>
  </div>
  <div class="eyebrow">Key takeaway</div>
  <div class="takeaway">Don't reorder on a hit, just mark it — <span class="accent">lazy promotion</span> and <span class="accent">quick demotion</span> from a single bit — simpler than LRU, and better.</div>
</div>

<Img src="sieve_diagram_animation.gif" alt="SIEVE animation" style="display:block; width: 56%; margin: 1.6rem auto 0;" />

---

# The quiet gospel: "What do we care about?"

<div class="phase">
Hit/Miss ratio is the loud part. But quietly, we also want:
</div>

<div class="cards c3" style="margin-top:1rem">
  <div class="card" v-click>
    <ul class="rlist">
      <li>efficiency</li>
      <li>throughput</li>
      <li>scalability</li>
    </ul>
  </div>
  <div class="card" v-click>
    <ul class="rlist">
      <li>memory overhead</li>
      <li>medium access pattern</li>
    </ul>
  </div>
  <div class="card" v-click>
    <ul class="rlist">
      <li>simplicity</li>
      <li>generality</li>
      <li>configurability</li>
    </ul>
  </div>
</div>

<div v-click>
  <div class="eyebrow" style="margin-top:2rem;">Takeaway</div>
  <div class="takeaway">Improving real production systems is always a <span class="accent">multi-constraint, multi-objective</span> optimization problem.</div>
</div>
---

<div class="divider">
  <div class="kicker">Part Three</div>
  <h1>The Takeaway</h1>
</div>

---

# Better + Simpler = Win

<div class="cards c2" style="margin-top:3rem; max-width:92%; gap:2.2rem;">
  <div class="card">
    <div class="head">
      <span class="name"><a href="https://s3fifo.com/" target="_blank" rel="noopener noreferrer">S3-FIFO</a></span>
    </div>
    <div class="eyebrow">In production</div>
    <div class="secondary">Google · VMware · <a href="https://github.com/cloudflare/pingora/tree/main/tinyufo" target="_blank" rel="noopener noreferrer">Cloudflare</a> · <a href="https://github.com/redpanda-data/redpanda/pull/14759" target="_blank" rel="noopener noreferrer">Redpanda</a> · <a href="https://github.com/risingwavelabs/risingwave/pull/16208" target="_blank" rel="noopener noreferrer">RisingWave</a> · <a href="https://github.com/matrixorigin/matrixone/blob/main/pkg/fileservice/fifocache/fifo.go" target="_blank" rel="noopener noreferrer">MatrixOne</a> · <a href="https://github.com/dmlc/dgl/pull/7492" target="_blank" rel="noopener noreferrer">DGL</a> · <a href="https://github.com/ua-parser/uap-python/pull/197" target="_blank" rel="noopener noreferrer">uap-python</a></div>
    <div class="eyebrow blue" style="margin-top:0.5rem">Libraries</div>
    <div class="secondary">Rust (<a href="https://github.com/foyer-rs/foyer" target="_blank" rel="noopener noreferrer">foyer</a>, <a href="https://github.com/arthurprs/quick-cache" target="_blank" rel="noopener noreferrer">quick-cache</a>, <a href="https://github.com/surrealdb/surrealkv" target="_blank" rel="noopener noreferrer">surrealkv</a>) · Go (<a href="https://github.com/maypok86/otter" target="_blank" rel="noopener noreferrer">otter</a>, <a href="https://github.com/scalalang2/golang-fifo" target="_blank" rel="noopener noreferrer">golang-fifo</a>) · JS (<a href="https://github.com/falsandtru/spica" target="_blank" rel="noopener noreferrer">spica</a>) · Python (<a href="https://github.com/cmcaine/s3fifo.py" target="_blank" rel="noopener noreferrer">s3fifo.py</a>) · C++ (<a href="https://github.com/thelamon/s3fifo_cpp" target="_blank" rel="noopener noreferrer">s3fifo_cpp</a>) · Java (<a href="https://github.com/malets12/s3fifo" target="_blank" rel="noopener noreferrer">s3fifo</a>) · <a href="https://github.com/Jeevananthan-23/ziglang-caches" target="_blank" rel="noopener noreferrer">Zig</a></div>
    <div class="eyebrow" style="margin-top:0.5rem">Shipped in Pelikan</div>
    <div class="secondary"><span class="accent">cache-rs</span> ships it as <a href="https://github.com/pelikan-io/cache-rs/blob/main/docs/s3fifo.md" target="_blank" rel="noopener noreferrer">S3-Segcache</a></div>
    <div class="eyebrow" style="margin-top:0.5rem">Beyond code</div>
    <div class="secondary">Taught at UIUC CS525 · featured in systems reading groups</div>
  </div>
  <div class="card">
    <div class="head">
      <span class="name"><a href="https://cachemon.github.io/SIEVE-website/" target="_blank" rel="noopener noreferrer">SIEVE</a></span>
    </div>
    <div class="eyebrow">In production</div>
    <div class="secondary"><a href="https://github.com/pingcap/tidb/blob/master/pkg/infoschema/sieve.go" target="_blank" rel="noopener noreferrer">TiDB</a> · <a href="https://github.com/dragonflydb/dragonfly" target="_blank" rel="noopener noreferrer">DragonFly</a> · <a href="https://github.com/codenotary/immudb/pull/1971" target="_blank" rel="noopener noreferrer">immudb</a> · <a href="https://github.com/pelikan-io/pelikan" target="_blank" rel="noopener noreferrer">Pelikan</a> · <a href="https://docs.postgrest.org/en/latest/references/auth.html#jwt-cache" target="_blank" rel="noopener noreferrer">PostgREST</a> · <a href="https://github.com/DNSCrypt/dnscrypt-proxy/blob/master/dnscrypt-proxy/plugin_cache.go" target="_blank" rel="noopener noreferrer">dnscrypt-proxy</a> · <a href="https://github.com/skift-org/skift/blob/main/src/libs/karm-base/sieve.h" target="_blank" rel="noopener noreferrer">SkiftOS</a> · <a href="https://github.com/nyrkio/nyrkio/blob/main/backend/core/sieve.py" target="_blank" rel="noopener noreferrer">Nyrkiö</a> · <a href="https://github.com/DNSCrypt/encrypted-dns-server/blob/master/src/cache.rs" target="_blank" rel="noopener noreferrer">encrypted-dns-resolver</a></div>
    <div class="eyebrow blue" style="margin-top:0.5rem">Libraries — 20+ across languages</div>
    <div class="secondary">Go (<a href="https://github.com/scalalang2/golang-fifo" target="_blank" rel="noopener noreferrer">golang-fifo</a>, <a href="https://pkg.go.dev/github.com/opencoff/go-sieve" target="_blank" rel="noopener noreferrer">go-sieve</a>, <a href="https://github.com/samber/hot" target="_blank" rel="noopener noreferrer">samber/hot</a>) · Rust (<a href="https://crates.io/crates/sieve-cache" target="_blank" rel="noopener noreferrer">rust-sieve-cache</a>) · JS (<a href="https://github.com/kurtextrem/js-sieve" target="_blank" rel="noopener noreferrer">js-sieve</a>) · Java (<a href="https://github.com/linux-china/sieve-cache" target="_blank" rel="noopener noreferrer">sieve-cache</a>) · Ruby (<a href="https://github.com/thelibrarian/sieve_cache" target="_blank" rel="noopener noreferrer">sieve_cache</a>) · C# (<a href="https://github.com/patriksima/SieveCache" target="_blank" rel="noopener noreferrer">SieveCache</a>) · Swift (<a href="https://github.com/nixberg/sieve-swift" target="_blank" rel="noopener noreferrer">sieve</a>) · Elixir (<a href="https://github.com/alanwang67/sieve" target="_blank" rel="noopener noreferrer">sieve</a>) · C++ (<a href="https://github.com/kassane/sieve-cache-cpp" target="_blank" rel="noopener noreferrer">sieve-cache-cpp</a>) · <a href="https://github.com/tensorush/zig-sieve" target="_blank" rel="noopener noreferrer">Zig</a></div>
    <div class="eyebrow" style="margin-top:0.5rem">In the press</div>
    <div class="secondary"><a href="https://www.livescience.com/technology/communications/remarkable-sieve-algorithm-speed-up-web-browsing-google-meta-interested" target="_blank" rel="noopener noreferrer">Live Science</a> · <a href="https://brooker.co.za/blog/2023/12/15/sieve.html" target="_blank" rel="noopener noreferrer">Marc Brooker</a> · <a href="https://www.techexplorist.com/revolutionizing-web-caching-simple-method-speed-cache-sifting/80899/" target="_blank" rel="noopener noreferrer">Tech Explorist</a> · <a href="https://tldr.tech/tech/2024-01-04" target="_blank" rel="noopener noreferrer">TL;DR</a></div>
  </div>
</div>

---

# My belief

<div class="cards c3 beliefs">
  <div class="card">data is king</div>
  <div class="card">academia &amp; industry collaboration</div>
  <div class="card">a repeatable process</div>
</div>

<style>
.beliefs { max-width: 90%; gap: 2rem; margin-top: 6rem; align-items: stretch; }
.beliefs > .card {
  border: 1px solid var(--orange);
  border-radius: 10px;
  padding: 1.8rem 1.4rem;
  text-align: center;
  font-size: 1.45rem;
  font-weight: 600;
  color: var(--ink);
  line-height: 1.35;
  display: flex; align-items: center; justify-content: center;
}
</style>

---

# Appendix: GL-Cache

  <div class="card">
    <div class="head">
    <div style="display:flex; align-items:center; gap:0.55rem;"><span class="label label--accent">FAST '23</span><span class="name">GL-Cache</span></div>
    <div class="links" style="margin-top:0; margin-left:1.25rem">
      <a class="pill" href="https://www.usenix.org/conference/fast23/presentation/yang-juncheng" target="_blank" rel="noopener noreferrer">paper ↗</a>
      <a class="pill" href="https://github.com/Thesys-lab/fast23-GLCache" target="_blank" rel="noopener noreferrer">source ↗</a>
    </div>
  </div>
    <div class="eyebrow">Key takeaway</div>
    <div class="takeaway">Cache behavior is more distinct <span class="accent">in aggregate</span>.</div>
    <div class="eyebrow blue" style="margin-top:0.45rem">Also matters</div>
    <div class="secondary">the overhead of learning must stay low</div>

  </div>

<div style="text-align:center; margin-top:3rem">
  <Img src="gl-cache.png" alt="GL-Cache architecture" style="width:78%; object-fit:contain; display:block; margin:0 auto;" />
</div>

---

# Appendix: Cache lineage

<div style="text-align:center; margin-top:0.4rem">
  <Img src="cache_lineage.svg" alt="Cache lineage" style="display:block; height:52vh; margin:0 auto; object-fit:contain;" />
</div>
