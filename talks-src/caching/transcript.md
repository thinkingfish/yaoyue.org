# Datacenter Caching: A Round-Trip to the Ephemeral Store — Talk Transcript

- **Speaker:** Yao Yue · South Bay Systems Meetup <https://southbaysystems.xyz/>
- **Video:** <https://www.youtube.com/watch?v=jL68eC3HyFQ> (segment **3:22 – 44:05**)
- **Source:** YouTube auto-generated captions, cleaned up (disfluencies and mis-transcriptions fixed) and grouped under the matching slides in [`slides.md`](./slides.md).

Timestamps `[m:ss]` are anchors into the video.

---

## Title — Introduction · [3:24]

[3:24] Today I'm going to talk about a batch of research that was done back when I was still working at Twitter. I was not the primary author of these — the primary author is someone who is now a professor at Harvard, but back then he was a PhD student at CMU. He was an intern at Twitter twice, and a research-fellowship recipient at Meta. So I'm trying to summarize someone's 300-page PhD thesis in about 30 minutes — any omissions or biases are purely mine.

[4:05] So, again, this is *datacenter* caching — a small slice of the general scheme of caching, which is a very universal and useful concept in systems.

---

## Part One · The Landscape → *Cache research* · [4:20]

[4:20] First, I want to give you the lay of the land, because caching is so broad. Let's define a little more specifically what we're talking about today.

[4:28] Cache as a research discipline goes all the way back — almost as old as computers. The memory hierarchy was described around the original ENIAC, and the practice of putting something faster in a smaller but closer store, compared to a bigger but slower remote store, was introduced in the '60s. "Cache" as a term was first used in the IBM System/360. So by any measure, it's been more than 50 years of research around caching.

[5:09] One assumption you could make is that, if people have been going at it for half a century, a lot of the low-hanging fruit has already been picked — and we're left looking at increasingly specific and complicated designs. One of the reasons I give this talk is to show you that that is *not* the case: there are still delightful surprises about simple and good systems to be built.

---

## Slide — *A decade+ of cache work at Twitter and beyond* · [5:41]

[5:41] Now let's fast-forward one more decade — this part is mostly about my background. I spent the decade of the 2010s working at Twitter, and most of that time I was working on cache in some form.

[5:56] The beginning of that tenure was marked by a lot of cache incidents. My coworker Dan Luu and I did a write-up of the twelve sev-0 and sev-1 incidents — if you're interested in how cache systems can get screwed up, it's very good material. There were a lot of hard-earned lessons from all these incidents. What was basically hammered into me was an obsession with tail latency, an obsession with scalability, and particular care for observability — because those were the things needed either to solve or to prevent incidents.

[6:42] One specific thing that ties into the research I'll talk about later: we built a little observability module called **klog**. What it does is very simple — it records requests as they come in, drops the payload (for privacy reasons, and because it's useless for our research), and if you do it right you can do it at line rate. So it's not a problem in production to log every request. This is important, because that's the foundation of the data.

[7:14] The second element that helped with research: I grew increasingly unsatisfied with the status quo, which was **memcached** and **Redis**. Those were wonderful projects — I read a lot of their source code and learned a lot — but one fundamental thing I struggled with was: why do we need two projects to do something that is fundamentally one thing — a very fast RPC server with some key-value-style memory storage on top? So I decided it should be possible to have a modularized design where you decouple the RPC server from the storage, which gives us more flexibility to innovate on both sides. It's basically what you'd expect if you design from first principles: everything that has a purpose gets a name and clear boundaries.

[8:16] The end result, as related to this talk, is that it's relatively easy to plug a new cache system in on top of the RPC layer, so you can start using it quickly. That gives us a reason to seek better cache designs, because we have a path to get them into production — instead of having to rely on upstream cache projects to take those changes, which is much harder.

