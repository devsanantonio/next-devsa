import { describe, expect, it } from 'vitest';
import { BUILD_PROMPTS, POLLS, QUESTIONS, SEASONS, promptForDay, seasonFor } from './discord-prompts';

const allPolls = [...POLLS, ...SEASONS.flatMap((s) => s.polls)];

describe('Discord prompts', () => {
  it("fits every poll inside Discord's limits", () => {
    for (const poll of allPolls) {
      expect(poll.question.length).toBeLessThanOrEqual(300);
      expect(poll.answers.length).toBeGreaterThanOrEqual(2);
      expect(poll.answers.length).toBeLessThanOrEqual(10);
      for (const a of poll.answers) expect(a.length).toBeLessThanOrEqual(55);
    }
  });

  it('keeps every message well under 2000 characters', () => {
    for (const t of [...QUESTIONS, ...BUILD_PROMPTS, ...SEASONS.flatMap((s) => [...s.questions, ...s.build])]) {
      expect(t.length).toBeLessThan(400);
    }
  });

  it('posts a question Monday and Wednesday, a poll Tuesday and Thursday, build-and-tell Friday, nothing on weekends', () => {
    // The week of 2026-09-14, outside every season
    expect(promptForDay('2026-09-14')?.kind).toBe('question');
    expect(promptForDay('2026-09-15')?.kind).toBe('poll');
    expect(promptForDay('2026-09-16')?.kind).toBe('question');
    expect(promptForDay('2026-09-17')?.kind).toBe('poll');
    expect(promptForDay('2026-09-18')?.kind).toBe('build');
    expect(promptForDay('2026-09-19')).toBeNull();
    expect(promptForDay('2026-09-20')).toBeNull();
  });

  it('does not repeat a general question for seven months', () => {
    const seen = new Set<string>();
    for (let d = Date.UTC(2026, 9, 19); d < Date.UTC(2026, 9, 19) + 30 * 7 * 86_400_000; d += 86_400_000) {
      const p = promptForDay(new Date(d).toISOString().slice(0, 10));
      if (p?.kind === 'question' && !p.season) {
        expect(seen.has(p.text)).toBe(false);
        seen.add(p.text);
      }
    }
  });

  it('leads with the "What are you into?" topics, and a season pauses them rather than skipping them', () => {
    // Monday Oct 19 is the first post; Halloween then runs Oct 20 – Nov 2.
    expect(promptForDay('2026-10-19')).toMatchObject({ kind: 'question', text: QUESTIONS[0] });
    expect(promptForDay('2026-11-03')).toMatchObject({ kind: 'poll', poll: POLLS[0] });
    expect(promptForDay('2026-11-04')).toMatchObject({ kind: 'question', text: QUESTIONS[1] });
    expect(promptForDay('2026-11-06')).toMatchObject({ kind: 'build', text: BUILD_PROMPTS[0] });
    expect(promptForDay('2026-11-09')).toMatchObject({ kind: 'question', text: QUESTIONS[2] });
  });

  it('switches to the season while it runs', () => {
    expect(seasonFor('2026-10-20')?.season.name).toBe('Halloween and Día de los Muertos');
    expect(seasonFor('2026-11-02')?.season.name).toBe('Halloween and Día de los Muertos');
    expect(seasonFor('2026-11-03')).toBeNull();
    expect(seasonFor('2026-12-25')?.season.name).toBe('Holidays');
    expect(seasonFor('2027-01-04')?.season.name).toBe('New Year');
    expect(seasonFor('2027-04-21')?.season.name).toBe('Fiesta');
  });

  it('finds Thanksgiving week however the calendar falls', () => {
    // Thanksgiving 2026 is Nov 26; 2027 is Nov 25.
    expect(seasonFor('2026-11-23')?.season.name).toBe('Thanksgiving');
    expect(seasonFor('2026-11-27')?.season.name).toBe('Thanksgiving');
    expect(seasonFor('2026-11-20')).toBeNull();
    expect(seasonFor('2026-11-30')).toBeNull();
    expect(seasonFor('2027-11-22')?.season.name).toBe('Thanksgiving');
  });

  it('never repeats a prompt inside a season', () => {
    for (const [from, to] of [
      ['2026-10-20', '2026-11-02'],
      ['2026-12-14', '2026-12-31'],
      ['2027-01-01', '2027-01-10'],
      ['2027-04-12', '2027-04-26'],
      ['2026-11-23', '2026-11-27'],
    ]) {
      const seen = new Set<string>();
      for (let d = Date.parse(`${from}T00:00:00Z`); d <= Date.parse(`${to}T00:00:00Z`); d += 86_400_000) {
        const p = promptForDay(new Date(d).toISOString().slice(0, 10));
        if (!p) continue;
        const key = p.kind === 'poll' ? p.poll.question : p.text;
        expect(seen.has(key), `${from}: ${key}`).toBe(false);
        seen.add(key);
      }
    }
  });
});
