---
theme: default
title: "In Craft We Trust: How do we ship critical services as we stop writing code"
info: |
  In Craft We Trust — how do we ship critical services as we stop writing code
layout: default
class: text-center
highlighter: shiki
transition: slide-left
mdc: true
# site favicon; root-absolute is fine here (injected as a <link>, not a Vite import)
favicon: /favicons/favicon.ico
fonts:
  sans: IBM Plex Sans
  mono: IBM Plex Mono
  weights: '300,400,500,600,700'
---

<div class="bg-fade"><Img src="coral_polyps_closeup.jpg" alt="" /></div>
<div class="title-slide">
  <h1>In Craft We Trust</h1>
  <div class="phase" style="margin-top:1.6rem; font-weight:400;">Shipping critical services as we stop writing code</div>
  <p class="byline mono">Yao Yue</p>
</div>

<!-- Design system lives in styles/index.css (global). Edit there, not here. -->

<!--
While I do not have agentic coding all figured out, I have spent many hundreds of hours finding my way in this new world through work and play. I'm here to share what I've learned so far — in particular, about doing serious work on mission-critical software as professionals.
-->

---

<div class="divider">
  <div class="q">She will always carry on<br />Something is lost,<br />something is found</div>
  <div class="mono" style="margin-top:1.6rem; color:var(--ink-2); font-size:0.8rem;">— Hymn to Her</div>
</div>

<!--
Something is lost. But something is found. That's the shape of this whole talk.
-->

---

<div class="bg-bands"><Img src="maug-top.jpg" class="top" alt="" /><Img src="maug-bottom.jpg" class="bottom" alt="" /></div>
<div class="divider">
  <div class="kicker">Chapter One</div>
  <h1>Are we losing programming?</h1>
</div>

---

# A confession/concession from a lifer

<div class="statement">Coding is dead.<br />Long live coding!</div>

<!--
I started coding seriously at 12 and dedicated much of my teenage years to programming contests. Being a programmer has been as much of my identity as anything else. I hope these facts give me some credibility when I make this claim: the act of writing source code as a career is rapidly disappearing, despite software being created at unprecedented pace. But! Software engineering is still very much alive even when someone else writes 100% of the code. And you still need to be good at it as a software engineer. But what that means is different now.
-->

---

<div class="bg-bands"><Img src="maug-top.jpg" class="top" alt="" /><Img src="maug-bottom.jpg" class="bottom" alt="" /></div>
<div class="divider">
  <div class="kicker">Chapter Two</div>
  <h1>What's happening to<br /><em>software engineering</em>?</h1>
</div>

<!--
So what *is* software engineering? Let me unwind a little bit, tell you another part of my background, and turn the clock forward by roughly a decade from my teenage years.
-->

---

# Code that lasts: learnings from production

<div class="cards decade" style="margin-top:1.6rem">
  <div class="card" v-click>
    <div class="head"><span class="label">2010 – 2014</span><span class="phase">Forks of Memcached and Redis</span></div>
    <div class="reveal">read every line · charted the state machines · a mental model of the service</div>
  </div>
  <div class="card" v-click>
    <div class="head"><span class="label">2010 – 2020</span><span class="phase"><a href="https://danluu.com/cache-incidents/" target="_blank" rel="noopener noreferrer" class="inherit">A Decade of Cache Incidents</a></span></div>
    <div class="reveal">tail latency · scalability · observability</div>
  </div>
  <div class="card" v-click>
    <div class="head"><span class="label">2015 –</span><span class="phase"><a href="https://pelikan.io/" target="_blank" rel="noopener noreferrer" class="inherit">Creation of Pelikan</a></span></div>
    <div class="reveal">from patterns to a framework desigend with first principles</div>
  </div>
</div>

<div v-click>
  <div class="eyebrow section">Key takeaway</div>
  <div class="takeaway">Code that <span class="accent">lasts</span> is a different discipline from code that proves an idea.</div>
</div>

<style>
.decade .slidev-vclick-target { transition: opacity .45s ease, transform .45s ease; }
.decade .slidev-vclick-hidden { transform: translateY(1.4rem); }
</style>

<!--
About 15 years ago, I got my first real job at Twitter and was thrust into distributed caching. It became abundantly clear that writing code that lasts was very different from writing code mostly to prove an idea. Cache was critical in every sense of the word — most of the site's traffic flowed through it, and it was causing incidents left and right. Since I had never been responsible for a load-bearing production system before (first job!), I took it very seriously and quite nervously. I read the entire code base of Memcached, almost line by line — it took over a month. I drew charts of the connection and request state machines because the logic confused me. I took many notes. I read the source of some dependencies. All of that built a mental model of the service — its threading model, architecture, storage data structures, shape of the parser. It also gave me a good idea of the coding style.
-->

---

# Structures, Properties, and Constraints

<div style="display:flex; gap:2.2rem; align-items:flex-start; margin-top:0.6rem;">
  <div style="flex:0 0 52%;">
    <Img src="pelikan-arch.svg" alt="Pelikan architecture: services, cache libraries, RPC libraries" style="width:100%; object-fit:contain;" />
    <div class="mono" style="margin-top:0.4rem; color:var(--ink-2); font-size:0.7rem; text-align:center;">50k lines · one chart</div>
  </div>
  <div style="flex:1;">
    <div class="cards" style="margin-top:0.4rem; gap:1rem;">
      <div class="card" v-click>
        <div class="head"><span class="label label--accent">structures</span></div>
        <div class="takeaway">A very fast RPC server + key-value storage</div>
      </div>
      <div class="card" v-click>
        <div class="head"><span class="label label--accent">properties</span></div>
        <div class="takeaway">predictability · scalability · observability · simplicity · configurability</div>
      </div>
      <div class="card" v-click>
        <div class="head"><span class="label label--accent">constraints</span></div>
        <div class="takeaway">concurrency · R/W ratio · skewness · size</div>
        <div class="takeaway">core counts · memory type</div>
      </div>
    </div>
  </div>
</div>

<!--
For the next few years I kept going back to that understanding — to make architectural changes, rewire a prevailing building block, add features, debug incidents. A year or two later I did very similar things with Redis. That's when I started seeing patterns through comparison, and wondering why they differed in some places and matched in others, and whether those similarities or divergences were warranted. After pondering it for a few years, with some forks along the way, I decided I could design an encompassing framework from first principles by applying the lessons I'd learned. That result was the Pelikan Project. I gave a series of talks on the design principles and coding architecture of a service shaped like cache — from RPC server to storage, from configuration macros to metric library. You can summarize a 50k-line code base in one sentence, and its building blocks in a chart that fits comfortably on this slide. And the devil is all in the details.

The difference between users and creators is that users largely care about what something can do, and creators care about how those features are built. So what separates a professional software engineer from someone who runs and occasionally produces code is largely in the parts that aren't externally visible.
-->

---

# <a href="https://github.com/pelikan-io/grow-a-cache" target="_blank" rel="noopener noreferrer" class="inherit">grow-a-cache</a>

<div class="card" style="margin-top:0.8rem">
  <div class="head">
    <div style="display:flex; align-items:center; gap:0.55rem;"><span class="label label--accent">Dec 2025</span><span class="name">Vibe-coding a cache server</span></div>
  </div>
  <ul>
    <li>a domain I can confidently judge, so I could focus on the <em>process</em></li>
    <li>incremental: follow the natural trajectory — POC → MVP → onward</li>
    <li>non-prescriptive: led by constraints, proven by tests </li>
    <li>stopped after 4 milestones</li>
  </ul>
</div>

<div v-click>
  <div class="eyebrow" style="margin-top:2.4rem">Key takeaway</div>
  <div class="takeaway">Using LLMs to write "serious software" is definitely <span class="accent">feasible</span> — but it is not <span class="accent">automatic</span>.</div>
</div>

<!-- TODO: <Img src="grow-a-cache-milestones.png" /> — milestone chart / repo screenshot -->

<!--
Fast forward to last December — like half of our industry, I decided to take a second, more serious look at LLMs for coding. One of my projects (yes, I did several over the holidays) was called "grow-a-cache": recreate Pelikan from scratch by just prompting LLMs. But instead of one-shotting it, I followed the more natural software development trajectory from POC to MVP and onward. I chose this topic because I felt confident judging the outcome, so I could focus on the process. After 4 milestones, I stopped. Why? Because I was more or less convinced that using LLMs to write "serious software" was very much feasible — but not automatic. And it became clear that what I should do as a software engineer has to change.
-->

---

# A Pelikan reboot