[8:46] So that's the landscape. Now we're in the 2010s. As you probably know, if you work for a company, writing papers is very low on your priority list — whether for your day job or even for getting promoted. We had klog around 2012–13, and **Pelikan** around 2015–16 when we open-sourced it, but I'd have to wait almost another five years before any of the research would start.

---

## Part Two · An arc for cache research → *Who* · [9:22]

[9:22] Now let's get to the arc. It's a bunch of research, all very closely related — and I'll tell you why.

[9:29] First, the *who*. As I said, I'm just here to summarize the work; I didn't do most of it. Most of the work was always done by the students at the time. In this case, **Juncheng** and **Yazhuo** were the two PhD students — and, by the way, you do not need to look Chinese to work with me; this is purely Ymir's fault. **Ymir**, at the bottom, was their advisor when both were studying at Emory University at this point, so that's the common connection. Ymir and I go way back, before I dropped out of Cornell — Ymir was in the next office, so I've known him for a long time. **K.V. Rashmi** is Juncheng's proper advisor, so she provided a lot of help I couldn't see; I only know the part where she showed up in the office. So these are the main characters — just keep in mind who did the work, and that yours truly is just here to convey the message.

---

## Slide — *Let there be data* (OSDI '20 — the Twitter cache trace) · [10:30]

[10:30] Despite not having done the work, this piece was my idea — because as soon as I had klog, I was thinking about getting all the data recorded and then sharing it with people who could do something about it.

[10:49] Part of the reason: I was reading all the relevant papers coming out of OSDI, NSDI, and SOSP, looking for things I could apply to my work — and it was not easy. It was very difficult to find anything applicable, maybe beyond what Facebook was publishing in the early 2010s, because people kept making different assumptions from how I viewed what the system needs. So part of the desire was: I want Twitter's data out there, so people can build systems that work well given Twitter's traffic patterns — which makes it much more likely for me to benefit from their work.

[11:33] Obviously, the first step is that there needs to be data, and the data needs to be out. That's essentially what this piece of work is — all the labor goes into actually collecting the data. As you can imagine, it's a lot of politicking and very careful operations to collect from 200-plus clusters without anybody complaining. After that, a lot of data cleaning, privacy preservation, and anonymizing — but eventually we got it out.

[12:05] It's by far the largest collection of unfiltered cache traces even to this day: uncompressed, it's 14 terabytes; compressed, about 2 terabytes. It has everything — unique keys, what kind of operations, and the timestamps of those operations — so by replaying the trace you can very faithfully recreate the traffic Twitter saw in production during that time.

[12:38] It turned out to be an extremely useful dataset. Even before we published the paper, Juncheng was saying it would be one of the most cited cache papers within a decade — and we're now at 475 according to Google Scholar. It's certainly not a transformer paper, but as far as systems papers go, it's not bad.

---

## Slide — *Design a new cache system* (Segcache, NSDI '21) · [13:09]

[13:09] One of the first things we noticed is just how short-lived everything is. The cache trace comes with a **TTL** — time to live — and typical TTLs range from a few minutes to maybe a couple of weeks, but almost never longer.

[13:34] The reason isn't purely that people have great heuristics for how long data stays useful. Often the TTL is determined by something else. For example, if you can't be sure there won't be stale data, a TTL is a very good way to bound how stale it can get — "even if it's stale, it'll be refreshed within an hour, so let's not worry about it." It's a convenient shortcut for engineers. The other reason is compliance: under GDPR, you have to delete someone's data from everywhere within a certain amount of time — with a TTL in your cache, you can largely just point to it and say "this will be gone, I don't need to do anything."

[14:24] So there are various reasons people set TTLs, some of which have nothing to do with cache effectiveness — and yet, because it's almost always set, it becomes one of the strongest design heuristics you can use. And if you look at the historical research, nobody treated it as such. Historically — if you look at, say, CPU caches — the CDN is maybe the one exception where people did use TTL, but a lot of the earlier cache research was done on systems that don't really have this notion. They might talk about TTL in terms of how useful data is over time, but they don't treat it as a first-class property of the workload.

