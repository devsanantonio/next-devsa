"""Build "Follow the water" for /localhost: San Antonio from 1718, drawn from its ditches.

    python3 scripts/build-water.py

Writes public/localhost/water.json from Bexar County's Tricentennial layers:

  - the San Antonio River as the County maps its historic course, and San Pedro Creek
  - the acequias, the Spanish irrigation ditches, with the year each was dug and abandoned
  - the labores, the irrigated fields the ditches fed
  - 348 land grants along them, with the grantee and the year
  - the presidio and the five missions
  - today's flood map: FEMA's 1% annual-chance floodplain (the "100-year" flood), which
    the County republishes, and how much of the acequias' length lies inside it in the
    view the story's "Where the water goes now" step shows

Grantees are named: they are the settlers of the 1700s, many of them Canary
Islanders, and the County publishes the grants to tell their story.

Coordinates are whole meters east and north of Main Plaza, as in sanborn.json,
so the 1896 map lines up on top.

Data: Bexar County Information Technology GIS
"""
import json, math, os, urllib.parse, urllib.request

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "localhost", "water.json")
A = "https://services1.arcgis.com/8onVmslF2KXErTHT/arcgis/rest/services"
LON0, LAT0 = -98.49351, 29.42458          # Main Plaza
KX, KY = 111_320 * math.cos(math.radians(LAT0)), 111_320
# From the head of the San Pedro and Upper Labor ditches south past Mission Espada.
BOX = (-98.53, 29.29, -98.42, 29.475)


def query(service, **p):
    p = {"where": "1=1", "outSR": 4326, "returnGeometry": "true", "f": "json", "maxAllowableOffset": 0.00004,
         "geometry": ",".join(map(str, BOX)), "geometryType": "esriGeometryEnvelope", "inSR": 4326,
         "spatialRel": "esriSpatialRelIntersects", **p}
    with urllib.request.urlopen(f"{A}/{service}/FeatureServer/0/query?" + urllib.parse.urlencode(p), timeout=180) as r:
        d = json.load(r)
    if "error" in d:
        raise SystemExit(f"{service}: {d['error']}")
    return d["features"]


def flat(part):
    return [v for lon, lat in part for v in (round((lon - LON0) * KX), round((lat - LAT0) * KY))]


def parts(f):
    g = f.get("geometry") or {}
    return [flat(p) for p in g.get("rings", []) + g.get("paths", []) if len(p) > 1]


def point(f):
    g = f["geometry"]
    return [round((g["x"] - LON0) * KX), round((g["y"] - LAT0) * KY)]


# The "Where the water goes now" step's view, in meters from Main Plaza: it has to match
# the step's center and span in components/localhost/follow-the-water.tsx.
FLOOD_VIEW = (-4000, -5000, 4000, 3000)


def floodplain():
    """FEMA's special flood hazard area (SFHA_TF = 'T'), as the County publishes it."""
    rings, offset = [], 0
    while True:
        # Coarser than the ditches: it's drawn as a faint fill on the dot grid, and at full detail it tripled the file.
        p = {"where": "SFHA_TF='T'", "outSR": 4326, "returnGeometry": "true", "f": "json", "maxAllowableOffset": 0.00015,
             "geometry": ",".join(map(str, BOX)), "geometryType": "esriGeometryEnvelope", "inSR": 4326,
             "spatialRel": "esriSpatialRelIntersects", "outFields": "OBJECTID", "resultOffset": offset}
        with urllib.request.urlopen(f"{A}/Floodplains/FeatureServer/11/query?" + urllib.parse.urlencode(p), timeout=180) as r:
            d = json.load(r)
        if "error" in d:
            raise SystemExit(f"Floodplains: {d['error']}")
        for f in d["features"]:
            rings += parts(f)
        offset += len(d["features"])
        if not d.get("exceededTransferLimit") or not d["features"]:
            return rings