<div class="cards reboot5" style="margin-top:1.2rem">
  <div class="card" @click="$nav.go($page, 1)" role="button" tabindex="0">
    <span class="label">runtime</span>
    <div class="name"><a href="https://github.com/pelikan-io/pelikan/pull/187" target="_blank" rel="noopener noreferrer" class="inherit">pelikan #187</a></div>
    <div class="secondary">io_uring runtime</div>
    <div class="active" v-click="[1,2]"></div>
  </div>
  <div class="card" @click="$nav.go($page, 2)" role="button" tabindex="0">
    <span class="label">storage</span>
    <div class="name"><a href="https://github.com/pelikan-io/pelikan/pull/189" target="_blank" rel="noopener noreferrer" class="inherit">pelikan #189</a></div>
    <div class="secondary">scaling segcache read</div>
    <div class="active" v-click="[2,3]"></div>
  </div>
  <div class="card" @click="$nav.go($page, 3)" role="button" tabindex="0">
    <span class="label">eviction</span>
    <div class="name"><a href="https://github.com/pelikan-io/cache-rs/pull/2" target="_blank" rel="noopener noreferrer" class="inherit">cache-rs #2</a></div>
    <div class="secondary">use S3-FIFO in segcache</div>
    <div class="active" v-click="[3,4]"></div>
  </div>
  <div class="card" @click="$nav.go($page, 4)" role="button" tabindex="0">
    <span class="label">protocol</span>
    <div class="name"><a href="https://github.com/pelikan-io/cache-rs/pull/45" target="_blank" rel="noopener noreferrer" class="inherit">cache-rs #45</a></div>
    <div class="secondary">data types on segcache</div>
    <div class="active" v-click="[4,5]"></div>
  </div>
  <div class="card" @click="$nav.go($page, 5)" role="button" tabindex="0">
    <span class="label">evaluation</span>
    <div class="name"><a href="https://github.com/pelikan-io/cachesim" target="_blank" rel="noopener noreferrer" class="inherit">cachesim</a></div>
    <div class="secondary">cache trace replay</div>
    <div class="active" v-click="5"></div>
  </div>
</div>

<div class="reboot-stage">
  <div class="stage" v-click="[1,2]">
    <Img src="threading-pr187.svg" alt="Pelikan threading model after runtime modernization (PR 187)" />
  </div>
  <div class="stage" v-click="[2,3]">
    <div class="chart" style="width:76%;">
<svg viewBox="0 0 820 330" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Read throughput, 0% writes: uniform keys rise from 2.7 to 21.8 Mops/s from 1 to 8 cores, near-linear; Zipf 0.99 keys from 1.9 to 11.9 Mops/s, 6.2x">
<line x1="56" x2="670" y1="284.0" y2="284.0" stroke="#E6E4D9" stroke-width="1"/>
<text x="46" y="288.0" text-anchor="end" class="tick" fill="#878580">0</text>
<line x1="56" x2="670" y1="217.0" y2="217.0" stroke="#E6E4D9" stroke-width="1"/>
<text x="46" y="221.0" text-anchor="end" class="tick" fill="#878580">6</text>
<line x1="56" x2="670" y1="150.0" y2="150.0" stroke="#E6E4D9" stroke-width="1"/>
<text x="46" y="154.0" text-anchor="end" class="tick" fill="#878580">12</text>
<line x1="56" x2="670" y1="83.0" y2="83.0" stroke="#E6E4D9" stroke-width="1"/>
<text x="46" y="87.0" text-anchor="end" class="tick" fill="#878580">18</text>
<line x1="56" x2="670" y1="16.0" y2="16.0" stroke="#E6E4D9" stroke-width="1"/>
<text x="46" y="20.0" text-anchor="end" class="tick" fill="#878580">24</text>
<text x="56.0" y="302" text-anchor="middle" class="tick" fill="#878580">1</text>
<text x="143.7" y="302" text-anchor="middle" class="tick" fill="#878580">2</text>
<text x="319.1" y="302" text-anchor="middle" class="tick" fill="#878580">4</text>
<text x="494.6" y="302" text-anchor="middle" class="tick" fill="#878580">6</text>
<text x="670.0" y="302" text-anchor="middle" class="tick" fill="#878580">8</text>
<text x="363" y="324" text-anchor="middle" class="axis" fill="#878580">CORES</text>
<text transform="translate(14 150) rotate(-90)" text-anchor="middle" class="axis" fill="#878580">MOPS/S</text>
<path d="M56.0,254.4 L143.7,223.3 L319.1,161.0 L494.6,100.0 L670.0,40.7" fill="none" stroke="#4385BE" stroke-width="2" stroke-linejoin="round"/>
<line x1="56.0" x2="56.0" y1="254.8" y2="254.1" stroke="#4385BE" stroke-width="1.2"/>
<circle cx="56.0" cy="254.4" r="4" fill="#4385BE" stroke="#FFFCF0" stroke-width="2"/>
<line x1="143.7" x2="143.7" y1="224.0" y2="222.1" stroke="#4385BE" stroke-width="1.2"/>
<circle cx="143.7" cy="223.3" r="4" fill="#4385BE" stroke="#FFFCF0" stroke-width="2"/>
<line x1="319.1" x2="319.1" y1="161.9" y2="160.6" stroke="#4385BE" stroke-width="1.2"/>
<circle cx="319.1" cy="161.0" r="4" fill="#4385BE" stroke="#FFFCF0" stroke-width="2"/>
<line x1="494.6" x2="494.6" y1="100.1" y2="99.9" stroke="#4385BE" stroke-width="1.2"/>
<circle cx="494.6" cy="100.0" r="4" fill="#4385BE" stroke="#FFFCF0" stroke-width="2"/>
<line x1="670.0" x2="670.0" y1="41.0" y2="39.3" stroke="#4385BE" stroke-width="1.2"/>
<circle cx="670.0" cy="40.7" r="4" fill="#4385BE" stroke="#FFFCF0" stroke-width="2"/>
<text x="682.0" y="42.7" class="dl" fill="#100F0F">uniform <tspan class="mono" fill="#6F6E69">21.8 · 8.2×</tspan></text>
<path d="M56.0,262.5 L143.7,242.6 L319.1,207.4 L494.6,177.5 L670.0,150.8" fill="none" stroke="#4385BE" stroke-width="2" stroke-linejoin="round" stroke-dasharray="6 4"/>
<line x1="56.0" x2="56.0" y1="262.9" y2="262.4" stroke="#4385BE" stroke-width="1.2"/>
<circle cx="56.0" cy="262.5" r="4" fill="#4385BE" stroke="#FFFCF0" stroke-width="2"/>
<line x1="143.7" x2="143.7" y1="244.1" y2="242.5" stroke="#4385BE" stroke-width="1.2"/>
<circle cx="143.7" cy="242.6" r="4" fill="#4385BE" stroke="#FFFCF0" stroke-width="2"/>
<line x1="319.1" x2="319.1" y1="207.9" y2="207.0" stroke="#4385BE" stroke-width="1.2"/>
<circle cx="319.1" cy="207.4" r="4" fill="#4385BE" stroke="#FFFCF0" stroke-width="2"/>
<line x1="494.6" x2="494.6" y1="178.0" y2="176.9" stroke="#4385BE" stroke-width="1.2"/>
<circle cx="494.6" cy="177.5" r="4" fill="#4385BE" stroke="#FFFCF0" stroke-width="2"/>
<line x1="670.0" x2="670.0" y1="161.8" y2="149.5" stroke="#4385BE" stroke-width="1.2"/>
<circle cx="670.0" cy="150.8" r="4" fill="#4385BE" stroke="#FFFCF0" stroke-width="2"/>
<text x="682.0" y="158.8" class="dl" fill="#100F0F">zipf 0.99 <tspan class="mono" fill="#6F6E69">11.9 · 6.2×</tspan></text>
</svg>
    <div class="legend" style="justify-content:center;"><span><i style="background:#4385BE"></i>uniform keys</span><span><i style="background:repeating-linear-gradient(90deg,#4385BE 0 5px,transparent 5px 8px)"></i>zipf 0.99</span><span class="dim">read-only · 0% writes · median of 3, whiskers min–max</span></div>
    </div>
  </div>
  <div class="stage" v-click="[3,4]">
    <Img src="eviction-s3fifo.svg" alt="S3-FIFO eviction in Segcache: small, main, and ghost FIFO queues" />
  </div>
  <div class="stage" v-click="[4,5]">
    <Img src="ziplist-block.svg" alt="Byte-by-byte anatomy of a 27-byte ziplist hash block: 12-byte header followed by four entries" />
  </div>
  <div class="stage" v-click="5">
    <Img src="cachesim-card.svg" alt="cachesim capabilities overview: convert traces to Parquet, simulate against segcache, cuckoo, or oracle engines, report hit/miss statistics" />
  </div>
</div>


---

<div class="bg-bands"><Img src="maug-top.jpg" class="top" alt="" /><Img src="maug-bottom.jpg" class="bottom" alt="" /></div>
<div class="divider">
  <div class="kicker">Chapter Three</div>
  <h1>What separates proper<br />engineering from slop?</h1>
</div>

<!--
It's probably no exaggeration to say agentic coding is a paradigm shift triggering widespread identity crises among software professionals. But a crisis is an opportunity. It forces us to answer a fairly fundamental question: what separates software engineering from vibe coding?
-->

---

# Vibe coding ≠ Slop

<div style="display:flex; align-items:flex-start; justify-content:space-between; gap:2rem; margin-top:1.6rem;">
  <div>
    <div class="phase orange">Analogy: Writing assembly</div>
    <ul class="rlist">
      <li>most people are unskilled in it</li>
      <li>one can achieve good results at small scale nonetheless</li>
    </ul>
  </div>
  <Img src="assembly_code.png" alt="assembly code" style="max-height:7.5rem; max-width:48%; object-fit:contain; border:1px solid var(--border); border-radius:6px;" />
</div>