[15:07] **Segcache** was the first design to actually take TTL very seriously, and the way it uses TTL is to *group objects*. Instead of grouping objects by size — which is how memcached does it — or by some other similarity (you could apply machine learning and say "these objects are similar, let's put them together"), Segcache groups things by TTL, because TTL has a very strong effect on reuse distance.

[15:48] The second consequential design decision is that it more or less inherits the style of memcached's slabs: you have a bunch of key-values in one fixed-sized, much larger storage unit. The advantage is that it's easier to allocate fixed-sized units than variable-sized ones — tracking variable-sized objects is a big headache. If we assume everything is sufficiently small relative to the container size, you get very nice bulk-operation opportunities when you lay things out this way.

[16:33] So the key design decisions are **TTL-indexed groups**, and groups fitting into **fixed-sized segments**. One implication is that if you want to put the segments onto SSD — where you don't want to overwrite anything — it also fits very well, which is something we tried.

[16:51] On the lookup side, there's a common-sense optimization: instead of a regular hash table, you use one with multiple continuous slots per bucket. Again, a lot of these are meant to reduce the number of random reads — systems optimization, not necessarily cache optimization.

[17:20] The end result is a cache system that matches state-of-the-art on hit rate (or miss ratio) — slightly better, because we can take advantage of TTL — but way more scalable than memcached, with very high throughput and very low tail latency.

[17:54] So: TTL support. TTL is very important if you're thinking about designing your own cache — it's one of the hints, and it's worth looking at in detail, because it's historically overlooked.

---

## Slide — *A hot take* (HotOS '23 — FIFO can be better than LRU) · [18:04]

[18:04] Then Juncheng started thinking a little more meta. When he showed up, he was very surprised that we were essentially using a combination of random eviction and FIFO. Random, literally — if the system runs out of memory, it just picks a random chunk (a slab or segment) and kicks it out. We don't care if it's hot, we don't care if it's recent — pretty much the stupidest thing you can do. The slightly better version evicts segments based on allocation time — so, FIFO.

[18:56] His reaction was: there's no reason these super-simple, somewhat stupid algorithms should work well — and yet they were at least acceptable, and the FIFO one was actually quite good. Applying the traces we had, FIFO wasn't consistently losing to the fancy algorithms; it was actually better than some of them, sometimes. That's counter-intuitive and fascinating, so he tried to understand the deeper *why*.

[19:36] He went out and got even more data. In fact, after our trace was released — and I think we somewhat convinced Meta to release their own trace instead of just synthetic workloads, and other people agreed that raw data is very valuable — the number of traces we could access grew from hundreds (our original dataset) to thousands.

[20:09] After looking at thousands of workloads, and characterizing them better — how Zipfian something is, read/write ratio, object size, reuse-distance analysis, anything you can think of — the conclusion is: modern workloads have a very short shelf life. There are a lot of one-hit wonders, or things used very infrequently — very low value as far as caching is concerned. The other thing is that throughput is very high.

[20:53] Often, especially with a highly skewed read/write ratio, traditional algorithms that touch every key on read — moving it to the top of the list — are actually harmful, because the pressure on memory is linear to the number of *writes*, while the number of *reads* is way higher, and reads don't necessarily translate into pressure to evict. So there's a misalignment between the workload and the underlying mechanisms.

[21:37] The hot take is: if you recognize these high-level properties of the workloads across different segments of the industry, then it's possible to use extremely simple data structures and building blocks — like FIFO — and, as long as you achieve two properties, **lazy promotion** and **quick demotion**, you get very good results. That's the whole point of that HotOS paper.

[22:15] What does *lazy promotion* mean? It essentially means you do something about the data as close to when you *have* to as you can. If your cache is full and a new item comes in, you have to do something — either drop the new data (generally a bad idea) or evict. So if you can defer most of the data-related operations to the moment you're forced to act, that tends to be a good decision. What this achieves is mostly optimizing for the non-ratio attributes — throughput and latency — which, as we established earlier, we actually care about in production.

