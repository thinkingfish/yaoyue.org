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

<!--
Today I'm going to talk about a batch of research done back when I was still at Twitter. I wasn't the primary author — that's someone who's now a professor at Harvard; back then a PhD student at CMU, an intern at Twitter twice, and a research-fellowship recipient at Meta. So I'm summarizing someone's 300-page PhD thesis in about 30 minutes — any omissions or biases are purely mine.

This is *datacenter* caching — a small slice of the general scheme of caching, a very universal and useful concept in systems.
-->

---

<div class="divider">
  <div class="kicker">Part One</div>
  <h1>The Landscape</h1>
</div>

<!--
First, the lay of the land — caching is so broad, let's define a little more specifically what we're talking about today.
-->

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

<!--
Cache as a research discipline is almost as old as computers. The memory hierarchy was described around the original ENIAC; the practice of putting something faster in a smaller, closer store (versus a bigger, slower remote one) came in the '60s; and "cache" as a term was first used in the IBM System/360. By any measure, it's been more than 50 years of research.

The natural assumption: after half a century, the low-hanging fruit is gone, and everything left is increasingly specific and complicated. A big reason I give this talk is to show that's *not* the case — there are still delightful surprises about simple, good systems to be built.
-->

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

<!--
Fast-forward one more decade — this is mostly my background. I spent the 2010s at Twitter, mostly working on cache in some form.

That tenure started with a lot of cache incidents. My coworker Dan Luu and I wrote up the twelve sev-0 and sev-1 incidents — good material on how cache systems get screwed up. What got hammered into me: obsession with tail latency, obsession with scalability, and particular care for observability — the things you need to solve or prevent incidents.

One piece that ties into the research: we built a little observability module, **klog**. It records requests as they come in, drops the payload (privacy, and useless for research), and done right it runs at line rate — so logging every request isn't a problem in production. That's the foundation of the data.

The second enabler: I grew unsatisfied with the status quo — memcached and Redis. Wonderful projects, but why two projects for what's fundamentally one thing: a very fast RPC server with key-value storage on top? So we built a modular design (**Pelikan**) that decouples the RPC server from the storage, giving room to innovate on both sides — and, crucially, an easy path to plug new cache systems into production instead of waiting on upstream. That path is what later gave us a reason to chase better cache designs.

Context: at a company, writing papers is low priority. klog was ~2012–13, Pelikan open-sourced ~2015–16 — but it'd be almost another five years before the research started.
-->

---

<div class="divider">
  <div class="kicker">Part Two</div>
  <h1>An arc for cache research:<br /> Who, When, and What</h1>
</div>

<!--
Now the arc — a bunch of closely related research, and I'll tell you why.
-->

---

# Who

<div style="display:flex; justify-content:center; align-items:flex-start; gap:16rem; margin-top:0rem;">
  <div style="text-align:center;">
    <Img src="JunchengYang.jpg" alt="Juncheng Yang" style="height:220px; object-fit:contain;" />
    <div class="mono" style="margin-top:0.3rem; color:var(--ink-2); font-size:0.8rem;"><a href="https://jasony.me/" target="_blank" rel="noopener noreferrer">Juncheng Yang</a> <a href="https://doi.org/10.1184/R1/28500515" target="_blank" rel="noopener noreferrer">[thesis]</a></div>
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

