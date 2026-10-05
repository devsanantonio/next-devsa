"use client"

import { motion } from "motion/react"
import Image from "next/image"
import { Handshake, Mail, ArrowUpRight } from "lucide-react"

/**
 * The worked example this block never had.
 *
 * It ran four bullets under "Ways We Partner" — "Collaborative workshops &
 * training series", "Co-branded conferences and events", "Programs reaching
 * 20+ tech communities", "Custom collaborations with local builders". A
 * capabilities list, which is the register /buildingtogether's How It Works
 * deliberately avoided: "said as a list of capabilities it would read as
 * marketing; said as one thing that happened, with the dates and the terms
 * attached, it is checkable". The one block on this site asking a company for
 * a partnership was showing them nothing that had happened.
 *
 * They were also redundant. The paragraph to the left already says workshops,
 * conferences and recurring activations, and the third bullet still said "20+"
 * against a Firestore count of twenty-three.
 *
 * SheBuilds is the right example for *this* audience, which is why it is here
 * and not in How It Works. That section speaks to community groups and its
 * example, Give-a-LOT, is in their shape — a local group ran a session and
 * DEVSA opened a door. This speaks to partners and sponsors, and SheBuilds is
 * in theirs: a global initiative needed a city's builders in a room, and DEVSA
 * was the community partner. One example per audience, rather than two in one
 * section diluting both.
 *
 * ## Which frame, and why not the other five
 *
 * Four of the six photographs from that day are unusable here, and only two
 * for reasons a person would guess:
 *
 *   · 8O8A0081 — a builder laughing at a laptop, and the best match for this
 *     heading. It is already /photos/lane-shebuilds.webp on the homepage.
 *   · 8O8A0023 and its monochrome twin — the room with the event slide in it.
 *     Already /hero/shebuilds.webp in the homepage marquee.
 *   · IMG_9314 — Laura at her laptop with the Lovable interface projected
 *     behind her, which documents the Anthropic and Stripe credits this
 *     paragraph claims. A phone frame among five from a camera, and it shows.
 *
 * So: 8O8A0032. Laura in conversation with an attendee, a builder at a laptop
 * behind them, the coffee house's chalkboard wall placing it where the copy
 * says it happened.
 *
 * A perceptual hash did not catch the 8O8A0081 collision — it scored 49/256
 * against the homepage crop, comfortably "different", because the two are
 * different crops of one frame. That is the third time in this repo a hash has
 * passed something an eye caught immediately. Check a candidate by looking at
 * what is already shipped, not by measuring it.
 *
 * One consequence worth being aware of rather than discovering: the earlier
 * crop had the event slide in it, legible, so the picture corroborated the
 * sentence beside it. It does not any more. The paragraph stands on its own,
 * with Laura's link the only thing in it a reader can follow.
 */
const SHE_BUILDS = {
  /* The filename carries the frame, because this asset has now been three
     different pictures: a 16:9 card header, a 0.95:1 crop with the event slide
     in it, and this one. The first two kept the same name, so the URL never
     changed and Next's image optimizer went on serving the bytes it had
     already cached — the page looked unchanged while the file on disk was
     correct, which is the second time that has happened in this repo.
  
     Carrying the frame id makes the rule self-enforcing: a different frame
     cannot keep this name. */
  photo: "/photos/shebuilds-8o8a0032.webp",
  photoWidth: 1300,
  photoHeight: 1529,
  /* No link on the name. It had one — the Luma page — from when SheBuilds had
     no evidence anywhere on this site and the claim needed somewhere to point.
     The photograph above replaced that: its slide names Lovable, Anthropic,
     the date, the city, Berry to Bean, Suitcase Coder and DEVSA, which
     corroborates the sentence better than a registration page for an event
     that has already happened. Sending a prospective partner off-site, to a
     closed signup, from the one block asking them to get in touch, is a cost
     with nothing left on the other side of it.

     Laura keeps her link, because that is a credit rather than a citation —
     the person who taught it, pointed at her own platform. */
  teacherUrl: "https://www.linkedin.com/in/lauraruizroehrs/",
} as const

/**
 * The partner ask, pointed at the same people every other block is.
 *
 * Partners want access to the active builders. The groups want to be found by
 * them. The builders want to find the groups, and the learners coming up
 * behind them. Those are three different asks with one object, and DEVSA is
 * the channel they meet on — so this block, MeetTheTeam and DonationCta all
 * name that object rather than each describing a different organization.
 *
 * `communityCount` is passed in rather than written here. This said "20+ tech
 * communities" while Firestore held twenty-three, which is the same hardcoded
 * count that let the footer publish nine of them.
 */
