/**
 * The weekday prompts posted to the DEVSA Discord by /api/discord/prompts.
 *
 * Insights showed 77 weekly visitors out of ~866 members. The Monday digest was
 * the only thing that posted, and it lands in #community-calendar — nothing gave
 * anyone a reason to open #vibe-chat or #build-and-tell. These do:
 *
 *   Mon, Wed  a question of the day          → #vibe-chat
 *   Tue, Thu  a native Discord poll          → #vibe-chat
 *   Fri       Build-and-tell Friday          → #build-and-tell
 *
 * The pick is a pure function of the San Antonio date, so there is no state to
 * keep and a retried cron posts the same thing rather than skipping ahead. Two
 * questions a week through 62 is about seven months before one repeats; polls
 * run fifteen weeks, Friday prompts twelve. Seasons (SEASONS, below) take
 * over for New Year, Fiesta, Halloween and Día de los Muertos, Thanksgiving
 * week and the holidays, and pause the general banks rather than skipping
 * through them, so the order in each list is the order things post.
 *
 * Groups and partners are spoken of, never named: a post in a public channel
 * should not single one out without their say.
 *
 * Discord's poll limits, enforced by lib/discord-prompts.test.ts: question 300
 * characters, 2–10 answers, 55 characters each.
 */

export type PromptKind = 'question' | 'poll' | 'build';

export interface DiscordPoll {
  question: string;
  answers: readonly string[];
}

/**
 * "What are you into?" — one question per topic from the spotlight video and
 * the onboarding roles, so each crowd gets a day about them. They lead
 * QUESTIONS, and the rotation starts on the first of them (EPOCH, below). The
 * topic and emoji go in the post's label.
 */
export const TOPICS: readonly { emoji: string; name: string; question: string }[] = [
  { emoji: '🤖', name: 'AI & Agents', question: 'What’s one task you’ve handed to an AI agent, and how did it go?' },
  { emoji: '🔐', name: 'Security & Hacking', question: 'What’s the cleverest hack, CTF solve or lock you’ve ever picked?' },
  { emoji: '🐍', name: 'Python', question: 'What’s the most useful Python script you’ve ever written?' },
  { emoji: '🎮', name: 'Game Dev & Unity', question: 'What game would you make if you had a team and a year?' },
  { emoji: '🌐', name: 'Web & .NET', question: 'What’s the first website you ever built, and is it still online?' },
  { emoji: '☁️', name: 'Cloud & DevOps', question: 'What’s the biggest cloud bill surprise you’ve ever had?' },
  { emoji: '📊', name: 'Data', question: 'What’s the most interesting dataset you’ve ever worked with?' },
  { emoji: '🎨', name: 'Design & UX', question: 'What’s an app with a design so good it annoys you?' },
  { emoji: '🐧', name: 'Linux & Open Source', question: 'What’s in your homelab, or what would you put in one?' },
  { emoji: '🚀', name: 'Startups', question: 'What’s a startup idea you’d build if you knew it couldn’t fail?' },
];