<div class="cols2" style="margin-top:2.6rem; max-width:100%;">
  <div v-click>
    <div class="phase orange">Where do you start?</div>
    <ul class="rlist">
      <li><strong>Outsiders</strong> start from outcome and visible features.</li>
      <li><strong>Insiders</strong> start from drivers and limitations.</li>
    </ul>
  </div>
  <div v-click>
    <div class="phase orange">When do you stop?</div>
    <ul class="rlist">
      <li><strong>Amateurs</strong> make something and hope for the best.</li>
      <li><strong>Professionals</strong> enumerate goals and measure.</li>
    </ul>
  </div>
</div>

<div class="punchline" v-click><span class="accent">Expert</span> = Insider + Professional</div>

<!--
A parallel I kept going back to: throughout my study and career I occasionally wrote assembly-like code — in network processor SDKs, CUDA, and AVX intrinsics. I expressed my thoughts in high-level languages, some higher than others, and compilers did the rest. I would never have called myself fluent in assembly; I simply never had the need. But I was not a "vibe-assembly-writer" — I was very careful about the kind of assembly I wanted, just slow at writing it by hand. While LLMs are not compilers, the cognitive offloading feels very similar: I'm allowed to keep my ideas at a higher level than previously required without the intermediary, and while the translation is neither free nor perfect, overall it's an unquestionable improvement. But delegation does not obliterate one's responsibility to understand what the software is doing or what outcome should be achieved — it just changes how you obtain receipts.
There were various points in history where people were convinced the transformative automation of the day would bring a life of leisure. Every time it didn't happen — people fill that time with other work. I don't see how this time is different. Much of the LLM hype is about putting in very little effort to get acceptable results. That emphasis is misplaced. As engineers, it seems self-evident that it's much better to put in a fair amount of effort — maybe even the same amount as before — to get much better results. Getting to an average outcome is not that hard; perfecting it takes orders of magnitude more skill and effort. We see it on all kinds of desirable properties: every extra 9 of reliability takes substantially more work, and putting a lid on tail latency is much harder than reducing the median. Amateurs make something and hope for the best. Professionals enumerate goals and measure against them, quantified whenever possible. Let's be professionals.

-->

---

<div class="bg-bands"><Img src="maug-top.jpg" class="top" alt="" /><Img src="maug-bottom.jpg" class="bottom" alt="" /></div>
<div class="divider">
  <div class="kicker">Chapter Four</div>
  <h1>Know-how and<br />the joy of understanding</h1>
</div>

<!--
How exactly do we behave as a professional?
-->

---

# The new pyramid

<div class="callout" style="margin-top:1rem">
  Software engineering is about divide-and-conquer, using abstractions to decompose problems and compose solutions.
</div>

<div class="eyebrow section">Where the time goes</div>

<div class="pyrs">
  <div class="pyr left">
    <div class="cap">before</div>
    <div class="lvl"><span class="pct">10%</span><div class="blk s1" style="--w:25%; --v:100%"><i class="mask l"></i><i class="mask r"></i></div></div>
    <div class="lvl"><span class="pct">20%</span><div class="blk s2" style="--w:50%; --v:100%"><i class="mask l"></i><i class="mask r"></i></div></div>
    <div class="lvl"><span class="pct">30%</span><div class="blk s3" style="--w:75%; --v:100%"><i class="mask l"></i><i class="mask r"></i></div></div>
    <div class="lvl"><span class="pct">40%</span><div class="blk s4" style="--w:100%; --v:100%"><i class="mask l"></i><i class="mask r"></i></div></div>
  </div>
  <div class="names">
    <div class="cap">&nbsp;</div>
    <div class="lvl">understand</div>
    <div class="lvl">design</div>
    <div class="lvl">describe</div>
    <div class="lvl">implement</div>
  </div>
  <div class="pyr right" v-click>
    <div class="cap">now</div>
    <div class="lvl"><div class="blk s1" style="--w:25%; --v:100%"><i class="mask l"></i><i class="mask r"></i></div><span class="pct">40%</span></div>
    <div class="lvl"><div class="blk s2" style="--w:50%; --v:37.5%"><i class="mask l"></i><i class="mask r"></i></div><span class="pct">30%</span></div>
    <div class="lvl"><div class="blk s3" style="--w:75%; --v:16.667%"><i class="mask l"></i><i class="mask r"></i></div><span class="pct">20%</span></div>
    <div class="lvl"><div class="blk s4" style="--w:100%; --v:6.25%"><i class="mask l"></i><i class="mask r"></i></div><span class="pct">10%</span></div>
  </div>
</div>

<div v-click>
  <div class="eyebrow section">Key takeaway</div>
  <div class="takeaway">Narrower and more common problems get more lift from LLMs than broader or bespoke ones. Remaining effort <span class="accent">moves up</span> the effort pyramid.</div>

</div>

<!--
Programming is a fairly top-down, recursive process, like constructing a tree. The defining characteristic of the software engineering trade is the extreme reliance on abstraction — "turtles all the way down". With better tools, we get to skip traversal of the bottom levels. In other words, what is known (by the models) can be done. We can cut most of the busy time by going up the abstraction tree a couple of levels.

A 10%/20%/30%/40% distribution is becoming a 40%/30%/20%/10% distribution, because we get more and more help as the process becomes more and more deterministic.

Understanding the nature of the problem? Unchanged but with assistance. Designing a solution that matches the problem? Getting easier, but a little judgement goes a long way. Describing all the properties the solution should satisfy? Very much a collaborative process. Implementing the solution? Go ahead, I'll be here waiting — oh, and review the solution for a few rounds, run these tests, and quantify the performance before you get back to me.
-->

---

<div class="cols2 big" style="margin-top:4rem">
  <div>
    <h1 class="muted">Tired</h1>
    <ul class="rlist">
      <li>help me implement something mediocre at 10x speed</li>
    </ul>
  </div>
  <div v-click>
    <h1 class="orange">Wired</h1>
    <ul class="rlist">
      <li>help me <em>understand</em> the problem</li>
      <li>help me <em>explore</em> options</li>
      <li>help me <em>cover</em> plausible what-if scenarios</li>
    </ul>
  </div>
</div>

<div class="punchline" v-click><span class="accent">Better</span> &gt; Faster</div>

---

# Challenge 1: how do I learn without doing?

<div class="cols2" style="margin-top:1.4rem; max-width:100%;">
  <div v-click>
    <div class="phase" style="color:var(--ink);">Tactile feedback and distillation</div>
    <ul class="rlist">
      <li>latent knowledge used to come from <em>doing</em></li>
      <li>the process lets us distill and retain</li>
      <li>the frictionless trap: no struggle, no learning, no growth</li>
    </ul>
  </div>
  <div v-click>
    <div class="phase orange">Tinker and linger</div>
    <ul class="rlist">
      <li>build a mental model</li>
      <li>visualize design, decisions, and change</li>
      <li>converse about details and challenge with counterfactuals</li>
    </ul>
  </div>
</div>

<div class="punchline" v-click><span class="lead">Create an environment that encourages</span><br /><em class="accent">Structured Curiosity</em></div>

<!-- TODO: <Img src="pelikan-design-artifacts.png" /> — Pelikan design & discussion artifacts -->

<!--
There is a lot of latent knowledge we acquire through the act of doing. Research shows taking notes by hand improves retention compared to typing or not taking notes — tactile feedback seems to activate the neural pathways that build durable memory. So the trouble with delegating the entire implementation is less about the code per se and more about what the process allows us to distill and retain. This loss is at the heart of the junior engineer dilemma — without struggle there is no learning, without learning there is no growth.

But learning can be accomplished in more than one way, and it seems inevitable that we look for new ways to learn now, junior or senior. Techniques that have worked for me: create a mental model; visualize design, decisions, and change; have conversations about details and counterfactuals. Anybody can ask an LLM to do a thing — making it do it consistently is the difference between amateurs and professionals. What we can now afford to deploy, that was a luxury before, is Structured Curiosity.
-->

---

<div class="figure">
  <Img src="pelikan-architecture.svg" alt="Pelikan architecture" />
  <div class="caption"><a href="https://github.com/pelikan-io/pelikan/blob/main/docs/ARCHITECTURE.md" target="_blank" rel="noopener noreferrer" class="inherit">Pelikan architecture</a></div>
</div>

---

<div class="figure">
  <Img src="pelikan-threading.svg" alt="Pelikan threading model" />
  <div class="caption"><a href="https://github.com/pelikan-io/pelikan/blob/main/docs/ARCHITECTURE.md" target="_blank" rel="noopener noreferrer" class="inherit">threading</a></div>
</div>

---

<div class="figure">
  <Img src="pelikan-dataflow.svg" alt="Pelikan dataflow" />
  <div class="caption"><a href="https://github.com/pelikan-io/pelikan/blob/main/docs/ARCHITECTURE.md" target="_blank" rel="noopener noreferrer" class="inherit">dataflow</a></div>
</div>

---

<div class="figure">
  <Img src="hybrid-handoff.svg" alt="Hybrid handoff — read/write path divergence: reads execute in place against the shared segcache engine; writes are batch-delegated to per-shard single-writer owner threads and published via the hashtable pointer swing" />
  <div class="caption"><a href="https://claude.ai/code/artifact/b5960bf3-7454-4c7f-8a76-76bbb38b6ada" target="_blank" rel="noopener noreferrer" class="inherit">exploring asymmetric read/write access on shared segcache</a></div>
</div>

