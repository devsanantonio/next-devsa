import { describe, expect, it } from 'vitest';
import { defaultSlugPreview, invalidCustomSlug, slugify } from './event-slug-shared';

describe('event addresses', () => {
  it('turns a title into a readable address', () => {
    expect(slugify("It's Kinda Like Dune: A Look Into The Shai-Hulud Malware")).toBe(
      'it-s-kinda-like-dune-a-look-into-the-shai-hulud-malware'
    );
    expect(slugify('Geeks && {...} Tech Tuesdays')).toBe('geeks-and-tech-tuesdays');
    expect(slugify('Café Código')).toBe('cafe-codigo');
  });

  it('dates the default in San Antonio time, not UTC', () => {
    // 8:30 PM Thursday Oct 22 in San Antonio is already Oct 23 in UTC.
    expect(defaultSlugPreview('Spooky Hour', '2026-10-23T01:30:00.000Z')).toBe('spooky-hour-oct-22');
    expect(defaultSlugPreview('Tech Tuesdays', '2026-10-20T14:00:00.000Z')).toBe('tech-tuesdays-oct-20');
  });

  it('accepts a well-formed custom address', () => {
    expect(invalidCustomSlug('organizer-roundtable')).toBeNull();
    expect(invalidCustomSlug('pysanantonio-meetup-november')).toBeNull();
  });

  it('refuses a malformed custom address', () => {
    expect(invalidCustomSlug('ab')).toMatch(/3 to 80/);
    expect(invalidCustomSlug('Has Spaces')).toMatch(/lowercase/);
    expect(invalidCustomSlug('double--hyphen')).toMatch(/lowercase/);
    expect(invalidCustomSlug('-leading')).toMatch(/lowercase/);
  });

  it("refuses the site's own pages under /events", () => {
    for (const page of ['pysanantonio', 'the-model', 'access-granted', 'morehumanthanhuman', 'zero-to-agent', 'embed']) {
      expect(invalidCustomSlug(page)).toMatch(/own pages/);
    }
  });
});