export const QUESTIONS: readonly string[] = [
  ...TOPICS.map((t) => t.question),
  'What’s the worst bug you ever shipped, and how long did it take to find?',
  'What was the first programming language you learned, and would you recommend it to someone starting today?',
  'What’s one tool you’d defend to the death?',
  'What’s a project you started and never finished? No judgment.',
  'What’s the best piece of advice a more experienced developer ever gave you?',
  'What’s something you learned this month that you wish you’d known a year ago?',
  'Which error message has haunted you the most?',
  'If you could only keep one browser extension, which one stays?',
  'What’s your go-to snack or drink for a long coding session?',
  'What’s the most useful thing you’ve built just for yourself?',
  'What’s a tech opinion you hold that most people would disagree with?',
  'What got you into tech in the first place?',
  'What’s the best talk or meetup session you’ve been to, and what stuck with you?',
  'Describe what you’re working on right now in five words.',
  'If you had a free weekend, what’s one thing in your life you’d automate?',
  'What’s the oldest code of yours that’s still running somewhere?',
  'Which keyboard shortcut changed your life?',
  'What’s a concept that took you forever to understand, and what finally made it click?',
  'What’s on your desk right now? Setup photos welcome.',
  'What do you name things when you don’t know what to call them yet?',
  'What would you build with a month off and no deadlines?',
  'What’s the best documentation you’ve ever read?',
  'What did you get wrong in your first technical interview?',
  'What’s a small win from this week? Tests passing count.',
  'Which side project name are you proudest of?',
  'What’s a skill outside of coding that made you a better developer?',
  'If you could mentor your day-one self, what’s the first thing you’d say?',
  'What’s your debugging ritual when nothing makes sense?',
  'What’s the strangest place you’ve written or run code?',
  'What’s one repo, newsletter or channel you’d tell every new builder to follow?',
  'What’s something you broke in production, and what did it teach you?',
  'What does your terminal prompt look like? Screenshots encouraged.',
  'What’s a tech trend you’re tired of hearing about?',
  'What’s a tech trend you think people are sleeping on?',
  'What’s the last thing you looked up that you’ve already looked up a hundred times?',
  'If your codebase were a San Antonio landmark, which one would it be?',
  'What’s a hobby project that taught you more than a class or course did?',
  'What’s the best question someone asked you at a meetup?',
  'Which game got you curious about how software works?',
  'What are you trying to learn next? Someone here might be able to help.',
  // San Antonio, the groups and the partners
  'Where in San Antonio do you get your best work done, outside of home?',
  'Best breakfast taco spot to fuel up before a meetup? Defend your pick.',
  'Which meetup on the DEVSA calendar have you been meaning to try?',
  'If you could start a new tech group in San Antonio, what would it be about?',
  'Student org folks: what does your group do that every group should copy?',
  'What would make it easier to show up to your first meetup?',
  'What’s a San Antonio problem you’d love to see someone build a fix for?',
  'Who in the San Antonio tech community helped you along the way? Give them a shoutout.',
  'What’s one thing San Antonio’s tech scene does better than anywhere else?',
  'Which kind of company, campus or organization would you love to see host a meetup?',
  'Group organizers: what’s coming up that people here should know about?',
  'What talk would you give at a San Antonio meetup if someone asked you tomorrow?',
];