<!--
Structured curiosity, worked: one question — does the shared engine scale under writes? — turned into six experiments and then a design. Reads stay in place against the shared engine and never queue; writes are buffered, batched, and delegated to single-writer owner threads, publishing through the unchanged hashtable pointer swing. The asymmetry is the whole idea.
-->

---

# Challenge 2: how can I be oncall for vibed code?

<div class="cols2" style="margin-top:1.4rem; max-width:100%;">
  <div v-click>
    <div class="phase" style="color:var(--ink);">"Battle-tested" is baptism</div>
    <ul class="rlist">
      <li>may or may not pan out for <em>you</em></li>
      <li>an imperfect proxy for trustworthiness</li>
      <li>it's not like the status quo was awesome…</li>
    </ul>
  </div>
  <div v-click>
    <div class="phase orange">Define, declare, measure</div>
    <ul class="rlist">
      <li><strong>define</strong> KPIs, SLOs, "desirable properties"</li>
      <li><strong>declare</strong> workload characteristics</li>
      <li><strong>measure</strong> behavior under representative workloads</li>
    </ul>
  </div>
</div>

<div class="punchline" v-click><span class="lead">Create operational practices that demand</span><br /><em class="accent">Provenance</em></div>

<!--
That leaves another place that makes things uncomfortable and risky: do they work in production? It's tempting to claim that even well-engineered solutions may fall apart under the weight of reality — not "battle-tested". But I'd ask again: why? What's magical about running something in production, and is that magic so elusive it cannot be captured or described? It's the wrong question to ask whether agentic coding can match human-written code in production — we're underselling the machines and ourselves. The right goal is to ask how much better agentic coding can become relative to unassisted coding.

Define KPIs, SLOs, desirable properties. Declare workload characteristics. Measure software and changes using representative workloads, tracking KPIs, comparing against SLOs, optimizing on desired properties. Just like most Rust code that compiles runs, most code that passes CI should be production-ready — "battle-tested" was a coping mechanism. What safeguards the outcome is Well-defined Evaluation.
-->

---

<div class="figure">
  <Img src="challenge2-example.png" alt="Per-file in-memory footprint: SparseHistogram vs Histogram, measured on demo, cachecannon and vllm traces — 80.7% savings overall" />
  <div class="caption">Measuring memory savings with cumulative read-only histograms</div>
</div>

<!--
A KPI (memory footprint), declared workloads (three real traces), a measured result (80.7% saved) — receipts, not baptism.

Here's what that looks like in practice: one KPI, real workloads, one measured number. That's the receipt.
-->

---

<div class="figure">
  <div class="chart">
<svg viewBox="0 0 820 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Speedup versus one core. Read series rise close to the ideal diagonal, reaching 8.2 times at 8 cores for uniform keys and 6.2 times for Zipf. Write series stay flat near 1.0 across the whole range.">
<line x1="52" x2="650" y1="294.0" y2="294.0" stroke="#E6E4D9" stroke-width="1"/>
<text x="42" y="298.0" text-anchor="end" class="tick" fill="#878580">0×</text>
<line x1="52" x2="650" y1="229.3" y2="229.3" stroke="#E6E4D9" stroke-width="1"/>
<text x="42" y="233.3" text-anchor="end" class="tick" fill="#878580">2×</text>
<line x1="52" x2="650" y1="164.7" y2="164.7" stroke="#E6E4D9" stroke-width="1"/>
<text x="42" y="168.7" text-anchor="end" class="tick" fill="#878580">4×</text>
<line x1="52" x2="650" y1="100.0" y2="100.0" stroke="#E6E4D9" stroke-width="1"/>
<text x="42" y="104.0" text-anchor="end" class="tick" fill="#878580">6×</text>
<line x1="52" x2="650" y1="35.4" y2="35.4" stroke="#E6E4D9" stroke-width="1"/>
<text x="42" y="39.4" text-anchor="end" class="tick" fill="#878580">8×</text>
<text x="52.0" y="312" text-anchor="middle" class="tick" fill="#878580">1</text>
<text x="137.4" y="312" text-anchor="middle" class="tick" fill="#878580">2</text>
<text x="308.3" y="312" text-anchor="middle" class="tick" fill="#878580">4</text>
<text x="479.1" y="312" text-anchor="middle" class="tick" fill="#878580">6</text>
<text x="650.0" y="312" text-anchor="middle" class="tick" fill="#878580">8</text>
<text x="351" y="334" text-anchor="middle" class="axis" fill="#878580">CORES</text>
<text transform="translate(14 155) rotate(-90)" text-anchor="middle" class="axis" fill="#878580">SPEEDUP ×</text>
<line x1="52.0" y1="261.7" x2="650.0" y2="35.4" stroke="#B7B5AC" stroke-width="1.5" stroke-dasharray="5 5"/>
<text x="504.8" y="58.0" class="axis" fill="#878580">ideal</text>
<path d="M52.0,261.7 L137.4,227.7 L308.3,159.8 L479.1,92.9 L650.0,28.3" fill="none" stroke="#4385BE" stroke-width="2" stroke-linejoin="round"/>
<circle cx="52.0" cy="261.7" r="4" fill="#4385BE" stroke="#FFFCF0" stroke-width="2"/>
<circle cx="137.4" cy="227.7" r="4" fill="#4385BE" stroke="#FFFCF0" stroke-width="2"/>
<circle cx="308.3" cy="159.8" r="4" fill="#4385BE" stroke="#FFFCF0" stroke-width="2"/>
<circle cx="479.1" cy="92.9" r="4" fill="#4385BE" stroke="#FFFCF0" stroke-width="2"/>
<circle cx="650.0" cy="28.3" r="4" fill="#4385BE" stroke="#FFFCF0" stroke-width="2"/>
<text x="662.0" y="30.3" class="dl" fill="#100F0F">reads, uniform <tspan class="mono" fill="#6F6E69">8.2×</tspan></text>
<path d="M52.0,261.7 L137.4,231.9 L308.3,178.9 L479.1,134.0 L650.0,93.9" fill="none" stroke="#4385BE" stroke-width="2" stroke-linejoin="round" stroke-dasharray="6 4"/>
<circle cx="52.0" cy="261.7" r="4" fill="#4385BE" stroke="#FFFCF0" stroke-width="2"/>
<circle cx="137.4" cy="231.9" r="4" fill="#4385BE" stroke="#FFFCF0" stroke-width="2"/>
<circle cx="308.3" cy="178.9" r="4" fill="#4385BE" stroke="#FFFCF0" stroke-width="2"/>
<circle cx="479.1" cy="134.0" r="4" fill="#4385BE" stroke="#FFFCF0" stroke-width="2"/>
<circle cx="650.0" cy="93.9" r="4" fill="#4385BE" stroke="#FFFCF0" stroke-width="2"/>
<text x="662.0" y="101.9" class="dl" fill="#100F0F">reads, zipf <tspan class="mono" fill="#6F6E69">6.2×</tspan></text>
<path d="M52.0,261.7 L137.4,259.1 L308.3,256.8 L479.1,257.1 L650.0,262.6" fill="none" stroke="#DA702C" stroke-width="2" stroke-linejoin="round" stroke-dasharray="6 4"/>
<circle cx="52.0" cy="261.7" r="4" fill="#DA702C" stroke="#FFFCF0" stroke-width="2"/>
<circle cx="137.4" cy="259.1" r="4" fill="#DA702C" stroke="#FFFCF0" stroke-width="2"/>
<circle cx="308.3" cy="256.8" r="4" fill="#DA702C" stroke="#FFFCF0" stroke-width="2"/>
<circle cx="479.1" cy="257.1" r="4" fill="#DA702C" stroke="#FFFCF0" stroke-width="2"/>
<circle cx="650.0" cy="262.6" r="4" fill="#DA702C" stroke="#FFFCF0" stroke-width="2"/>
<text x="662.0" y="262.6" class="dl" fill="#100F0F">writes, zipf <tspan class="mono" fill="#6F6E69">0.97×</tspan></text>
<path d="M52.0,261.7 L137.4,264.6 L308.3,261.4 L479.1,261.7 L650.0,267.2" fill="none" stroke="#DA702C" stroke-width="2" stroke-linejoin="round"/>
<circle cx="52.0" cy="261.7" r="4" fill="#DA702C" stroke="#FFFCF0" stroke-width="2"/>
<circle cx="137.4" cy="264.6" r="4" fill="#DA702C" stroke="#FFFCF0" stroke-width="2"/>
<circle cx="308.3" cy="261.4" r="4" fill="#DA702C" stroke="#FFFCF0" stroke-width="2"/>
<circle cx="479.1" cy="261.7" r="4" fill="#DA702C" stroke="#FFFCF0" stroke-width="2"/>
<circle cx="650.0" cy="267.2" r="4" fill="#DA702C" stroke="#FFFCF0" stroke-width="2"/>
<text x="662.0" y="283.2" class="dl" fill="#100F0F">writes, uniform <tspan class="mono" fill="#6F6E69">0.83×</tspan></text>
</svg>
  </div>
  <div class="legend"><span><i style="background:#4385BE"></i>reads</span><span><i style="background:#DA702C"></i>writes</span><span><i style="background:#878580"></i>uniform keys</span><span><i style="background:repeating-linear-gradient(90deg,#878580 0 5px,transparent 5px 8px)"></i>zipf 0.99</span><span class="dim">hue = operation mix · line style = key distribution</span></div>
  <div class="caption"><a href="https://claude.ai/code/artifact/b5960bf3-7454-4c7f-8a76-76bbb38b6ada" target="_blank" rel="noopener noreferrer" class="inherit">read vs. write scaling with Segcache</a></div>
