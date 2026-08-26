"And she will always carry on  
Something is lost  
But something is found"

- Hymn to Her by Pretenders

While I do not have agentic coding all figured out, I have spent many hundreds of hours finding my way in this new world through work and play, and I'm here to share what I've learned so far with you, in particular, about doing serious work on mission critical software as professionals.

## Chapter 1: Are we losing programming?
I started coding seriously since 12 and dedicated much of my teenage years to programming contests, and felt it could be a life-long career for me early on. Being a programmer has been as much of my identity as anything else. I hope these facts give me some credibility when I say the act of writing source code as a career is rapidly disappearing, despite software being created at unprecedented pace. But! Software engineering is still very much alive even when someone else writes 100% of the code. And you still need to be good at it as a software engineer. But what that means is different now.

## Chapter 2: What's happening to software engineering?
So what *is* software engineering? Let me unwind a little bit and tell you another part of my background, and turn the clock forward by roughly a decade.

So about 15 years ago, I got my first real job at Twitter as a software engineer and thrust into the domain of distributed caching. It became abundantly clear to me that writing code that lasts was very different from writing code mostly to prove an idea. Cache was critical in every sense of the word—most of the site's traffic flows through it, and it was causing incidents left and right. Since I had never been responsible for a load-bearing production system before (first job!), I took it very seriously and quite nervously. I read the entire code base of Memcached, almost line by line, and it took me over a month. I drew charts of the connection and request state machines because the logic was confusing to me. I took many notes. I read the source code of some of the dependencies. All of that exercise helped me build a mental model of the service—its threading model, architecture, data structure used on the storage side, shape of the parser, etc. It also gave me a good idea of the coding style.

For the next few years I kept going back to that understanding, to make architectural changes, rewire a prevailing building block. To add features or to debug incidents. And then a year or two later I did very similar things with Redis. That was when I started seeing patterns through comparison, and wonder why they were different in some places and the same in others, and whether those similarities or divergences were warranted. After pondering on it for a few years, with some forks along the way, I decided I could design an encompassing framework from first principle by applying the lessons I learned. That result was the Pelikan Project. I gave a series of talks on the design principles and coding architecture of a service shaped like cache, from RPC server to storage, from configuration macros to metric library. You can summarize a 50k line code base in one sentence, and its building blocks to a chart that fits comfortably on this slide. And the devil is all in the details.

Fast forward to last December, like half of our industry, I decided to take a second, more serious look at LLM for coding. One of my projects, and yes I did several over the holidays, was called "grow-a-cache", where I tried to recreate Pelikan from scratch by just prompting LLMs. But instead of one-shotting it, I tried to follow the more natural software development trajectory which goes from POC to MVP, and onward. I chose this topic because I felt confident judging the outcome, so I could focus on the process. And after 4 milestones, I stopped. Why? Because I was more or less convinced that using LLM to write "serious software" was very much feasible, but it was not automatic. And it also became clear to me what I should do as a software engineer has to change.

## Chapter 3: What separates proper engineering from slop?
It is probably without exaggeration to say that agentic coding is a paradigm shift that triggers widespread identity crises among software professionals. But a crisis is an opportunity. It forces us to answer a fairly fundamental question: what separates software engineering from vibe coding?

Here's a parallel I kept going back to: throughout my study and career I occasionally wrote assembly-like code, in network processor SDK, CUDA, and AVX intrinsics. I expressed my thoughts in high level languages, some higher level than others, and compilers did the rest. I would have never called myself fluent in assembly, I simply never had the need to. But I was not a "vibe-assembly-writer". Because I was very careful with the kind of assembly I wanted, I was just slow at writing it by hand. While LLMs are not compilers, the cognitive offloading feels very similar to me—I'm allowed to keep my ideas at a higher level than is previously required without the intermediary, and while the translation is neither free nor perfect, overall it is an unquestionable improvement. But delegation does not obliterate one's responsibility to understand what the software is doing or what outcome should be achieved, it just changes how you obtain receipts.

There were various points in history where people were convinced that the transformative automation would bring people a life in leisure. And every time it didn't happen. Why? Because people will fill that time with other work. And I don't see how it is any different this time. Much of the hype around LLM is how you can put in very little effort to get acceptable results. That emphasis is misplaced. As engineers, it seems self-evident to me that it's much better to put in a fair amount of effort, maybe even the same amount as before, to get much better results. We all understand that to get to an average outcome is not that hard, but perfecting it takes orders of magnitude more skill and effort. We see it on all kinds of desirable properties: every extra 9 in reliability takes substantially more work, and putting a lid on tail latency is much harder than reducing median. Amateurs make something and hope for the best. Professionals enumerate goals and measure against them in a quantified manner whenever possible. Let's be professionals. 

But what does that entail, exactly?

## Chapter 4: Craft and the Joy of Understanding
Tired:
- Implement something mediocre at 10x speed
Wired:
- Help me understand the problem
- Help me explore options
- Help me cover plausible what-if scenarios

Programming is a fairly top-down, recursive process, like constructing a tree. The defining characteristic of the software engineering trade is the extreme reliance on abstraction. Or as people say, it's "turtles all the way down". With better tools, we get to skip traversal of the bottom levels. In other words, "what is known (by the models) can be done." This often means we can cut most of the busy time by going up the abstraction tree a couple of levels.