<!--
I'm just here to summarize; I didn't do most of the work — the students did. Juncheng and Yazhuo were the two PhD students. (And no, you don't need to look Chinese to work with me — that's purely Ymir's fault: Ymir was their advisor at Emory.) Ymir and I go way back — before I dropped out of Cornell, he was in the next office. K.V. Rashmi is Juncheng's proper advisor, so she provided a lot of help I couldn't see. Keep in mind who did the work; yours truly is just here to convey the message.
-->

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

<!--
This piece was my idea — as soon as I had klog, I wanted all the data recorded and shared with people who could do something with it. I'd been reading OSDI/NSDI/SOSP papers looking for things to apply, and it was hard: people kept making different assumptions from what I saw the system needing. So I wanted Twitter's data out there, so people would build systems that work for Twitter-like traffic — making it more likely I'd benefit.

First there has to be data, and it has to be out. That's what this work is — mostly the labor of collecting it: a lot of politicking and careful ops to pull from 200+ clusters without anyone complaining, then cleaning, privacy preservation, anonymizing. It's by far the largest collection of unfiltered cache traces to this day: 14 TB uncompressed, ~2 TB compressed — unique keys, operation types, timestamps — so replaying the trace faithfully recreates Twitter's production traffic.

It turned out extremely useful. Even before publication, Juncheng predicted it'd be one of the most cited cache papers within a decade — we're now at ~475 on Google Scholar. Not a transformer paper, but for a systems paper, not bad.
-->

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

<!--
One of the first things we noticed: how short-lived everything is. Traces carry a **TTL**, typically minutes to a couple of weeks, almost never longer. And the TTL often isn't a great heuristic about usefulness — it's set to bound staleness ("it'll refresh within an hour"), or for compliance (GDPR: point at the TTL and the data's gone). So TTLs are almost always set, for reasons often unrelated to cache effectiveness — which makes TTL one of the strongest design heuristics available. Yet historical research never treated it as first-class (CDNs being maybe the one exception).

**Segcache** was the first design to take TTL seriously: it groups objects *by TTL* (rather than by size, like memcached), because TTL strongly affects reuse distance. It inherits memcached's slab style — many key-values in one fixed-sized unit — since fixed-sized allocation is far easier than tracking variable-sized objects, and it enables nice bulk operations. Key decisions: TTL-indexed groups, packed into fixed-sized segments (which also fit SSD well, since you don't overwrite). On lookup, a bucketed hash table with multiple continuous slots per bucket cuts random reads.

Result: matches state-of-the-art hit rate (slightly better, thanks to TTL), but way more scalable than memcached, with high throughput and low tail latency. Takeaway: TTL is very important and historically overlooked.
-->

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

<!--
Then Juncheng started thinking more meta. He was surprised we were using random eviction plus FIFO — random literally meaning, out of memory, pick a random slab/segment and evict it, hot or not; the slightly-better version evicts by allocation time (FIFO). There's no reason such simple, almost-stupid algorithms should work well — yet they were at least acceptable, and FIFO was actually quite good against the traces, sometimes beating the fancy algorithms. Counter-intuitive and fascinating — so he went to understand *why*, and got more data. After our release (and, I think, some nudging that got Meta to release real traces too), the trace count grew from hundreds to thousands.

Across thousands of workloads — characterized by Zipfian skew, read/write ratio, object size, reuse distance — the conclusion: modern workloads have a very short shelf life (lots of one-hit wonders), and throughput is very high. With highly skewed read/write ratios, traditional algorithms that touch every key on read are actually harmful: memory pressure is linear in writes, but reads are far more frequent and don't necessarily create eviction pressure — a misalignment between workload and mechanism.

The hot take: recognize these high-level workload properties, and you can use extremely simple structures like FIFO — as long as you get two properties, **lazy promotion** and **quick demotion**.

Lazy promotion: act on data as close to when you *must* as possible. A full cache with a new item forces a choice; defer data operations to that forced moment. This mostly optimizes the non-ratio attributes — throughput and latency — which we actually care about in production.

Quick demotion: modern workloads are extremely skewed. Anecdote: for one important Twitter cache, ~60% of hits came from provisioning at about 1% of the size we settled on. So if we cheaply identify and reject the long tail (one-hit wonders), we free lots of space for the constant stream of new data — most of which is one-hit wonders, a small slice of which becomes hot. Quick demotion keeps capacity ready for the potentially-hot new data.
-->

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

<!--
If FIFO is all we need, then: how do I put FIFOs together to get quick demotion and lazy promotion? That's **S3-FIFO** — three FIFO queues, and also Simple, Scalable, Static.

The shape is old — it looks almost like **2Q** (a small queue plus a main queue). The difference: 2Q still assumed LRU is what you want for popular objects and used the first queue mainly for scan resistance; we say FIFO is all you need, so we replace the LRU. We also add a **ghost queue** — a queue that tracks only keys, not payloads — to measure *regret* ("I should have admitted that key").

Everything enters the small FIFO (unvetted, lots of one-hit wonders). Get at least one hit → earn promotion to the main queue; otherwise evict, and drop the key into the ghost queue. If a ghost-queue key comes back, it's promoted straight to the main FIFO — treated as something we've seen, not a new key.

Evaluated against our data and everything else we could get, it pretty much outperforms everything, holistically — and it's ~50 lines of code.
-->

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

<!--
We're not done. FIFO is all you need for a web cache — but there are still times an LRU-style queue makes sense, and you can make *that* better at handling modern one-hit wonders too.

Same principles (lazy promotion, quick demotion), but in an LRU-like structure. A hand moves to the next object whenever it's time to evict. A hit on an existing key sets/clamps a bit — marking it hot (orange) vs cold. When a new object needs space, you only evict *cold* objects; keep scanning past hot ones, turning hot into cold as you go — recency at play. Meanwhile, revisited keys go hot again, so it's a race between the hand and the accesses. More traffic → the hand moves faster → a smaller window to warm up keys. That's how it balances eviction against new work.

~10 lines of code — even less than S3-FIFO, since it's really one queue. You do need to remove from the middle, so it's a linked-list-style queue rather than FIFO's laid-out memory; use it when you don't need to control memory layout. It's an LRU algorithm, but better than traditional LRU for modern data.

That's the lineage: we had data, designed a new cache/storage system, then produced at least two very simple but effective eviction algorithms for different scenarios.
-->

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

<!--
Ten years ago I complained that people over-indexed on miss ratio and ignored the other systems aspects — but the algorithm has to live in a system to be useful. Working with researchers, I made sure they cared about what I cared about; a lot of these principles were used to reject early designs that optimized hit/miss ratio but violated other constraints.

First group: handle load — efficient resource use (mostly CPU), high throughput, low latency, and scalability (more cores → more work, not bottlenecked on a universal lock). Second: memory overhead — high overhead means fewer objects for the same resources, not necessarily a win even if per-object hit rate is higher; and fitting onto SSD (≈10x storage) buys much more capacity, often a net win even if worse at equal size. Third — the most overlooked, even held against you ("what's the novelty?"): simplicity (understandable in 30 seconds), generality (don't need a different design per scenario), and, failing that, configurability.

So: a two-part loop — brilliant researchers propose designs; I go down the list and ask how many boxes they violate. More than one or two is usually a no-go. Frustrating, but as the poets say, constraints are liberating: short-circuit the bad designs early and you eventually find a gem. But the constraints have to be *real* — which is why we need data. Improving real systems is always multi-constraint, multi-objective; optimizing for just one or two things means you're probably missing something.
-->

---

<div class="divider">
  <div class="kicker">Part Three</div>
  <h1>The Takeaway</h1>
</div>

<!--
Now, some takeaways.
-->

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

<!--
This research ran ~2019 through ~2023–2024 — call it five years. The direction: start from data, start from a somewhat complicated design, then reduce — strip everything non-essential — toward simpler and simpler designs.

Something people rarely ask: if your job is to publish and graduate in three years, what happens to the paper afterward barely matters (same for engineers who launch, get promoted, and don't own the later incidents). But if you *do* care — if the point is adoption, and staying online — you need two things, equally: **better** (a reason to act) and **simpler** (fewer reasons to say no).

The stuff listed here got attention and adoption because people could understand it. You *don't* see Segcache on the list — it's much more complicated, so very few would implement it fully. There's a big gap between a simple design and a badly-done complex one — and honestly, I wouldn't trust complex implementations out of academia anyway. A simple idea (even with limitations) spreads, because people can understand and adapt it. Case in point: S3-FIFO became one way to build Segcache (a small queue + a large queue) — not exactly S3-FIFO, but an easy adaptation.
-->

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

<!--
The other thing I hope everyone here gets to do, whatever your role: a run like ours. In industry, you probably have precious data that could steer students away from wasting two years building complex solutions on wrong assumptions — a tragic waste of intelligence. So get the data out, so people can ground and validate their thinking every step.

Conversely, bringing in academics is how we got all these designs — I'd never have the time or capability to produce them alone. There's a real opportunity for academia–industry collaboration, and you see it in AI systems: the scale is now so large that academia can't even build a toy setup alone — they're flying blind without an industry partner. A lot of the best recent papers came out of China, where this pattern is popular — look at Mooncake's author list: half university, half company, some both. It works, and there's no reason not to try (well, you may need to convince someone up your chain — not my problem to solve).

I think it's a repeatable process. I've seen enough poster sessions to know people are doing wonderful work on the wrong assumptions. Correct that, and they'll do wonderful work on the right ones. Lots of opportunities.
-->

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
