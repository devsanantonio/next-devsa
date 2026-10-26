"""Build the schedule for the /localhost VIA game: Route 4, northbound from downtown.

    python3 scripts/build-via-game.py [path/to/google_transit.zip]

Writes public/localhost/via-route-4.json. Without a path it downloads VIA's
published GTFS (the server refuses requests without a User-Agent).

The game races you against a real Route 4 trip: Navarro & Houston, a block from
Geekdom, up Navarro and San Pedro to North Star Transit Center. Everything it
needs is here: each stop and its distance along the route, every northbound
trip's scheduled times at those stops for each service day, and the holiday
exceptions.

Distances are miles from Navarro & Houston (the stop behind it, where the bus
starts, is negative). Times are seconds after midnight of the service day; GTFS
runs past 24:00 for trips after midnight.

Data provided by VIA Metropolitan Transit.
"""
import csv, io, json, os, sys, urllib.request, zipfile

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "localhost", "via-route-4.json")
GTFS = "https://www.viainfo.net/BusService/google_transit.zip"
ROUTE, DIRECTION = "4", "0"
START = "81526"   # NAVARRO & HOUSTON
SERVICES = {"342.0.1": "weekday", "342.0.2": "saturday", "342.0.3": "sunday"}
SMALL = {"&", "of", "in", "at", "and"}
KEEP = {"S.A.C.": "S.A.C.", "N.": "N.", "BTWN": "between", "BET.": "between", "BETWEEN": "between",
        "OPPOSITE": "opposite", "IN": "in", "FRONT": "front", "MCILVAINE": "McIlvaine"}
# VIA's stop names are cut off at 35 characters; these are the ones on this route that lost something.
NAMES = {"27246": "San Pedro between Huisache & Mulberry", "27146": "San Pedro & Jeanette",
         "17156": "San Pedro in front of North Towne Plaza"}


def title(name):
    words = []
    for w in name.split():
        if w.upper() in KEEP and (words or w.upper() in {"S.A.C.", "N."}):
            words.append(KEEP[w.upper()])
        elif w.lower() in SMALL and words:
            words.append(w.lower())
        else:
            words.append("-".join(p[:1].upper() + p[1:].lower() for p in w.split("-")))
    return " ".join(words)


def sec(t):
    h, m, s = map(int, t.split(":"))
    return h * 3600 + m * 60 + s


def main():
    if len(sys.argv) > 1:
        z = zipfile.ZipFile(sys.argv[1])
    else:
        req = urllib.request.Request(GTFS, headers={"User-Agent": "localhost:210 (devsa.community)"})
        z = zipfile.ZipFile(io.BytesIO(urllib.request.urlopen(req, timeout=300).read()))
    rows = lambda n: csv.DictReader(io.TextIOWrapper(z.open(n), encoding="utf-8-sig"))

    feed = next(rows("feed_info.txt"))
    route = next(r for r in rows("routes.txt") if r["route_short_name"] == ROUTE)
    stops = {s["stop_id"]: s for s in rows("stops.txt")}
    trips = {t["trip_id"]: t for t in rows("trips.txt") if t["route_id"] == route["route_id"] and t["direction_id"] == DIRECTION}
    times = {}
    for st in rows("stop_times.txt"):
        if st["trip_id"] in trips:
            times.setdefault(st["trip_id"], []).append(st)

    pattern, out_trips = None, {v: [] for v in SERVICES.values()}
    for tid, st in times.items():
        st.sort(key=lambda r: int(r["stop_sequence"]))
        ids = [r["stop_id"] for r in st]
        if START not in ids:
            continue
        i = ids.index(START) - 1                       # start the bus one stop behind you
        ids, st = ids[i:], st[i:]
        if pattern is None:
            pattern = (ids, st)
        if ids != pattern[0]:
            raise SystemExit(f"trip {tid} runs a different pattern; the game assumes one")
        service = SERVICES.get(trips[tid]["service_id"])
        if service:
            out_trips[service].append([tid, [sec(r["arrival_time"]) for r in st]])
    for v in out_trips.values():
        v.sort(key=lambda t: t[1][1])

    ids, st = pattern
    d0 = float(st[1]["shape_dist_traveled"])
    stop_list = [{"id": s, "name": NAMES.get(s) or title(stops[s]["stop_name"]), "d": round(float(r["shape_dist_traveled"] or 0) - d0, 4)}
                 for s, r in zip(ids, st)]
    stop_list[0]["d"] = round(float(st[0]["shape_dist_traveled"] or 0) - d0, 4)

    exceptions = {}
    for r in rows("calendar_dates.txt"):
        if r["exception_type"] == "1" and r["service_id"] in SERVICES:
            exceptions[r["date"]] = SERVICES[r["service_id"]]
    cal = next(r for r in rows("calendar.txt") if r["service_id"] in SERVICES)

    data = {
        "feed": {"version": feed["feed_version"], "start": cal["start_date"], "end": cal["end_date"], "url": GTFS},
        "route": {"short": route["route_short_name"], "long": route["route_long_name"], "headsign": trips[pattern[1][0]["trip_id"]]["trip_headsign"],
                  "color": "#" + route["route_color"]},
        "stops": stop_list,
        "trips": out_trips,
        "exceptions": exceptions,
    }
    with open(OUT, "w") as f:
        json.dump(data, f, separators=(",", ":"))
    print(f"{len(stop_list)} stops, {sum(map(len, out_trips.values()))} trips, "
          f"{os.path.getsize(OUT) / 1024:.0f} KB -> {OUT}")


if __name__ == "__main__":
    main()