export const POLLS: readonly DiscordPoll[] = [
  // The video's question, answered with the server's own onboarding roles.
  // Discord allows exactly ten answers.
  {
    question: 'What are you into?',
    answers: [
      'Python',
      'AI & Agents',
      'Security & Hacking',
      'Cloud & DevOps',
      'Data',
      'Web & .NET',
      'Game Dev & Unity',
      'Design & UX',
      'Linux & Open Source',
      'Startups',
    ],
  },
  { question: 'Tabs or spaces?', answers: ['Tabs', 'Spaces', 'Whatever the formatter says'] },
  {
    question: 'What’s your editor?',
    answers: ['VS Code', 'Cursor', 'A JetBrains IDE', 'Vim or Neovim', 'Emacs', 'Something else'],
  },
  { question: 'Dark mode or light mode?', answers: ['Dark', 'Light', 'Follows the system'] },
  {
    question: 'When do you do your best work?',
    answers: ['Early morning', 'Afternoon', 'Late night', 'Whenever the deadline is'],
  },
  {
    question: 'How do you learn a new language or framework?',
    answers: ['Official docs', 'Video courses', 'Building something right away', 'Asking an AI', 'Asking a person'],
  },
  {
    question: 'Where’s your code right now?',
    answers: ['Committed and pushed', 'Committed, not pushed', 'Uncommitted changes', 'Don’t ask'],
  },
  { question: 'How many browser tabs do you have open?', answers: ['Under 10', '10 to 30', '30 to 100', 'I’ve lost count'] },
  {
    question: 'What do you reach for first when you’re stuck?',
    answers: ['The docs', 'A search engine', 'An AI assistant', 'A rubber duck', 'A friend or coworker'],
  },
  {
    question: 'Best way to spend a Saturday?',
    answers: ['Side project', 'Hackathon', 'Meetup or workshop', 'Touching grass'],
  },
  { question: 'What do you name your main branch?', answers: ['main', 'master', 'trunk', 'I’ve never checked'] },
  {
    question: 'What’s fueling your coding?',
    answers: ['Coffee', 'Tea', 'An energy drink', 'Water, I’m hydrated'],
  },
  {
    question: 'Which would you rather fix?',
    answers: ['A CSS layout bug', 'A race condition', 'A flaky test', 'A timezone bug'],
  },
  {
    question: 'How do you feel about AI coding assistants?',
    answers: ['I use them every day', 'I use them sometimes', 'Tried them, not for me', 'Haven’t tried yet'],
  },
  { question: 'Monorepo or many repos?', answers: ['Monorepo', 'Many repos', 'Depends on the team'] },
  {
    question: 'Your first computer was a…',
    answers: ['Desktop PC', 'Laptop', 'Mac', 'School or library computer', 'Phone or tablet'],
  },
  {
    question: 'What’s the best way to land a job in tech?',
    answers: ['Referrals', 'Applying online', 'Meetups and events', 'Building in public', 'Internships'],
  },
  {
    question: 'Which event format do you like most?',
    answers: ['Talks', 'Workshops', 'Hackathons', 'Socials', 'Conferences'],
  },
  {
    question: 'How many side projects are you “working on” right now?',
    answers: ['Zero', 'One', 'Two or three', 'Four or more'],
  },
  {
    question: 'What’s the hardest part of learning to code?',
    answers: ['Getting started', 'Staying consistent', 'Debugging', 'Knowing what to build next'],
  },
  { question: 'Which would you rather debug?', answers: ['Someone else’s code', 'My own code from a year ago'] },
  {
    question: 'How do you write commit messages?',
    answers: ['Detailed', 'Short and clear', '“fix”', '“wip”, forever'],
  },
  {
    question: 'How do you keep up with tech news?',
    answers: ['Newsletters', 'Podcasts', 'YouTube', 'Social media', 'This Discord'],
  },
  {
    question: 'Best hackathon food?',
    answers: ['Pizza', 'Breakfast tacos', 'Chips and salsa', 'Whatever’s free'],
  },
  {
    question: 'Where do you work best?',
    answers: ['At home', 'In an office', 'At a coffee shop', 'Anywhere with good Wi-Fi'],
  },  {
    question: 'How many events on the DEVSA calendar have you been to this year?',
    answers: ['None yet', 'One or two', 'Three to five', 'Six or more'],
  },
  {
    question: 'Where in San Antonio should there be more tech events?',
    answers: ['Downtown', 'North side', 'South side', 'East side', 'West side', 'Online'],
  },
  {
    question: 'How do you usually get to meetups?',
    answers: ['Drive', 'Bus or VIA', 'Bike or scooter', 'Rideshare', 'I join online'],
  },
  {
    question: 'What brings you to a meetup?',
    answers: ['The talk', 'The people', 'Job leads', 'The food, honestly'],
  },
];

export const BUILD_PROMPTS: readonly string[] = [
  'What did you ship this week? A feature, a fix, a first commit. Small counts.',
  'Show us something you built this week. Half-finished counts.',
  'What’s working now that wasn’t working on Monday?',
  'Post a screenshot of what you’re building. No context required.',
  'Learned something new this week? Show us what you made while learning it.',
  'What are you building this weekend? Tell us now, show us Monday.',
  'Share a bug you squashed this week, and how you finally found it.',
  'Class project, side project or work demo: what moved forward this week?',
  'Show the before and after of something you improved this week.',
  'What did you build with a tool you’d never used before?',
  'Opened a pull request this week? Link it and tell us what it does.',
  'Show us your work in progress. Unfinished is the point.',
];