[23:11] The other principle is *quick demotion*. Its motivation is recognizing just how skewed modern workloads are in access frequency. An anecdote: when I was operating some Twitter cache clusters, for one of the most important caches you could get more than 50% — about 60% — of the hits by provisioning the cache at about 1% of the size we eventually settled on. That number doesn't mean much on its own, but it's an indicator of how skewed the access pattern is, and that observation has held true across different workloads.

[24:20] So if we can identify the long tail of objects — by frequency of access over a period of time — and cheaply reject the things at the very end (the one-hit wonders, or close to it), we can efficiently remove that long tail. The effect is that it opens up much more space for the new data that keeps coming in. One characterization of modern computer systems is that there's always new data arriving — time series, people's online activity — so we're not short of new data, and every batch goes through the same sorting process: most are one-hit wonders nobody looks at again, but a very small slice become hot. If we always keep ample capacity ready for the new data, we can burn off the rest. That's what quick demotion achieves: making sure you always have capacity for potentially-hot new data.

---

## Slide — *FIFO, FIFO, FIFO* (S3-FIFO, SOSP '23) · [25:38]

[25:38] If you take this design principle — FIFO is all we need — then logically you ask: if all I have is FIFO, how can I put FIFOs together to achieve the properties I claim are important, quick demotion and lazy promotion? We ended up with a design called **S3-FIFO**. It's called S3-FIFO because it's three FIFO queues — but also because it's **Simple, Scalable, and Static**.

[26:20] The shape of this design is actually very old. If you've heard of **2Q**, this looks almost identical from a layout perspective. In 2Q you have two queues — a small queue and a main queue; here we have a small FIFO and a main FIFO. Except that back when 2Q was designed, it was still believed — and probably true at the time — that LRU is what you really want for your popular objects. There, the first queue was mostly there to make it scan-resilient, but it wasn't ready to ditch the LRU concept. We're saying FIFO is all you need, so we replace the LRU.

[27:13] We also made other changes. There's the last queue, which isn't a full-sized queue: it's a **ghost queue**. It does track all the keys, but it doesn't host actual payloads — the values aren't there, only the keys. The purpose of the ghost queue is, in some sense, to measure *regret*: "I should have admitted that key instead of throwing it away."

[27:49] We achieve lazy promotion by only doing something about the data when it reaches the end of one of these queues. Everything enters through the small queue, so the data hasn't been vetted — probably a lot of one-hit wonders are mixed in. If a key receives at least one hit, it earns the right to be moved to the main queue; if not, it's evicted, and its key is put into the ghost queue so we can measure regret later.

[28:33] The only other thing to note: if we regret — it would have been a hit, but it was in the ghost queue — then when we write that value into the cache, it gets promoted directly to the main FIFO. It bypasses the small queue; it's not treated as a new key anymore, but as something we've already seen.

[29:04] That's pretty much it. When we evaluated this design against the data we published, as well as other data we could get our hands on, it pretty much outperformed everything — if you look at it holistically. And it's a very simple design: anybody can implement it in about 50 lines of code. It's a very good algorithm.

---

## Slide — *The better LRU hidden under our nose* (SIEVE, NSDI '24) · [29:34]

[29:34] But we're not quite done — because we said FIFO is all you need, which I stand by. If I'm building a web cache, I'm using FIFO for all the memory-management and performance reasons. But there are still times when it makes sense to have an LRU-style queue — and you can make *that* better too, in the sense of accommodating modern-day one-hit wonders better.

[30:02] Again, we're guided by the principles: what if we try to achieve lazy promotion and quick demotion, but in an LRU-like data structure? Some of this will look familiar — if you just walk through the animation, you'll understand what's happening.