</div>

<!--
Same engine, same cores, same run: reads take all eight cores — 8.2× uniform, 6.2× Zipf — and writes take one. Separating the two makes the write curve's shape unambiguous: it has none.

Second example, same loop. Declare the workload — pure reads or pure writes, uniform or Zipf, 1 to 8 cores — pick the KPI — speedup over one core — and measure. Reads ride the ideal diagonal; writes are a horizontal line, and past six cores they deliver less than one. Everything the earlier report called "write throughput peaking at four threads" was the read half of a 50/50 mix scaling while writes stayed pinned. That separation, not a hunch about production, is what tells you where the design work is.
-->

---

<div class="figure">
  <div style="display:flex; gap:1.2rem; width:96%;">
    <div class="chart" style="flex:1;">
<svg viewBox="0 0 470 330" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Aggregate Mops/s against core count, 50% writes, uniform keys, six architectures">
<line x1="40" x2="352" y1="290.0" y2="290.0" stroke="#E6E4D9" stroke-width="1"/><text x="32" y="294.0" text-anchor="end" class="tick" fill="#878580">0</text>
<line x1="40" x2="352" y1="198.0" y2="198.0" stroke="#E6E4D9" stroke-width="1"/><text x="32" y="202.0" text-anchor="end" class="tick" fill="#878580">2</text>
<line x1="40" x2="352" y1="106.0" y2="106.0" stroke="#E6E4D9" stroke-width="1"/><text x="32" y="110.0" text-anchor="end" class="tick" fill="#878580">4</text>
<line x1="40" x2="352" y1="14.0" y2="14.0" stroke="#E6E4D9" stroke-width="1"/><text x="32" y="18.0" text-anchor="end" class="tick" fill="#878580">6</text>
<text x="40.0" y="306" text-anchor="middle" class="tick" fill="#878580">1</text>
<text x="84.6" y="306" text-anchor="middle" class="tick" fill="#878580">2</text>
<text x="173.7" y="306" text-anchor="middle" class="tick" fill="#878580">4</text>
<text x="262.9" y="306" text-anchor="middle" class="tick" fill="#878580">6</text>
<text x="352.0" y="306" text-anchor="middle" class="tick" fill="#878580">8</text>
<text x="196" y="324" text-anchor="middle" class="axis" fill="#878580">CORES · UNIFORM KEYS</text>
<text transform="translate(12 152) rotate(-90)" text-anchor="middle" class="axis" fill="#878580">MOPS/S</text>
<path d="M40.0,223.6 L84.6,211.5 L173.7,203.4 L262.9,203.0 L352.0,214.1" fill="none" stroke="#4385BE" stroke-width="2" stroke-linejoin="round"/>
<circle cx="40.0" cy="223.6" r="3.2" fill="#4385BE" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="84.6" cy="211.5" r="3.2" fill="#4385BE" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="173.7" cy="203.4" r="3.2" fill="#4385BE" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="262.9" cy="203.0" r="3.2" fill="#4385BE" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="352.0" cy="214.1" r="3.2" fill="#4385BE" stroke="#FFFCF0" stroke-width="1.5"/>
<path d="M40.0,223.4 L84.6,208.6 L173.7,199.9 L262.9,201.8 L352.0,202.8" fill="none" stroke="#DA702C" stroke-width="2" stroke-linejoin="round"/>
<circle cx="40.0" cy="223.4" r="3.2" fill="#DA702C" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="84.6" cy="208.6" r="3.2" fill="#DA702C" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="173.7" cy="199.9" r="3.2" fill="#DA702C" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="262.9" cy="201.8" r="3.2" fill="#DA702C" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="352.0" cy="202.8" r="3.2" fill="#DA702C" stroke="#FFFCF0" stroke-width="1.5"/>
<path d="M84.6,242.5 L173.7,211.9 L262.9,194.3 L352.0,205.7" fill="none" stroke="#129C8F" stroke-width="2" stroke-linejoin="round"/>
<circle cx="84.6" cy="242.5" r="3.2" fill="#129C8F" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="173.7" cy="211.9" r="3.2" fill="#129C8F" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="262.9" cy="194.3" r="3.2" fill="#129C8F" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="352.0" cy="205.7" r="3.2" fill="#129C8F" stroke="#FFFCF0" stroke-width="1.5"/>
<path d="M40.0,220.6 L84.6,197.0 L173.7,174.9 L262.9,166.7 L352.0,164.8" fill="none" stroke="#8B7EC8" stroke-width="2" stroke-linejoin="round"/>
<circle cx="40.0" cy="220.6" r="3.2" fill="#8B7EC8" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="84.6" cy="197.0" r="3.2" fill="#8B7EC8" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="173.7" cy="174.9" r="3.2" fill="#8B7EC8" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="262.9" cy="166.7" r="3.2" fill="#8B7EC8" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="352.0" cy="164.8" r="3.2" fill="#8B7EC8" stroke="#FFFCF0" stroke-width="1.5"/>
<path d="M84.6,224.8 L173.7,194.4 L262.9,173.6 L352.0,160.0" fill="none" stroke="#879A39" stroke-width="2" stroke-linejoin="round"/>
<circle cx="84.6" cy="224.8" r="3.2" fill="#879A39" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="173.7" cy="194.4" r="3.2" fill="#879A39" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="262.9" cy="173.6" r="3.2" fill="#879A39" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="352.0" cy="160.0" r="3.2" fill="#879A39" stroke="#FFFCF0" stroke-width="1.5"/>
<path d="M40.0,224.2 L84.6,175.2 L173.7,110.0 L262.9,64.3 L352.0,36.7" fill="none" stroke="#CE5D97" stroke-width="2" stroke-linejoin="round"/>
<circle cx="40.0" cy="224.2" r="3.2" fill="#CE5D97" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="84.6" cy="175.2" r="3.2" fill="#CE5D97" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="173.7" cy="110.0" r="3.2" fill="#CE5D97" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="262.9" cy="64.3" r="3.2" fill="#CE5D97" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="352.0" cy="36.7" r="3.2" fill="#CE5D97" stroke="#FFFCF0" stroke-width="1.5"/>
<text x="361.0" y="40.7" class="dl" style="font-size:10.5px" fill="#100F0F">sharded <tspan class="mono" fill="#6F6E69">5.51</tspan></text>
<text x="361.0" y="164.0" class="dl" style="font-size:10.5px" fill="#100F0F">deleg · batch 16 <tspan class="mono" fill="#6F6E69">2.83</tspan></text>
<text x="361.0" y="176.0" class="dl" style="font-size:10.5px" fill="#100F0F">partitioned <tspan class="mono" fill="#6F6E69">2.72</tspan></text>
<text x="361.0" y="206.8" class="dl" style="font-size:10.5px" fill="#100F0F">striped <tspan class="mono" fill="#6F6E69">1.90</tspan></text>
<text x="361.0" y="218.8" class="dl" style="font-size:10.5px" fill="#100F0F">deleg · per-op <tspan class="mono" fill="#6F6E69">1.83</tspan></text>
<text x="361.0" y="230.8" class="dl" style="font-size:10.5px" fill="#100F0F">shared <tspan class="mono" fill="#6F6E69">1.65</tspan></text>
</svg>
    </div>
    <div class="chart" style="flex:1;">