/**
 * Seasons take over the rotation while they run, then hand it back.
 *
 * `from` and `to` are inclusive `MM-DD`. Thanksgiving moves every year, so it
 * is computed instead: Monday to Friday of the week of the fourth Thursday in
 * November. Fiesta moves too, but around San Jacinto Day (April 21) every year,
 * and its copy says "Fiesta" rather than naming a day, so a fixed window holds.
 *
 * Inside a season the same Mon/Wed, Tue/Thu, Fri split applies, counted in
 * weeks from the Monday on or before the season starts. Each list is long
 * enough that nothing repeats within one season.
 */
export interface Season {
  name: string;
  /** Shown in the post's label: `-# 🎃 QUESTION OF THE DAY · SPOOKY SEASON`. */
  emoji: string;
  label: string;
  from: string;
  to: string;
  questions: readonly string[];
  polls: readonly DiscordPoll[];
  build: readonly string[];
}

export const SEASONS: readonly Season[] = [
  {
    name: 'New Year',
    emoji: '🎆',
    label: 'NEW YEAR',
    from: '01-01',
    to: '01-10',
    questions: [
      'What’s one thing you want to learn this year?',
      'What’s your tech resolution this year, and how should we hold you to it?',
      'What’s one habit from last year you’re leaving behind?',
      'Which San Antonio tech event are you hoping to make it to this year?',
    ],
    polls: [
      {
        question: 'Your tech resolution this year?',
        answers: ['Learn a new language', 'Ship a side project', 'Speak at a meetup', 'Contribute to open source', 'Go to more events'],
      },
      { question: 'How long do your resolutions usually last?', answers: ['All year', 'A few months', 'Until February', 'Resolutions?'] },
      {
        question: 'Which would you most like to try this year?',
        answers: ['Giving a talk', 'A hackathon', 'Mentoring someone', 'Volunteering at an event'],
      },
      { question: 'Back at it this week?', answers: ['Fully back', 'Easing in', 'Still on break', 'Never left'] },
    ],
    build: [
      'First build-and-tell of the year: show us what you made over the break.',
      'New year, new build: what are you starting this year?',
    ],
  },
  {
    name: 'Fiesta',
    emoji: '🎉',
    label: '¡VIVA FIESTA!',
    from: '04-12',
    to: '04-26',
    questions: [
      'If your current project earned a Fiesta medal, what would it look like?',
      'Which Fiesta food would make the best name for a programming language?',
      'What San Antonio tradition would make a great hackathon theme?',
      'If you could build one app for Fiesta-goers, what would it do?',
      'Fiesta or fixing that bug: what wins this weekend?',
    ],
    polls: [
      { question: 'Best Fiesta food?', answers: ['Chicken on a stick', 'Corn in a cup', 'Gorditas', 'Funnel cake', 'Turkey legs'] },
      { question: 'How many Fiesta medals do you own?', answers: ['None yet', 'A few', 'A whole sash', 'I make my own'] },
      { question: 'Cascarones: yes or no?', answers: ['Yes, crack them all', 'Only on friends', 'Absolutely not'] },
      {
        question: 'Favorite Fiesta parade?',
        answers: ['Battle of Flowers', 'Fiesta Flambeau', 'Texas Cavaliers River Parade', 'I skip the crowds'],
      },
    ],
    build: [
      'Show us what you built between parades.',
      'Show us a project you’d pin a Fiesta medal on.',
      'Fiesta’s wrapping up: what did you ship while the city partied?',
    ],
  },
  {
    name: 'Halloween and Día de los Muertos',
    emoji: '🎃',
    label: 'SPOOKY SEASON',
    from: '10-20',
    to: '11-02',
    questions: [
      'What’s the scariest thing you’ve ever found in a codebase?',
      'What bug still haunts you? Tell it like a ghost story.',
      'If your tech stack dressed up for Halloween, what would it go as?',
      'What’s the most cursed code you’ve ever written on purpose?',
      'For Día de los Muertos: which retired technology deserves a spot on the ofrenda?',
      'What’s your best horror story from a deploy that went wrong?',
    ],
    polls: [
      {
        question: 'Scariest thing to find on a Friday afternoon?',
        answers: ['A failing deploy', 'A 500-file merge conflict', 'No tests', 'A “quick question” at 4:59'],
      },
      { question: 'Best Halloween costume for a developer?', answers: ['A rubber duck', 'A 404 page', 'The cloud', 'A segfault'] },
      { question: 'Which haunts you more?', answers: ['Legacy code', 'Undocumented APIs', 'Flaky tests', 'Timezones'] },
      {
        question: 'Best fuel for a late-night debugging session?',
        answers: ['Halloween candy', 'Pan de muerto', 'Coffee, black as the void', 'Leftover pizza'],
      },
    ],
    build: [
      'Show us what you built this week, especially if it’s held together with duct tape.',
      'Show us a project you brought back from the dead this week.',
      'Halloween’s over: show us the build that survived it.',
    ],
  },
  {
    name: 'Thanksgiving',
    emoji: '🦃',
    label: 'THANKSGIVING WEEK',
    from: 'thanksgiving',
    to: 'thanksgiving',
    questions: [
      'Which open source project are you most thankful for?',
      'Who in the San Antonio tech community are you thankful for this year, and why? Tag them if they’re here.',
    ],
    polls: [
      {
        question: 'What are you most thankful for this year?',
        answers: ['A good mentor', 'A great team', 'Free tiers', 'Answers on a forum from 2012'],
      },
      {
        question: 'Thanksgiving week plans?',
        answers: ['Unplugging completely', 'Side project time', 'Working through it', 'Explaining my job to relatives'],
      },
    ],
    build: ['Black Friday edition: skip the lines and show us what you built this week. Leftovers welcome.'],
  },
  {
    name: 'Holidays',
    emoji: '🎄',
    label: 'HOLIDAY EDITION',
    from: '12-14',
    to: '12-31',
    questions: [
      'What’s on your tech wish list this year?',
      'What’s the best thing you built or learned this year?',
      'Which San Antonio tech event was your favorite this year?',
      'What gift would you give your younger developer self?',
      'Tamales, the lights on the River Walk, or code freeze: what are you looking forward to most this month?',
      'Who helped you grow the most this year? Give them a shoutout.',
    ],
    polls: [
      { question: 'Code freeze over the holidays?', answers: ['Strict freeze', 'Small fixes only', 'Shipping on Christmas Eve', 'What freeze?'] },
      {
        question: 'Best holiday break project?',
        answers: ['Learning something new', 'Finishing a side project', 'Cleaning up old repos', 'No code, just rest'],
      },
      { question: 'Tamales: which kind?', answers: ['Pork', 'Chicken', 'Bean and cheese', 'Sweet', 'All of them'] },
      { question: 'How was your year in tech?', answers: ['Best one yet', 'Steady', 'Rough, but I learned a lot', 'Ask me in January'] },
      {
        question: 'How many unread notifications are you taking into the new year?',
        answers: ['Under 10', '10 to 100', '100 to 1,000', 'I declared bankruptcy'],
      },
      {
        question: 'What did you learn the most about this year?',
        answers: ['A new language', 'A new framework', 'AI tools', 'Working with people', 'Asking for help'],
      },
    ],
    build: [
      'Show us something you shipped this year that you’re proud of.',
      'Show us your holiday break project, even if it’s just a plan.',
      'Last Friday of the year: post your favorite build from this year.',
    ],
  },
];

