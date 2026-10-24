# Contributing to next-devsa

This is the source of [devsa.community](https://www.devsa.community). Thanks for helping. The DEVSA-wide guide is [here](https://github.com/devsanantonio/.github/blob/main/.github/CONTRIBUTING.md); this page is what's specific to this repo.

## Good first issues

Issues labeled [`good first issue`](https://github.com/devsanantonio/next-devsa/labels/good%20first%20issue) are small, self-contained, and say where to look. Comment on one before you start so two people don't take the same one.

## Running it

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Most features fail soft without their keys, so many changes, such as copy, layout, components and lint fixes, can be made and checked without any credentials. Pages that read events, communities or partners need a Firebase project; if your issue needs one, say so on the issue and we'll help.

## Checking your change

- **`pnpm build` is the real gate.** There's no broad test suite, so the build is what catches a broken change. Run it before opening a pull request.
- **`pnpm lint` already fails on `main`,** on a handful of existing errors. That doesn't mean you broke something. Compare against `main`, and don't add new errors. Fixing the existing ones is a good first issue in itself.
- **Look at it.** For anything visual, check a phone width and a desktop width, and put screenshots in the pull request.

## Before you restyle anything

The site has no component library: each section hardcodes its own classes, and consistency comes from following the written design system. Read [.claude/skills/design-system/SKILL.md](.claude/skills/design-system/SKILL.md) before adding or restyling a section. It has the type scale, the two eyebrow styles, the card shape and the color contrast minimums.

## Pull requests

Say what you changed, why, and how you checked it. Small and focused beats large and sweeping. First pull request ever? Say so, and we'll walk through anything unfamiliar with you.
