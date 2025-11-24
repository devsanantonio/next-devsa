"use client";

import React from "react";
import {
  upcomingDevsaEvent,
  featuredOnDemandEvent,
  DevsaEvent,
  OnDemandEvent,
} from "@/data/events";

function EventCard({ event, label }: { event: DevsaEvent | OnDemandEvent; label: string }) {
  if (!event) return null;

  return (
    <article className="flex flex-col justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm shadow-gray-100 sm:p-5">
      <div className="flex items-center justify-between gap-2 text-xs font-medium">
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-2.5 py-1 text-[0.65rem] uppercase tracking-wide text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ef426f]" />
          {label}
        </span>
        <span className="text-[0.7rem] text-gray-500">
          {new Date(event.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>
      <div>
        <h3 className="text-base font-semibold text-gray-900 sm:text-lg">{event.title}</h3>
        <p className="mt-1 text-xs font-medium text-gray-500">{event.location}</p>
        <p className="mt-2 text-sm text-gray-600 line-clamp-3">{event.description}</p>
      </div>
      {event.url && (
        <div className="mt-2">
          <a
            href={event.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-gray-900 px-3 py-1.5 text-xs font-medium text-gray-900 transition hover:bg-gray-900 hover:text-white"
          >
            Learn more
          </a>
        </div>
      )}
    </article>
  );
}

export function FeaturedEvents() {
  if (!upcomingDevsaEvent && !featuredOnDemandEvent) return null;

  return (
    <section className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:py-12">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">
            Featured events
          </h2>
          <p className="max-w-xl text-sm text-gray-600">
            Upcoming DEVSA-hosted experiences plus a highlighted on-demand session.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {upcomingDevsaEvent && (
            <EventCard event={upcomingDevsaEvent} label="Upcoming DEVSA event" />
          )}
          {featuredOnDemandEvent && (
            <EventCard event={featuredOnDemandEvent} label="Featured on-demand" />
          )}
        </div>
      </div>
    </section>
  );
}