[30:23] There's a hand that keeps moving to the next object whenever it's time to evict something. If a request hits an existing key-value you already store, you increment a bit — or clamp it to the highest value if it goes over — essentially marking that key as hot. That's the orange: you remember something as hot versus cold, the binary memory in the simplest setup.

[31:05] Here, A is marked as hot, then D is marked as hot. Now I comes in — I isn't in the queue, so you need to evict something to make space. What do you do? You only evict the *cold* objects. You save anything that's hot; you keep scanning until you get to the next cold object. So the hand keeps moving, turning hot objects into cold ones — that's recency at play. But during the time the hand moves all the way around, if some key gets visited again, it becomes hot again. So it's a bit of a race between the hand and the accesses.

[32:00] That's the whole design: you have a hand that moves — more traffic means the hand moves faster, so it always tries to keep up with demand. With more traffic and more insertions, there's a smaller time window for the traffic to warm up existing keys. That's how it balances eviction against new work.

[32:27] This whole algorithm can be implemented in about 10 lines of code — even less than S3-FIFO, because it's really just one queue. Obviously you need to be able to remove things from the middle of the queue, so it's a different implementation from FIFO. FIFO has everything laid out — I know exactly where the first and last bits are. Here you're probably looking at more of a linked-list-style queue. They work for different scenarios: this wouldn't work if you need to control the memory layout, but if you don't, it's simpler and works just as well.

[33:03] So that's the algorithm. It's an LRU algorithm, but better than traditional LRU for modern data — I should have prefaced with that.

[33:17] That's the main work — I'm skipping some — but that's the lineage: we had data, we designed a new cache/storage system, and then we came up with at least two very simple but effective eviction (cache-management) algorithms, good for different scenarios.

---

## Slide — *The quiet gospel: "What do we care about?"* · [33:42]

[33:42] One of the things I was complaining about ten years ago, before all this research, was that people were over-indexing on miss ratio and not caring about the other systems aspects. But in the end, the algorithm has to be put into a system to be useful. So let's spell it out.

[34:04] When I work with researchers, I make sure they care about the things I care about. The net effect is that they'd propose designs that would be good for minimizing miss ratio or improving hit ratio, but failed some of the other constraints — and I'd say, "no, you're not supposed to do that." A lot of what these principles were used for was just me rejecting the early designs.

[34:35] I don't think I need to convince anybody here, because most of you actually have to build systems. The first group of constraints: it needs to handle load — efficient use of resources (mostly CPU), high throughput, low latency — and it needs to scale, so that more cores let you do more work instead of being bottlenecked by a universal lock.

[34:58] The second is a different type of resource: you need to lay out key-value objects in memory, so memory overhead matters. High memory overhead means you store fewer objects for the same resources — that's not necessarily a win, even if, for the same number of objects, your hit rate is higher. It's all constraint-based. And if you want to put things onto SSD — easily 10x more storage — any design that fits onto SSD easily gives you much more capacity, and therefore probably a higher hit rate, even if it's worse for the same size. None of these are absolute. Some of the designs I mentioned earlier were very good for SSDs, but I won't go into that today.

[35:53] Finally — probably the most overlooked, or completely ignored by academia, and even used against you if you propose something simple, because people ask "what's the novelty?" — is **simplicity**. Everybody can understand it in 30 seconds. Then **generality**: you don't need to pick a different thing for every scenario. And if you can't have generality, you should at least have **configurability**, so you can adapt the design to the scenario.

[36:31] So we worked in a two-part loop: very brilliant researchers come up with designs, and my job is to go down this list and ask, "how many of these boxes have you violated?" If it's more than one or two, that's probably a no-go. It can be a frustrating experience, but as the poets say, constraints are liberating. If you can short-circuit all the bad designs early, you'll eventually find a gem — and if it ticks all the boxes, that's really the best kind of research one can do.

