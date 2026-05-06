// date     | title                                | event                                          | recordingUrl
// Editable as a markdown table — just add/remove/reorder rows.
// `date` is ISO YYYY-MM-DD; use the event date or a reasonable approximation.

export interface Talk {
	date: string;
	title: string;
	event: string;
	recordingUrl: string;
}

function parseTable(md: string): Talk[] {
	const lines = md
		.trim()
		.split("\n")
		.filter((l) => l.trim());
	const headers = lines[0]
		.split("|")
		.map((h) => h.trim())
		.filter(Boolean);
	return lines.slice(2).map((line) => {
		const values = line
			.split("|")
			.map((v) => v.trim())
			.filter(Boolean);
		return Object.fromEntries(headers.map((h, i) => [h, values[i]])) as unknown as Talk;
	});
}

export const conferenceTalks: Talk[] = parseTable(`
| date       | title                                                      | event                                      | recordingUrl                                                                                                                     |
|------------|------------------------------------------------------------|--------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| 2026-03-01 | Why I Left Big-O in the Dustbin When I Left School         | Unlocked Conf, San Jose, 2026              | https://www.youtube.com/watch?v=ZeI4apdgupg                                                                                      |
| 2025-12-01 | Beyond Line Charts                                         | YOW! Melbourne/Brisbane/Sydney, 2025       | https://www.youtube.com/watch?v=vUu4s2vQne0                                                                                      |
| 2023-10-02 | Effective Performance Engineering at Twitter-Scale         | QCon San Francisco, 2023                   | https://www.infoq.com/presentations/performance-engineering-scale/                                                               |
| 2023-06-01 | Evolution: From Distributed Cache to Feature Store         | MoCon, Seattle, 2023                       | https://www.youtube.com/watch?v=K_W_DZ07hwo                                                                                      |
| 2020-01-22 | Using Persistent Memory with Pelikan                       | Persistent Memory Summit, Santa Clara 2020 | https://www.youtube.com/watch?v=leaIWRk_2bY                                                                                      |
| 2016-11-07 | In-Memory Caching: Curb Tail Latency with Pelikan          | QCon San Francisco, 2016                   | https://www.infoq.com/presentations/pelikan-distributed-caching/                                                                 |
| 2015-09-24 | Cache à la Carte: A Framework for In-Memory Caching        | Strange Loop, St. Louis, 2015              | https://www.youtube.com/watch?v=pLRztKYvMLk                                                                                      |
| 2014-01-01 | Scaling Redis at Twitter                                   | Meetup at Rackspace, San Francisco, 2014   | https://www.youtube.com/watch?v=rP9EKvWt0zo                                                                                      |
`);

export const podcastsInterviews: Talk[] = parseTable(`
| date       | title                                                                              | event                            | recordingUrl                                                                                                       |
|------------|------------------------------------------------------------------------------------|----------------------------------|--------------------------------------------------------------------------------------------------------------------|
| 2026-02-01 | Steve Waldman and Yao Yue Explore Complexity in Computing Systems and Economics    | Complex Spice (Spice Labs), 2026 | https://www.youtube.com/watch?v=sabwTPxfVgU                                                                        |
| 2023-01-12 | Caching at Twitter                                                                 | Software Engineering Daily, 2023 | https://softwareengineeringdaily.com/2023/01/12/caching-at-twitter-with-yao-yue/                                   |
| 2022-01-01 | Momento, the World's Fastest Cache                                                 | Open Source Startup Podcast 2022 | https://creators.spotify.com/pod/profile/ossstartuppodcast/episodes/E49-Momento--the-Worlds-Fastest-Cache-e1nf7ec  |
| 2021-01-01 | Twitter's Yao Yue on Latency, Performance Monitoring, & Caching at Scale           | InfoQ Podcast                    | https://www.infoq.com/podcasts/yao-yue-twitter-cache/                                                              |
| 2020-01-01 | Yao Yue on Making Twitter's Pelikan Cache Fast And Reliable                        | InfoQ Interview                  | https://www.infoq.com/interviews/yue-twitter-pelikan-cache/                                                        |
| 2022-06-01 | Cache-it #1: Applying Lessons from Caching to ML Feature Stores                    | Momento                          | https://www.gomomento.com/blog/cache-it-episode-1-applying-lessons-from-caching-to-ml-feature-stores-with-yao-yue/ |
`);