def inside(x, y, rings):
    c = False
    for r in rings:
        j = len(r) - 2
        for i in range(0, len(r), 2):
            if (r[i + 1] > y) != (r[j + 1] > y) and x < (r[j] - r[i]) * (y - r[i + 1]) / (r[j + 1] - r[i + 1]) + r[i]:
                c = not c
            j = i
    return c


def flood_share(acequias, rings):
    """Meters of acequia in FLOOD_VIEW, and how many of them lie in the floodplain, sampled every 10 m."""
    x0, y0, x1, y1 = FLOOD_VIEW
    boxes = []
    for r in rings:
        xs, ys = r[0::2], r[1::2]
        boxes.append((min(xs), max(xs), min(ys), max(ys), r))
    total = wet = 0.0
    for a in acequias:
        for p in a["paths"]:
            for i in range(0, len(p) - 2, 2):
                ax, ay, bx, by = p[i:i + 4]
                seg = math.hypot(bx - ax, by - ay)
                n = max(1, int(seg / 10))
                for k in range(n):
                    x, y = ax + (bx - ax) * (k + 0.5) / n, ay + (by - ay) * (k + 0.5) / n
                    if not (x0 <= x <= x1 and y0 <= y <= y1):
                        continue
                    total += seg / n
                    # Rings are tested one at a time: a hole is its own ring, so this counts holes as inside,
                    # which can only overstate how much lies in the floodplain.
                    if any(b[0] <= x <= b[1] and b[2] <= y <= b[3] and inside(x, y, [b[4]]) for b in boxes):
                        wet += seg / n
    return {"meters": round(total), "inside": round(wet)}


def main():
    river = [p for f in query("Rullman_River") for p in parts(f)]
    creek = [p for f in query("BexarCountyRivers", where="GNIS_Name='San Pedro Creek'") for p in parts(f)]

    acequias = {}
    for f in query("RullmanAcequia", outFields="Name,Associated,YrCreate,YrAband"):
        a = f["attributes"]
        name = " ".join(a["Name"].split())
        # One ditch can come in several pieces, some dug later (the Alamo's was extended in 1765).
        key = (name, a["YrCreate"])
        e = acequias.setdefault(key, {"name": name, "for": a["Associated"], "dug": a["YrCreate"], "dry": a["YrAband"], "paths": []})
        e["paths"] += parts(f)
    acequias = sorted((a for a in acequias.values() if a["paths"]), key=lambda a: a["dug"])

    fields = [{"name": f["attributes"]["Name"], "rings": parts(f)} for f in query("Labores", outFields="Name") if parts(f)]

    lots = []
    for f in query("300_GrantedLots", outFields="Owner_Full,GrantYear,Labor,Shared"):
        a = f["attributes"]
        year = int(a["GrantYear"]) if str(a["GrantYear"] or "").strip().isdigit() else None
        lots.append({"name": " ".join((a["Owner_Full"] or "").split()), "year": year, "labor": a["Labor"], "rings": parts(f)})

    places = [{"name": f["attributes"]["MAPNAME"], "at": point(f)} for f in query("SAMissions", outFields="MAPNAME")]
    places += [{"name": f["attributes"]["Name"], "at": point(f)} for f in query("Spanish_Forts", outFields="Name")]

    flood = floodplain()
    share = flood_share(acequias, flood)

    data = {"origin": [LON0, LAT0], "river": river, "creek": creek, "acequias": acequias, "fields": fields, "lots": lots,
            "places": places, "flood": flood, "floodShare": share}
    with open(OUT, "w") as fh:
        json.dump(data, fh, separators=(",", ":"))
    print(f"river {len(river)} rings, creek {len(creek)} lines, {len(acequias)} acequias, {len(fields)} fields, "
          f"{len(lots)} lots ({sum(1 for l in lots if l['year'])} dated), {len(places)} places, "
          f"{len(flood)} floodplain rings ({share['inside']} of {share['meters']} m of acequia inside it), "
          f"{os.path.getsize(OUT) / 1024:.0f} KB -> {OUT}")
    for a in acequias:
        print(f"  {a['dug']}-{a['dry']}  {a['name']}  ({a['for']})")


if __name__ == "__main__":
    main()
