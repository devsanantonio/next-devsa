"""Build the "where we meet" layer for /localhost from DEVSA's own calendar.

    python3 scripts/build-community.py

Reads the public calendar (/api/events), the 25 community groups and DEVSA's
partners from www.devsa.community, locates every in-person venue with the U.S.
Census Bureau geocoder, and writes public/localhost/community.json: one dot per
venue, with how many meetups it has hosted and which groups met there.

This is a snapshot, stamped with the date it was built, not a live view: the
calendar changes daily and geocoding every venue on every page view would be
slow and rude to the Census service. Re-run it to refresh.

Venues the geocoder can't place (highway frontage roads, typos) are skipped and
listed when the script runs, so they can be fixed in the admin.
"""
import collections, datetime, json, os, re, urllib.parse, urllib.request

SITE = "https://www.devsa.community"
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "localhost", "community.json")
CENSUS = "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress"
# Partner sites people visit, located by street address. Partners without a public site stay off the map.
PARTNER_SITES = {"geekdom": "110 E Houston St, San Antonio, TX 78205", "launchsa": "600 Soledad St, San Antonio, TX 78205",
                 "project-quest": "203 Norton St, San Antonio, TX 78226"}
_cache = {}


def fetch(path):
    with urllib.request.urlopen(SITE + path, timeout=60) as r:
        return json.load(r)


def clean(addr):
    a = re.sub(r"\s*·\s*", ", ", addr)
    a = re.sub(r"(?i)\s*[-,]?\s*\b(\d+(st|nd|rd|th)\s+floor|suite\s*\S+|ste\.?\s*\S+|#\s*\S+)", "", a)
    return a.replace("Hostin", "Houston").strip(" ,.")


def geocode(addr):
    a = clean(addr)
    tries = [a] if re.search(r"(?i)\btx\b|texas", a) else [a + ", San Antonio, TX", a + ", TX"]
    for t in tries:
        if t in _cache:
            return _cache[t]
        url = CENSUS + "?" + urllib.parse.urlencode({"address": t, "benchmark": "Public_AR_Current", "format": "json"})
        try:
            with urllib.request.urlopen(url, timeout=60) as r:
                m = json.load(r)["result"]["addressMatches"]
        except Exception:
            m = []
        _cache[t] = (round(m[0]["coordinates"]["x"], 5), round(m[0]["coordinates"]["y"], 5)) if m else None
        if _cache[t]:
            return _cache[t]
    return None


def main():
    events = fetch("/api/events")["events"]
    groups = {c["id"]: c["name"].strip() for c in fetch("/api/communities")["communities"]}
    partners = {p["id"]: p["name"].strip() for p in fetch("/api/partners")["partners"]}
    venues = {}
    skipped = collections.Counter()
    for e in events:
        addr = (e.get("address") or "").strip()
        if e.get("eventType") == "virtual" or not addr or re.search(r"(?i)online|rsvp|tbd|austin", addr + " " + (e.get("venue") or "")):
            continue
        pt = geocode(addr)
        if not pt:
            skipped[addr] += 1
            continue
        name = re.sub(r"(?i)\s*[-,]?\s*(\d+(st|nd|rd|th)\s+floor.*|community space)$", "", (e.get("venue") or addr).strip())
        v = venues.setdefault(pt, {"name": name, "lon": pt[0], "lat": pt[1], "events": 0, "groups": set(), "partners": set()})
        v["events"] += 1
        for cid in (e.get("communityId") or "").split(","):
            if cid.strip() in groups:
                v["groups"].add(groups[cid.strip()])
        for pid in (e.get("partnerId") or "").split(","):
            if pid.strip() in partners:
                v["partners"].add(partners[pid.strip()])
    out = [dict(v, groups=sorted(v["groups"]), partners=sorted(v["partners"])) for v in venues.values()]
    out.sort(key=lambda v: -v["events"])
    sites = []
    for pid, addr in PARTNER_SITES.items():
        if pid in partners and (pt := geocode(addr)):
            sites.append({"name": partners[pid], "lon": pt[0], "lat": pt[1]})
    data = {"asOf": datetime.date.today().isoformat(), "events": sum(v["events"] for v in out),
            "groupsTotal": len(groups), "partnersTotal": len(partners), "venues": out, "partnerSites": sites}
    with open(OUT, "w") as f:
        json.dump(data, f, separators=(",", ":"), ensure_ascii=False)
    print(f"{data['events']} in-person events at {len(out)} venues; {len(sites)} partner sites")
    for v in out[:8]:
        print(f"  {v['events']:3}  {v['name'][:40]:40} {len(v['groups'])} groups")
    if skipped:
        print("skipped (fix the address in the admin):", dict(skipped))


if __name__ == "__main__":
    main()