/**
 * The Monday the general banks start from: the first day these posted, so each
 * list runs from its top. Moving it restarts every list.
 */
const EPOCH = Date.UTC(2026, 9, 19);
const DAY = 86_400_000;

const dayNumber = (dayKey: string) => Math.round((Date.parse(`${dayKey}T00:00:00Z`) - EPOCH) / DAY);
const dayKeyOf = (day: number) => new Date(EPOCH + day * DAY).toISOString().slice(0, 10);
const weekdayOf = (day: number) => ((day % 7) + 7) % 7; // 0 = Monday
const KIND_BY_WEEKDAY: readonly (PromptKind | null)[] = ['question', 'poll', 'question', 'poll', 'build', null, null];

/** Monday and Friday of Thanksgiving week, as day numbers. */
function thanksgivingWeek(year: number): [number, number] {
  const nov1 = new Date(Date.UTC(year, 10, 1)).getUTCDay(); // 0 = Sunday
  const thursday = 1 + ((4 - nov1 + 7) % 7) + 21;
  const key = `${year}-11-${String(thursday).padStart(2, '0')}`;
  return [dayNumber(key) - 3, dayNumber(key) + 1];
}

/** The season running on a date, and the day number it started on. */
export function seasonFor(dayKey: string): { season: Season; start: number } | null {
  const year = +dayKey.slice(0, 4);
  const day = dayNumber(dayKey);
  for (const season of SEASONS) {
    const [start, end] =
      season.from === 'thanksgiving'
        ? thanksgivingWeek(year)
        : [dayNumber(`${year}-${season.from}`), dayNumber(`${year}-${season.to}`)];
    if (day >= start && day <= end) return { season, start };
  }
  return null;
}