export function PartnerCta({ communityCount }: { communityCount?: number }) {
  return (
    <section
      id="partner"
      className="bg-black border-b border-gray-800 scroll-mt-20"
      data-bg-type="dark"
    >
      <div className="page-shell py-16 sm:py-20 md:py-24 lg:py-28">
        {/* The text column takes the extra width, not the card.
        
            At an even split the column lands near 590px, and "Reach the
            People" does not fit on one line in it at any size this heading
            runs — so the two-line break below became a three-line one. The
            card had width to spare: its photograph and five short sentences
            read fine narrower. */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.12fr_1fr] lg:gap-20">
          {/* Left: intro text */}
          <motion.div
            initial={{ y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl"
          >
            <div className="space-y-4">
              <p className="text-sm md:text-base font-medium text-white/40 uppercase tracking-[0.2em]">
                Partner with DEVSA
              </p>
              {/* Two lines, broken deliberately rather than left to wrap.
              
                  "Reach the People" is the ask and "Doing the Work" is the
                  qualifier the whole block turns on — the paragraph below it
                  spends its length on that distinction ("you already have the
                  relationships at the director and executive level; this is the
                  other altitude"). Letting the two run together put the break
                  wherever the column happened to end, which on most widths
                  landed mid-phrase.
              
                  `block` rather than a <br />, so each line is still one
                  element and can wrap inside itself on a narrow screen without
                  the pair coming apart. */}
              {/* Stops at 6xl, where most marketing h2 on this site run on to
                  xl:text-7xl. That ramp assumes a full-width heading; this one
                  lives inside a grid cell about half the shell wide, and at
                  72px "Reach the People" cannot fit on one line in it however
                  the column is divided. HowWeHelp, the section directly above
                  and the only other constrained heading on this page, already
                  stops at 6xl for the same reason — so this matches its real
                  neighbour rather than the general rule. */}
              <h2 className="font-sans text-white leading-[0.95] text-4xl md:text-5xl lg:text-6xl font-black tracking-[-0.02em]">
                <span className="block">Reach the People</span>
                <span className="block">
                  <span className="text-white/50 font-light italic">Doing</span>{" "}
                  the Work.
                </span>
              </h2>
            </div>

            <div className="space-y-6 max-w-5xl mt-8">
              <p className="text-xl md:text-2xl text-white/70 leading-[1.4] font-light">
                Workshops, conferences and recurring activations,{" "}
                <strong className="font-semibold text-white">
                  co-designed with DEVSA
                </strong>
                , putting you in front of the active builders across{" "}
                {communityCount ? `${communityCount} ` : ""}community groups in
                San&nbsp;Antonio.
              </p>
              {/* The distinction that makes this worth a partner's time, and
                  it was missing.
          
                  "Reaching 20+ communities" on its own is the vocabulary of a
                  lead list, which is the one thing DEVSA is not. What it
                  actually offers is a different altitude: partners already have
                  the director and executive relationships in these industries.
                  What they do not have is the frontline — the engineers,
                  analysts, designers and students doing the work — and that is
                  who DEVSA is made of. Saying so is both more honest and a
                  better argument. */}
              <p className="text-base md:text-lg text-white/55 leading-relaxed">
                You already have the relationships at the director and executive
                level. This is the other altitude — the engineers, analysts,
                designers and students doing the work day to day, in the same
                industries. Let&apos;s design something together.
              </p>
            </div>

            {/* The worked example, then the ask. A reader should know one thing
                DEVSA has actually done before being invited to email. */}
            <div className="mt-10 border-t border-white/10 pt-8">
              <p className="text-xs md:text-sm font-medium text-white/40 uppercase tracking-[0.15em]">
                What That Looks Like
              </p>
              <p className="mt-4 max-w-2xl text-base md:text-lg text-white/70 leading-relaxed">
                <strong className="font-semibold text-white">SheBuilds</strong>{" "}
                ran worldwide on International Women&apos;s Day. Lovable started
                it. Anthropic and Stripe put the credits in people&apos;s hands.{" "}
                <a
                  href={SHE_BUILDS.teacherUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-white underline underline-offset-4 decoration-white/30 transition-colors hover:decoration-white/70"
                >
                  Laura Ruiz-Roehrs
                </a>{" "}
                taught it. Berry to Bean opened on a Sunday. DEVSA brought
                San&nbsp;Antonio&apos;s builders — and they shipped.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="mailto:jesse@devsanantonio.com?subject=Partner%20with%20DEVSA"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#ef426f] px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#d93a62]"
                >
                  <Handshake className="h-5 w-5" />
                  Partner With Us
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
                <a
                  href="mailto:jesse@devsanantonio.com?subject=Sponsor%20a%20DEVSA%20event"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/6 px-6 py-3.5 text-sm font-medium text-white transition-all hover:border-white/20 hover:bg-white/10 md:text-base"
                >
                  <Mail className="h-4 w-4" />
                  Sponsor an Event
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right: the photograph, full height.

              This was a card holding the example, the credit and both buttons,
              with the left column carrying only a heading and two paragraphs —
              so the text ran out around 450px against a card reaching 765 and
              left the same hole under it that How It Works had.

              Same fix as there, for the same reason: everything the reader has
              to read goes in one column, and the photograph stretches to meet
              whatever height that lands at. The content was already in the
              wrong place anyway — the ask and the evidence for it belong in
              the reading column, not beside it. */}
          <motion.div
            initial={{ y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:h-full"
          >
            <figure className="overflow-hidden rounded-2xl border border-white/10 bg-black lg:h-full">
              <Image
                src={SHE_BUILDS.photo}
                alt="Laura Ruiz-Roehrs in conversation with an attendee at SheBuilds, a builder working at a laptop behind them"
                width={SHE_BUILDS.photoWidth}
                height={SHE_BUILDS.photoHeight}
                sizes="(max-width: 1024px) 100vw, 620px"
                className="aspect-4/5 w-full object-cover lg:aspect-auto lg:h-full"
              />
            </figure>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