<svg viewBox="0 0 470 330" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Aggregate Mops/s against core count, 50% writes, zipf 0.99 keys, six architectures">
<line x1="40" x2="352" y1="290.0" y2="290.0" stroke="#E6E4D9" stroke-width="1"/><text x="32" y="294.0" text-anchor="end" class="tick" fill="#878580">0</text>
<line x1="40" x2="352" y1="198.0" y2="198.0" stroke="#E6E4D9" stroke-width="1"/><text x="32" y="202.0" text-anchor="end" class="tick" fill="#878580">2</text>
<line x1="40" x2="352" y1="106.0" y2="106.0" stroke="#E6E4D9" stroke-width="1"/><text x="32" y="110.0" text-anchor="end" class="tick" fill="#878580">4</text>
<line x1="40" x2="352" y1="14.0" y2="14.0" stroke="#E6E4D9" stroke-width="1"/><text x="32" y="18.0" text-anchor="end" class="tick" fill="#878580">6</text>
<text x="40.0" y="306" text-anchor="middle" class="tick" fill="#878580">1</text>
<text x="84.6" y="306" text-anchor="middle" class="tick" fill="#878580">2</text>
<text x="173.7" y="306" text-anchor="middle" class="tick" fill="#878580">4</text>
<text x="262.9" y="306" text-anchor="middle" class="tick" fill="#878580">6</text>
<text x="352.0" y="306" text-anchor="middle" class="tick" fill="#878580">8</text>
<text x="196" y="324" text-anchor="middle" class="axis" fill="#878580">CORES · ZIPF 0.99 KEYS</text>
<text transform="translate(12 152) rotate(-90)" text-anchor="middle" class="axis" fill="#878580">MOPS/S</text>
<path d="M40.0,232.9 L84.6,212.2 L173.7,197.3 L262.9,197.0 L352.0,204.9" fill="none" stroke="#4385BE" stroke-width="2" stroke-linejoin="round"/>
<circle cx="40.0" cy="232.9" r="3.2" fill="#4385BE" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="84.6" cy="212.2" r="3.2" fill="#4385BE" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="173.7" cy="197.3" r="3.2" fill="#4385BE" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="262.9" cy="197.0" r="3.2" fill="#4385BE" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="352.0" cy="204.9" r="3.2" fill="#4385BE" stroke="#FFFCF0" stroke-width="1.5"/>
<path d="M40.0,232.4 L84.6,210.5 L173.7,186.4 L262.9,180.3 L352.0,177.4" fill="none" stroke="#DA702C" stroke-width="2" stroke-linejoin="round"/>
<circle cx="40.0" cy="232.4" r="3.2" fill="#DA702C" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="84.6" cy="210.5" r="3.2" fill="#DA702C" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="173.7" cy="186.4" r="3.2" fill="#DA702C" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="262.9" cy="180.3" r="3.2" fill="#DA702C" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="352.0" cy="177.4" r="3.2" fill="#DA702C" stroke="#FFFCF0" stroke-width="1.5"/>
<path d="M84.6,229.8 L173.7,194.4 L262.9,172.7 L352.0,182.6" fill="none" stroke="#129C8F" stroke-width="2" stroke-linejoin="round"/>
<circle cx="84.6" cy="229.8" r="3.2" fill="#129C8F" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="173.7" cy="194.4" r="3.2" fill="#129C8F" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="262.9" cy="172.7" r="3.2" fill="#129C8F" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="352.0" cy="182.6" r="3.2" fill="#129C8F" stroke="#FFFCF0" stroke-width="1.5"/>
<path d="M40.0,229.5 L84.6,196.6 L173.7,154.9 L262.9,135.9 L352.0,126.8" fill="none" stroke="#8B7EC8" stroke-width="2" stroke-linejoin="round"/>
<circle cx="40.0" cy="229.5" r="3.2" fill="#8B7EC8" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="84.6" cy="196.6" r="3.2" fill="#8B7EC8" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="173.7" cy="154.9" r="3.2" fill="#8B7EC8" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="262.9" cy="135.9" r="3.2" fill="#8B7EC8" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="352.0" cy="126.8" r="3.2" fill="#8B7EC8" stroke="#FFFCF0" stroke-width="1.5"/>
<path d="M84.6,206.6 L173.7,172.0 L262.9,147.3 L352.0,133.2" fill="none" stroke="#879A39" stroke-width="2" stroke-linejoin="round"/>
<circle cx="84.6" cy="206.6" r="3.2" fill="#879A39" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="173.7" cy="172.0" r="3.2" fill="#879A39" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="262.9" cy="147.3" r="3.2" fill="#879A39" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="352.0" cy="133.2" r="3.2" fill="#879A39" stroke="#FFFCF0" stroke-width="1.5"/>
<path d="M40.0,232.2 L84.6,184.4 L173.7,110.6 L262.9,61.6 L352.0,30.8" fill="none" stroke="#CE5D97" stroke-width="2" stroke-linejoin="round"/>
<circle cx="40.0" cy="232.2" r="3.2" fill="#CE5D97" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="84.6" cy="184.4" r="3.2" fill="#CE5D97" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="173.7" cy="110.6" r="3.2" fill="#CE5D97" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="262.9" cy="61.6" r="3.2" fill="#CE5D97" stroke="#FFFCF0" stroke-width="1.5"/>
<circle cx="352.0" cy="30.8" r="3.2" fill="#CE5D97" stroke="#FFFCF0" stroke-width="1.5"/>
<text x="361.0" y="34.8" class="dl" style="font-size:10.5px" fill="#100F0F">sharded <tspan class="mono" fill="#6F6E69">5.63</tspan></text>
<text x="361.0" y="130.8" class="dl" style="font-size:10.5px" fill="#100F0F">partitioned <tspan class="mono" fill="#6F6E69">3.55</tspan></text>
<text x="361.0" y="142.8" class="dl" style="font-size:10.5px" fill="#100F0F">deleg · batch 16 <tspan class="mono" fill="#6F6E69">3.41</tspan></text>
<text x="361.0" y="181.4" class="dl" style="font-size:10.5px" fill="#100F0F">striped <tspan class="mono" fill="#6F6E69">2.45</tspan></text>
<text x="361.0" y="193.4" class="dl" style="font-size:10.5px" fill="#100F0F">deleg · per-op <tspan class="mono" fill="#6F6E69">2.33</tspan></text>
<text x="361.0" y="208.9" class="dl" style="font-size:10.5px" fill="#100F0F">shared <tspan class="mono" fill="#6F6E69">1.85</tspan></text>
</svg>
    </div>
  </div>
  <div class="legend"><span><i style="background:#4385BE"></i>shared engine</span><span><i style="background:#DA702C"></i>striped tails</span><span><i style="background:#129C8F"></i>delegated, per-op</span><span><i style="background:#8B7EC8"></i>partitioned P=16</span><span><i style="background:#879A39"></i>delegated, batch 16</span><span><i style="background:#CE5D97"></i>sharded bound</span><span class="dim">50% writes · median of 3 runs</span></div>
  <div class="caption"><a href="https://claude.ai/code/artifact/5c9e0e10-1f58-4961-8202-2e67de2c4685" target="_blank" rel="noopener noreferrer" class="inherit">designs to scale write better</a></div>
</div>

<!--
The shapes matter more than the endpoints. Only three curves still climb at eight cores — sharded, partitioned, and batched delegation. The shared engine turns over after six, the per-op handoff after six as well, and striped tails go flat under uniform keys. An architecture that is merely higher at eight cores is worth less than one still rising.
-->

---

<div class="figure">
  <div class="chart" style="width:84%;">