/**
 * How many general-bank posts of this kind went out before `day`. Season days
 * are not counted, so a season pauses the bank and it resumes where it left
 * off. A loop over the days since EPOCH: a few hundred a year, nothing to keep.
 */
function generalIndex(day: number, kind: PromptKind): number {
  let n = 0;
  for (let d = 0; d < day; d++) {
    if (KIND_BY_WEEKDAY[weekdayOf(d)] === kind && !seasonFor(dayKeyOf(d))) n++;
  }
  return n;
}

/**
 * What to post on a San Antonio date (`YYYY-MM-DD`), or null on a weekend.
 *
 * Outside a season, each bank posts in list order from EPOCH. In a season the
 * week counts from the season's own first Monday, so its list starts at the
 * top whatever weekday it opens on: Monday and Wednesday take consecutive
 * questions, Tuesday and Thursday consecutive polls.
 */
export type DayPrompt =
  | { kind: 'question'; text: string; season?: Season; topic?: (typeof TOPICS)[number] }
  | { kind: 'poll'; poll: DiscordPoll; season?: Season }
  | { kind: 'build'; text: string; season?: Season };

export function promptForDay(dayKey: string): DayPrompt | null {
  const day = dayNumber(dayKey);
  const weekday = weekdayOf(day);
  const kind = KIND_BY_WEEKDAY[weekday];
  if (!kind) return null;
  const at = <T,>(list: readonly T[], i: number) => list[((i % list.length) + list.length) % list.length];

  const found = seasonFor(dayKey);
  if (found) {
    const { season } = found;
    const week = Math.floor((day - (found.start - weekdayOf(found.start))) / 7);
    if (kind === 'question') return { kind, text: at(season.questions, week * 2 + weekday / 2), season };
    if (kind === 'poll') return { kind, poll: at(season.polls, week * 2 + (weekday - 1) / 2), season };
    return { kind, text: at(season.build, week), season };
  }

  const n = generalIndex(day, kind);
  if (kind === 'question') {
    const text = at(QUESTIONS, n);
    return { kind, text, topic: TOPICS.find((t) => t.question === text) };
  }
  if (kind === 'poll') return { kind, poll: at(POLLS, n) };
  return { kind, text: at(BUILD_PROMPTS, n) };
}
