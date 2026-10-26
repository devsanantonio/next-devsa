"""Build the points for the /localhost hero: the city, assembled from its three open-data sources.

    python3 scripts/build-hero.py

Writes public/localhost/hero.json. Coordinates are quantized to integers 0-10000
across Bexar County's bounding box to keep the file small.

  - Bexar County: every 1896 building (centroid), and the county outline
  - City of San Antonio: construction permits issued since January 2025 (a sample), and the total.
    Garage sales, tree affidavits, signs, banners and billboards are left out: they aren't building.
    Only coordinates and permit type are fetched; the dataset also names applicants, who are private people.
  - VIA: every bus stop and the number of routes, from the published GTFS

Data: Bexar County Information Technology GIS; City of San Antonio Open Data, CC BY 4.0;
Data provided by VIA Metropolitan Transit
"""
import csv, io, json, os, urllib.parse, urllib.request, zipfile

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "localhost", "hero.json")
COUNTY = "https://maps.bexar.org/arcgis/rest/services/CountyBoundary/MapServer/0"
BUILDINGS = "https://services1.arcgis.com/8onVmslF2KXErTHT/arcgis/rest/services/Historic_Buildings/FeatureServer/0"
PERMITS = "https://data.sanantonio.gov/api/3/action/datastore_search"
PERMITS_ISSUED = "c21106f9-3ef5-4f3a-8604-f992b4db7512"   # "Permits Issued", 2025 to date
NOT_BUILDING = {"Garage Sale", "Tree Affidavit Permit", "Tree Permit", "On Premise Sign", "Across the Street Banner",
                "Temporary Weekend Sign", "Feather Sign", "Avenue Sign", "Event Sign", "Inflatable Sign",
                "Off Premise Billboard", "Billboard Demolition"}
GTFS = "https://www.viainfo.net/BusService/google_transit.zip"
SAMPLE_PERMITS = 12000


def get(url, **p):
    p.setdefault("f", "json")
    with urllib.request.urlopen(url + "?" + urllib.parse.urlencode(p), timeout=180) as r:
        return json.load(r)


def paged(url, page, limit=None, **p):
    out, start = [], 0
    while True:
        d = get(url + "/query", resultOffset=start, resultRecordCount=page, **p)
        out += d.get("features", [])
        if not d.get("exceededTransferLimit") or not d.get("features") or (limit and len(out) >= limit):
            return out[:limit] if limit else out
        start += len(d["features"])


def main():
    ring = get(COUNTY + "/query", where="1=1", outSR=4326, returnGeometry="true", maxAllowableOffset=0.002)["features"][0]["geometry"]["rings"][0]
    xs, ys = [p[0] for p in ring], [p[1] for p in ring]
    x0, y0, x1, y1 = min(xs), min(ys), max(xs), max(ys)
    q = lambda lon, lat: [round((lon - x0) / (x1 - x0) * 10000), round((y1 - lat) / (y1 - y0) * 10000)]

    buildings = paged(BUILDINGS, 2000, where="1=1", outSR=4326, returnCentroid="true", returnGeometry="false", outFields="OBJECTID")
    bexar = [v for f in buildings if (c := f.get("centroid")) for v in q(c["x"], c["y"])]

    permits, offset = [], 0
    while True:
        d = json.load(urllib.request.urlopen(PERMITS + "?" + urllib.parse.urlencode(
            {"resource_id": PERMITS_ISSUED, "fields": "X_COORD,Y_COORD,PERMIT TYPE", "limit": 32000, "offset": offset}), timeout=180))["result"]
        permits += d["records"]
        offset += len(d["records"])
        if not d["records"] or offset >= d["total"]:
            break
    building = []
    for p in permits:
        if p["PERMIT TYPE"] in NOT_BUILDING:
            continue
        try:
            lon, lat = float(p["X_COORD"]), float(p["Y_COORD"])
        except (TypeError, ValueError):
            continue
        if x0 <= lon <= x1 and y0 <= lat <= y1:
            building.append((lon, lat))
    total = len(building)
    step = max(1, total // SAMPLE_PERMITS)
    cosa = [v for lon, lat in building[::step][:SAMPLE_PERMITS] for v in q(lon, lat)]

    # VIA's server refuses Python's default user agent.
    req = urllib.request.Request(GTFS, headers={"User-Agent": "devsa-localhost/1.0 (jesse@devsanantonio.com)"})
    with urllib.request.urlopen(req, timeout=180) as r:
        z = zipfile.ZipFile(io.BytesIO(r.read()))
    rows = lambda name: csv.DictReader(io.TextIOWrapper(z.open(name), encoding="utf-8-sig"))
    stops = [s for s in rows("stops.txt") if s["stop_lat"]]
    via = [v for s in stops for v in q(float(s["stop_lon"]), float(s["stop_lat"]))]
    routes = sum(1 for _ in rows("routes.txt"))

    data = {
        "aspect": round((x1 - x0) * 0.8706 / (y1 - y0), 4),   # cos(29.45°): true proportions
        "county": [v for lon, lat in ring for v in q(lon, lat)],
        "bexar": {"buildings": len(bexar) // 2, "pts": bexar},
        "cosa": {"permits": total, "since": "2025", "sample": len(cosa) // 2, "pts": cosa},
        "via": {"stops": len(stops), "routes": routes, "pts": via},
    }
    with open(OUT, "w") as f:
        json.dump(data, f, separators=(",", ":"))
    print(f"bexar {data['bexar']['buildings']} buildings · cosa {total} construction permits since 2025 ({data['cosa']['sample']} drawn) · via {len(stops)} stops, {routes} routes")


if __name__ == "__main__":
    main()