A 10%/20%/30%/40% distribution is becoming a 40%/30%/20%/10% distribution, because we are getting more and more help as the process becomes more and more deterministic.
- Understanding the nature of the problem? Unchanged but with assistance.
- Designing a solution that matches the problem? Getting easier, but a little judgement goes a long way.
- Describing all the properties the solution should satisfy? Very much a collaborative process.
- Implementing the solution? Go ahead, I'll be here waiting. Oh btw, review the solution for a few rounds, run these tests and quantify the performance before you get back to me...

#### Challenge 1
However, there is a lot of latent knowledge we acquire through the act of doing. Research shows that taking notes by hand improves knowledge retention compared to typing notes or taking no notes. The tactile feedback seems to activate the neural pathways that build durable memory. Therefore, the trouble of delegating the entire implementation is less about the code per se but more about what the process allows us to distill and retain. This loss is also at the heart of the junior engineer dilemma—without struggle there is no learning, without learning there is no growth.

But learning can be accomplished in more than one way. And it seems inevitable that we have to look for new ways to learn now, whether we are junior or senior engineers. Here are a few techniques that have worked for me:

- Create a mental model
- Visualize design, decision, and change
- Conversations about details and counterfactuals  
    While anybody can ask LLM to do a thing. Making it do it consistently is the difference between amateurs and professionals.

    (Insert Pelikan design and discussion artifacts)

    What we can now afford to deploy that was a luxury before is *Structured Curiosity*:

#### Challenge 2
That leaves us another place that makes things uncomfortable and risky. Do they work in production? It's tempting to claim that even well engineered solutions may simply fall apart under the weight of reality. Or as they say, not "battle-tested". But here I'd ask again: "why?" What's magical about running something in production. And is that magic so elusive that it cannot be captured or described? It is the wrong question to ask if agentic coding can match human-written code in production—we are underselling the machines and ourselves. The right goal is to ask just how much better agentic coding can become relatively to unassisted coding.

- Define KPI, SLO, "desirable properties"
- Declare workload characteristics
- Measure software and changes using representative workloads, tracking KPIs, compare against SLOs, and optimize on desired properties
- Just like most Rust code that compiles runs, most code that passes CI should be "production-ready" ("battle-tested" was a coping mechanism)

(Insert Pelikan benchmark and test artifacts)

What is going to safeguard outcome is *Well-defined Evaluation*.


## Chapter 5: Changing how we build
The best model I can come up with that describes what software engineering is becoming is a learning system—a setup that specifies how institutional knowledge about problems and solutions for such problems can be obtained. The most striking difference compared to how things used to be done is not about its speed, but about how such knowledge and methods are now externalized—they are no longer latent, they are the primary artifacts, at least as far as engineers are concerned. Because code, runtime behavior, resource requirements are all downstream from these artifacts, i.e. they can be obtained fairly timely and predictably. So the densest form and therefore most valuable form of our knowledge and expertise is in the hows and whys, not the whats. And it is these types of questions that we should be constantly asking.

If we accept the conclusion that increasingly we are building a self-improving system that we can guide but not directly participate in the executable or other fully-hydrated outcome, a few more corollaries fall out of our lap:

- code is not the durable artifact, methodology is
- knowing what to aim for guides all the effort that achieves it, which can be largely automated
- develop a sense of "good" is of high-value due to amplification potential, aka "taste"

Yes, the code is auto-generated, but *how* it is done is the whole game now. And that skill has a name—ladies and gentlemen, we are looking at the definition of "craft".

The skill to express the constraint and importance of the problem;  
The skill to make high-level ideas and structure accessible for a broader audience;  
The skill to systematically examine weakness and imperfections and quantify them;  
The skill to take what is measured and observed back into the understanding of the problem and start the loop over again.

They are now your tools, and you should explicitly create, curate, and iterate on them.


## Summary
There is undoubtedly serious muscle atrophy with the more mechanical and more predictable part of software engineering. Writing source code by hand is going the way of handcrafted woodwork—a hobby.

But we as professionals have little reason or time to mourn for that loss—we must carry out the task of broadening our horizon and raising the bar of software while embracing the full potential of AIML. Structured curiosity is my chosen approach, and well-defined evaluation will be my guardrail. Overall, I believe perfecting our craft—the whys and hows—is going to be the whole game.

Let's have some fun in delivering seriously good software.

## Appendix

Socializing: Software engineering is a social endeavor. Working with others remains one aspect of software engineering that has the most complicated relationship with AI. On the one hand it is now much harder to tell how much someone else cared or worked toward a seemingly competent piece of work, and therefore how much trust is deserved. On the other hand, it is always a losing battle to derive durable and bespoke signals from high-entropy artifacts like code. Perhaps it is the wrong question to ask about how AI would determine how we exchange ideas and reach agreements, but that we should decide how we exchange ideas and reach agreements mostly on our own terms, but applying AI mostly to produce higher quality artifacts to share. A well laid-out dataflow chart for every design considered used to be considered a luxury, but now it is well within reason to produce for every complex PR. Coverage of all the known edge cases at every level used to be a multi-year stretch goal for the organization, now it can be established as a development protocol that's enforced from day one. It used to take so much drudgery work to get to the point, and much of that now can be delegated, so we can focus our discussions on the meaty part.

Practical challenge: how to rein in the nondeterminism and variance. 