<svg viewBox="0 0 1000 392" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Closed-loop throughput by scenario, io_uring vs Mio backends">
<line x1="196.0" y1="6" x2="196.0" y2="366" stroke="#E6E4D9" stroke-width="1"/>
<text x="196.0" y="384" text-anchor="middle" class="tick" fill="#878580">0k/s</text>
<line x1="389.5" y1="6" x2="389.5" y2="366" stroke="#E6E4D9" stroke-width="1"/>
<text x="389.5" y="384" text-anchor="middle" class="tick" fill="#878580">200k/s</text>
<line x1="583.0" y1="6" x2="583.0" y2="366" stroke="#E6E4D9" stroke-width="1"/>
<text x="583.0" y="384" text-anchor="middle" class="tick" fill="#878580">400k/s</text>
<line x1="776.5" y1="6" x2="776.5" y2="366" stroke="#E6E4D9" stroke-width="1"/>
<text x="776.5" y="384" text-anchor="middle" class="tick" fill="#878580">600k/s</text>
<line x1="970.0" y1="6" x2="970.0" y2="366" stroke="#E6E4D9" stroke-width="1"/>
<text x="970.0" y="384" text-anchor="middle" class="tick" fill="#878580">800k/s</text>
<line x1="196" y1="6" x2="196" y2="366" stroke="#CECDC3" stroke-width="1"/>
<text x="186" y="30.0" text-anchor="end" class="dl" fill="#100F0F">1 worker · 1 client</text>
<path d="M196 14.0h40.17129647747318a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h-40.17129647747318z" fill="#4385BE"/>
<line x1="238.7" y1="19.5" x2="239.2" y2="19.5" stroke="#878580" stroke-width="1"/><line x1="239.2" y1="16.5" x2="239.2" y2="22.5" stroke="#878580" stroke-width="1"/>
<path d="M196 27.0h36.87729889144252a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h-36.87729889144252z" fill="#DA702C"/>
<line x1="235.7" y1="32.5" x2="236.3" y2="32.5" stroke="#878580" stroke-width="1"/><line x1="236.3" y1="29.5" x2="236.3" y2="35.5" stroke="#878580" stroke-width="1"/>
<text x="186" y="70.0" text-anchor="end" class="dl" fill="#100F0F">1 worker · 64 clients</text>
<path d="M196 54.0h174.70449618738567a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h-174.70449618738567z" fill="#4385BE"/>
<line x1="356.3" y1="59.5" x2="402.1" y2="59.5" stroke="#878580" stroke-width="1"/><line x1="402.1" y1="56.5" x2="402.1" y2="62.5" stroke="#878580" stroke-width="1"/>
<path d="M196 67.0h147.89088155985334a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h-147.89088155985334z" fill="#DA702C"/>
<line x1="308.1" y1="72.5" x2="348.8" y2="72.5" stroke="#878580" stroke-width="1"/><line x1="348.8" y1="69.5" x2="348.8" y2="75.5" stroke="#878580" stroke-width="1"/>
<text x="186" y="110.0" text-anchor="end" class="dl" fill="#100F0F">1 worker · 512 clients</text>
<path d="M196 94.0h221.7425435548195a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h-221.7425435548195z" fill="#4385BE"/>
<line x1="404.7" y1="99.5" x2="427.0" y2="99.5" stroke="#878580" stroke-width="1"/><line x1="427.0" y1="96.5" x2="427.0" y2="102.5" stroke="#878580" stroke-width="1"/>
<path d="M196 107.0h147.00607729321825a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h-147.00607729321825z" fill="#DA702C"/>
<line x1="342.1" y1="112.5" x2="349.5" y2="112.5" stroke="#878580" stroke-width="1"/><line x1="349.5" y1="109.5" x2="349.5" y2="115.5" stroke="#878580" stroke-width="1"/>
<text x="186" y="150.0" text-anchor="end" class="dl" fill="#100F0F">2 workers · 1 client</text>
<path d="M196 134.0h39.810233844465294a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h-39.810233844465294z" fill="#4385BE"/>
<line x1="238.7" y1="139.5" x2="238.8" y2="139.5" stroke="#878580" stroke-width="1"/><line x1="238.8" y1="136.5" x2="238.8" y2="142.5" stroke="#878580" stroke-width="1"/>
<path d="M196 147.0h37.01929287162191a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h-37.01929287162191z" fill="#DA702C"/>
<line x1="234.6" y1="152.5" x2="236.4" y2="152.5" stroke="#878580" stroke-width="1"/><line x1="236.4" y1="149.5" x2="236.4" y2="155.5" stroke="#878580" stroke-width="1"/>
<text x="186" y="190.0" text-anchor="end" class="dl" fill="#100F0F">2 workers · 64 clients</text>
<path d="M196 174.0h441.4084025513888a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h-441.4084025513888z" fill="#4385BE"/>
<line x1="599.5" y1="179.5" x2="640.5" y2="179.5" stroke="#878580" stroke-width="1"/><line x1="640.5" y1="176.5" x2="640.5" y2="182.5" stroke="#878580" stroke-width="1"/>
<path d="M196 187.0h242.78665577626074a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h-242.78665577626074z" fill="#DA702C"/>
<line x1="437.9" y1="192.5" x2="459.9" y2="192.5" stroke="#878580" stroke-width="1"/><line x1="459.9" y1="189.5" x2="459.9" y2="195.5" stroke="#878580" stroke-width="1"/>
<text x="186" y="230.0" text-anchor="end" class="dl" fill="#100F0F">2 workers · 512 clients</text>
<path d="M196 214.0h432.8840840166504a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h-432.8840840166504z" fill="#4385BE"/>
<line x1="626.1" y1="219.5" x2="669.3" y2="219.5" stroke="#878580" stroke-width="1"/><line x1="669.3" y1="216.5" x2="669.3" y2="222.5" stroke="#878580" stroke-width="1"/>
<path d="M196 227.0h236.84630054112478a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h-236.84630054112478z" fill="#DA702C"/>
<line x1="411.2" y1="232.5" x2="502.0" y2="232.5" stroke="#878580" stroke-width="1"/><line x1="502.0" y1="229.5" x2="502.0" y2="235.5" stroke="#878580" stroke-width="1"/>
<text x="186" y="270.0" text-anchor="end" class="dl" fill="#100F0F">4 workers · 1 client</text>
<path d="M196 254.0h39.461304517068335a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h-39.461304517068335z" fill="#4385BE"/>
<line x1="238.2" y1="259.5" x2="238.9" y2="259.5" stroke="#878580" stroke-width="1"/><line x1="238.9" y1="256.5" x2="238.9" y2="262.5" stroke="#878580" stroke-width="1"/>
<path d="M196 267.0h37.07916782525473a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h-37.07916782525473z" fill="#DA702C"/>
<line x1="235.8" y1="272.5" x2="236.2" y2="272.5" stroke="#878580" stroke-width="1"/><line x1="236.2" y1="269.5" x2="236.2" y2="275.5" stroke="#878580" stroke-width="1"/>
<text x="186" y="310.0" text-anchor="end" class="dl" fill="#100F0F">4 workers · 64 clients</text>
<path d="M196 294.0h479.13072810424984a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h-479.13072810424984z" fill="#4385BE"/>
<line x1="677.4" y1="299.5" x2="679.1" y2="299.5" stroke="#878580" stroke-width="1"/><line x1="679.1" y1="296.5" x2="679.1" y2="302.5" stroke="#878580" stroke-width="1"/>
<path d="M196 307.0h467.0613866122692a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h-467.0613866122692z" fill="#DA702C"/>
<line x1="661.8" y1="312.5" x2="683.1" y2="312.5" stroke="#878580" stroke-width="1"/><line x1="683.1" y1="309.5" x2="683.1" y2="315.5" stroke="#878580" stroke-width="1"/>
<text x="186" y="350.0" text-anchor="end" class="dl" fill="#100F0F">4 workers · 512 clients</text>
<path d="M196 334.0h621.4817165078747a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h-621.4817165078747z" fill="#4385BE"/>
<line x1="815.2" y1="339.5" x2="830.3" y2="339.5" stroke="#878580" stroke-width="1"/><line x1="830.3" y1="336.5" x2="830.3" y2="342.5" stroke="#878580" stroke-width="1"/>
<path d="M196 347.0h518.8474900001502a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h-518.8474900001502z" fill="#DA702C"/>
<line x1="713.9" y1="352.5" x2="764.4" y2="352.5" stroke="#878580" stroke-width="1"/><line x1="764.4" y1="349.5" x2="764.4" y2="355.5" stroke="#878580" stroke-width="1"/>
</svg>
  </div>
  <div class="legend"><span><i style="background:#4385BE"></i>io_uring</span><span><i style="background:#DA702C"></i>Mio</span><span class="dim">closed loop · 64-byte TCP echo · median of 3 × 5 s, whiskers min–max</span></div>
  <div class="caption"><a href="https://claude.ai/code/artifact/b10cf6bd-ebf9-457e-b624-2c63874a9cdf" target="_blank" rel="noopener noreferrer" class="inherit">Ringline io_uring vs Mio — closed-loop throughput</a></div>
</div>

<!--
Third example: the runtime change from the reboot slide, measured the same way. Same code, same host, same workload, same pinning — only the backend differs. Closed loop, one request in flight per connection; the concurrency sweep is where the two designs separate.
-->

---

<div class="bg-bands"><Img src="maug-top.jpg" class="top" alt="" /><Img src="maug-bottom.jpg" class="bottom" alt="" /></div>
<div class="divider">
  <div class="kicker">Chapter Five</div>
  <h1>Changing how <em>we</em> build</h1>
</div>

<!--
The best model I can come up with for what software engineering is becoming is a learning system.
-->

---

# Building a learning system

<div class="chart" style="width:98%; margin:0.2rem auto 0;">
<svg viewBox="0 20 1000 345" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A learning system: institutional knowledge is generated, retained, and used in a loop; latent knowledge flows in from below-left, manifested artifacts flow out to below-right">
<defs><marker id="ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#DA702C"/></marker></defs>
<line x1="294.3" y1="303.6" x2="431.4" y2="221.2" stroke="#DA702C" stroke-width="3" stroke-dasharray="9 8" marker-end="url(#ah2)"/>
<line x1="568.6" y1="221.2" x2="705.7" y2="303.6" stroke="#DA702C" stroke-width="3" marker-end="url(#ah2)"/>
<path d="M511.8,45.5 A135,135 0 0 1 633.3,201.1" fill="none" stroke="#DA702C" stroke-width="36"/>
<polygon points="609.9,189.7 658.8,206.9 618.3,244.2" fill="#DA702C"/>
<path id="lp0" d="M511.8,45.5 A135,135 0 0 1 633.3,201.1" fill="none"/><text class="verb" fill="#FFFCF0" dy="7"><textPath href="#lp0" startOffset="50%" text-anchor="middle">Generate</textPath></text>
<path d="M611.9,255.5 A135,135 0 0 1 418.8,287.8" fill="none" stroke="#9C4F2A" stroke-width="36"/>
<polygon points="439.8,272.4 401.7,307.6 387.8,254.3" fill="#9C4F2A"/>
<path id="lp1" d="M418.8,287.8 A135,135 0 0 0 611.9,255.5" fill="none"/><text class="verb" fill="#FFFCF0" dy="7"><textPath href="#lp1" startOffset="50%" text-anchor="middle">Retain</textPath></text>
<path d="M377.6,237.1 A135,135 0 0 1 451.6,54.0" fill="none" stroke="#6B3A1E" stroke-width="36"/>
<polygon points="453.5,80.0 443.9,29.1 496.4,45.5" fill="#6B3A1E"/>
<path id="lp2" d="M377.6,237.1 A135,135 0 0 1 451.6,54.0" fill="none"/><text class="verb" fill="#FFFCF0" dy="7"><textPath href="#lp2" startOffset="50%" text-anchor="middle">Use</textPath></text>
<g class="watermark" transform="translate(425 114) scale(1.5)" fill="#E6E4D9" opacity="0.6"><polygon points="50,0 100,22 0,22"/><rect x="2" y="24" width="96" height="8"/><rect x="6" y="36" width="9" height="38" rx="1"/><rect x="4.5" y="34" width="12" height="3"/><rect x="26" y="36" width="9" height="38" rx="1"/><rect x="24.5" y="34" width="12" height="3"/><rect x="45.5" y="36" width="9" height="38" rx="1"/><rect x="44.0" y="34" width="12" height="3"/><rect x="65" y="36" width="9" height="38" rx="1"/><rect x="63.5" y="34" width="12" height="3"/><rect x="85" y="36" width="9" height="38" rx="1"/><rect x="83.5" y="34" width="12" height="3"/><rect x="3" y="76" width="94" height="6"/><rect x="0" y="84" width="100" height="6"/></g>
<text x="500" y="172" text-anchor="middle" class="hub" fill="#100F0F">INSTITUTIONAL</text>
<text x="500" y="198" text-anchor="middle" class="hub" fill="#100F0F">KNOWLEDGE</text>
<text x="265" y="329" text-anchor="middle" class="lbl" fill="#6F6E69">latent</text>
<text x="265" y="353" text-anchor="middle" class="sub" fill="#878580">in heads, buried in code</text>
<text x="735" y="329" text-anchor="middle" class="lbl" fill="#100F0F">manifested</text>
<text x="735" y="353" text-anchor="middle" class="sub" fill="#878580">the primary artifacts</text>
</svg>
</div>