[37:10] Of course, the constraints have to be *real* — which is why, going all the way back, we need data. One thing I really need to preach: improving real systems is always multi-constraint and multi-objective. Anytime we find ourselves optimizing for only one or two things, there's a very good chance we're missing something — so we should go back and ask what the system is and what it needs.

---

## Part Three · The Takeaway → *Better + Simpler = Win* · [37:42]

[37:42] Now, some takeaways.

[37:48] All this research started around 2020, when our first publication came out — so, work done in 2019 — through the last publication of this batch, around 2023–2024. Call it five years. Over that multi-year span, the direction was: start from data, then from some design that's often more complicated at first, and over time do *reduction* — taking away everything that didn't feel essential — arriving at simpler and simpler designs.

[38:35] One thing people don't ask: if your job is to publish a paper and graduate within three years, it doesn't really matter too much what happens to the paper afterward. The same is true for engineers — if you launch a system and get promoted, who cares if it causes incidents two years later? But in an ideal world, you *would* care. If the point of my research is to be adopted, and the point of my system is to stay online, then what makes me more successful through that lens? You need two things, equally important: it needs to be **better**, to give people a reason to do something; and it needs to be **simpler** — or as simple as you can make it while still keeping it better — so people have fewer reasons to say no.

[39:31] You can see the things listed here — I won't read through the list. The vibe is that they got a lot of attention and adoption, and people talked about them because they could understand them. You don't see, for example, Segcache on this list, because Segcache is much more complicated and takes far more effort to implement. I did a version of the implementation, someone else did another, but very few people would go all the way and implement it.

[40:06] There's a big difference between a simpler design and a more complex one — especially in research or academia. I wouldn't want to use a complex implementation coming out of academia anyway. No offense to any current students — I just don't trust your code. So what's the point of a complex design with a badly-done complex implementation, versus a simple idea, probably with limitations (which is fine), where the idea is easily spreadable because people can understand it — and then I can adapt the idea to a complex system I'm building, if it's applicable?

[41:00] In this case, S3-FIFO got turned into one way of designing and implementing Segcache. So now Segcache also has the concept of a small queue and a large queue — it's not exactly S3-FIFO, but it's a very easy adaptation. That kind of research is valuable, because if people can understand it, they can also adapt it.

---

## Slide — *My belief* (data is king · academia + industry collaboration · a repeatable process) · [41:23]

[41:23] The other thing I hope everybody here gets the opportunity to do — regardless of your role — is a run like ours. If you're in industry, you probably have really precious data that can inspire a lot of students, instead of watching them make the wrong assumptions and waste two years implementing complex solutions for the wrong assumption. That's a tragic waste of human intelligence. So, to the extent possible, get the data out, so people have some truth to ground their thinking, and to validate their assumptions and check their results every step of the way.

[42:12] On the other hand, bringing in academics is how we got all these new designs — I would never have the time, or even the capability, to come up with all of this by myself. So there's a real opportunity for academia–industry collaboration, and you're starting to see some of that in a lot of AI systems. If you look at papers from ATC or NSDI — well, ATC is no more, but NSDI over the past few years — the systems are at such a large scale that it's almost impossible for academia to come up with even a toy setup on their own. They're now flying blind unless they can work with someone in industry.

[42:58] This is a moment where it's particularly important to encourage this kind of collaboration. A lot of the best papers I've read over the past few years came out of China, and that's because this pattern is apparently extremely popular there. If you look at a paper like Mooncake, just look at the author list: half have university affiliations, half have company affiliations, and a few have both. So this is working, and I see no reason why everybody shouldn't start doing it. There's no reason not to — well, maybe you need to convince someone higher up in your engineering organization, but I'm not here to solve that problem. I'm just saying you should try.

[43:48] I think this is a repeatable process. I've been to enough poster sessions to know people are absolutely doing wonderful work on the wrong assumptions. If you can correct that, they'll be making wonderful designs on the right assumptions. So — lots of opportunities.