<div class="punchline" v-click><span class="lead">Engineering control is exerted via</span><br /><em class="accent">process, tooling, and validation</em></div>

<!--
The best model I have for what software engineering is becoming: a learning system — a setup that specifies how institutional knowledge about problems and solutions is obtained. The most striking difference from how things used to be done is not speed, but that such knowledge and methods are now externalized. They're no longer latent; they are the primary artifacts, at least as far as engineers are concerned. Code, runtime behavior, and resource requirements are all downstream from these artifacts — they can be obtained fairly timely and predictably. So the densest and most valuable form of our knowledge and expertise is in the hows and whys, not the whats. And those are the questions we should constantly be asking.
-->

---

# This skill of *How* has a name — Craft

<div class="quote" style="margin-top:0.8rem">
  craft <span class="mono dim" style="font-style:normal; font-size:0.8rem;">(n.)</span> — skill in planning, making, or executing
  <span class="who">— Merriam-Webster</span>
</div>


<div class="cards c3 beliefs">
  <div class="card" v-click>Place higher value on methodology</div>
  <div class="card" v-click>Set direction and rely on automated conversion</div>
  <div class="card" v-click>Develop a concrete sense of "good", a.k.a. "taste"</div>
</div>

<style>
.beliefs { max-width: 94%; gap: 2rem; margin-top: 5rem; align-items: stretch; }
.beliefs > .card {
  border: 1px solid var(--orange);
  border-radius: 10px;
  padding: 1.8rem 1.4rem;
  text-align: center;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ink);
  line-height: 1.4;
  display: flex; align-items: center; justify-content: center;
}
</style>

<!--
If we accept that we're increasingly building a self-improving system we can guide but not directly participate in — as far as the executable or other fully-hydrated outcomes go — a few corollaries fall out: code is not the durable artifact, methodology is; knowing what to aim for guides all the effort that achieves it, which can be largely automated; and developing a sense of "good" is high-value because of its amplification potential — aka taste.

Yes, the code is auto-generated, but how it is done is the whole game now. And that skill has a name — ladies and gentlemen, we are looking at the definition of "craft". The skill to express the constraints and importance of the problem; to make high-level ideas and structure accessible to a broader audience; to systematically examine weaknesses and imperfections and quantify them; to take what is measured and observed back into the understanding of the problem and start the loop over again. They are now your tools, and you should explicitly create, curate, and iterate on them.
-->

---

<div class="figure">
  <table class="themes-tbl">
    <thead>
      <tr><th></th><th>Theme</th><th>Cites</th><th>Group (synthesis)</th></tr>
    </thead>
    <tbody>
    <tr><td><span class="chip" style="background:#B3CDE3">P</span></td><td>Predictability is the actual goal</td><td class="pn">P1, P11, P13, P17, P18</td><td class="muted">the goal: knowability</td></tr>
    <tr><td><span class="chip" style="background:#CCEBC5">S</span></td><td>Plane separation, everywhere</td><td class="pn">P1, P11, P13, P18</td><td class="muted">the design strategy: placement</td></tr>
    <tr><td><span class="chip" style="background:#DECBE4">B</span></td><td>Bind early; run fixed</td><td class="pn">P17, P22</td><td class="muted">the design strategy: placement</td></tr>
    <tr><td><span class="chip" style="background:#FED9A6">W</span></td><td>Workload is ground truth</td><td class="pn">P10, P12, P16, P17, P23</td><td class="muted">the goal: knowability</td></tr>
    <tr><td><span class="chip" style="background:#FBB4AE">J</span></td><td>Judgment within structure</td><td class="pn">P8, P10, P12, P19, P25, P30</td><td class="muted">the operating strategy: explicit loops</td></tr>
    <tr><td><span class="chip" style="background:#FDDAEC">D</span></td><td>Degrade loudly, through a channel that still works</td><td class="pn">P9, P10, P29, P30</td><td class="muted">the operating strategy: explicit loops</td></tr>
    <tr><td><span class="chip" style="background:#FFFFCC">L</span></td><td>Nested control loops, with buffers sized to the loop</td><td class="pn">P5, P8, P9, P18, P19, P34, P36, P41</td><td class="muted">the operating strategy: explicit loops</td></tr>
    <tr><td><span class="chip" style="background:#E5D8BD">N</span></td><td>Nothing is sacred: when reality changes, design follows</td><td class="pn">P17, P24, P25, P30</td><td class="muted">the operating strategy: explicit loops</td></tr>
    </tbody>
  </table>
  <div class="caption"><a href="https://claude.ai/code/artifact/93a56295-7ec9-4a33-b574-6c30ac6bd7a2" target="_blank" rel="noopener noreferrer" class="inherit">design principles of Pelikan</a></div>
</div>

<!--
This is what "methodology is the durable artifact" looks like when you actually do it: fifty-four principles pulled out of Pelikan's docs, cross-cited, and resolved into eight themes and three moves. None of this is code. All of the code is downstream of it.
-->

---

<div class="figure">
  <Img src="skill-feedback-loop.svg" alt="Skill feedback loop: skills are used in sessions, reviewed, and improved in a loop" />
  <div class="caption"><a href="https://github.com/iopsystems/skills-mcp" target="_blank" rel="noopener noreferrer" class="inherit">build reusable skills</a></div>
</div>

<!--
And the loop closes: the how gets captured as skills, the skills get used, reviewed, and improved. That's the learning system again, one level up.
-->

---

<div class="cols2 big" style="margin-top:2.6rem">
  <div>
    <h1 class="muted">Something is lost</h1>
    <ul class="rlist">
      <li>muscle memory of tools</li>
      <li>earned expertise through the single act of execution</li>
    </ul>
  </div>
  <div v-click>
    <h1 class="orange">Something is found</h1>
    <ul class="rlist">
      <li><strong>structured curiosity</strong> to grow professionally</li>
      <li><strong>provenance</strong> as guardrails</li>
    </ul>
  </div>
</div>


<!--
There is undoubtedly serious muscle atrophy in the more mechanical, more predictable parts of software engineering. Writing source code by hand is going the way of handcrafted woodwork — a hobby. But we as professionals have little reason or time to mourn that loss — we must broaden our horizons and raise the bar of software while embracing the full potential of AI/ML. Structured curiosity is my chosen approach, and well-defined evaluation my guardrail. Perfecting our craft — the whys and hows — is going to be the whole game. Let's have some fun delivering seriously good software.
-->

---

<div class="bg-full"><Img src="cs_0322N_Coral.jpg" alt="" /></div>
<div class="divider photo">
  <div class="q">Let's have some fun building <em class="accent">provably good software</em>.</div>
</div>

<!--
Let's have some fun building provably good software.
-->

---

# Other practical challenges

<div v-click style="margin-top:1.4rem;">
  <div class="phase orange">The social endeavor</div>
  <ul class="rlist big">
    <li>production and validation burden are inversed under old practice</li>
    <li>communication becomes mediated by multiple non-human parties</li>
    <li>distributed or outsourced expertise</li>
  </ul>
</div>

<div v-click style="margin-top:2rem;">
  <div class="phase orange">Nondeterminism and variance</div>
  <ul class="rlist big">
    <li>same context, same prompt, different answers</li>
    <li>another layer to inject external influence that potentially underpins everything</li>
  </ul>
</div>

<!--
Software engineering is a social endeavor. On one hand it's now much harder to tell how much someone cared or worked toward a seemingly competent piece of work, and therefore how much trust is deserved. On the other, it's always a losing battle to derive durable, bespoke signals from high-entropy artifacts like code. Perhaps the wrong question is how AI would determine how we exchange ideas and reach agreements; rather, we should decide that mostly on our own terms, applying AI to produce higher-quality artifacts to share. A well-laid-out dataflow chart for every design considered used to be a luxury; now it's within reason for every complex PR. Coverage of all known edge cases at every level used to be a multi-year stretch goal; now it can be a development protocol enforced from day one. It used to take so much drudgery to get to the point — much of that can now be delegated, so we can focus discussion on the meaty part.

The other practical challenge is left as an open question: how to rein in the nondeterminism and variance inherent in agentic coding.
-->

---

# Photo credits

<ul class="rlist" style="margin-top:2rem;">
  <li><strong>Coral polyps</strong> (title slide) — NOAA, public domain; cropped and faded.</li>
  <li><strong>Coral species of Maug Islands</strong> montage (chapter dividers) — NOAA, public domain, via <a href="https://commons.wikimedia.org/wiki/File:Coral_species_of_Maug_Islands_montage_2022.png" target="_blank" rel="noopener noreferrer">Wikimedia Commons</a>; split and faded.</li>
  <li><strong>Coral</strong> (closing slide) — Mikaela Nordborg / Australian Institute of Marine Science. Based on Australian Institute of Marine Science material, <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>.</li>
</ul>
