"""Build "Follow the water" for /localhost: San Antonio from 1718, drawn from its ditches.

    python3 scripts/build-water.py

Writes public/localhost/water.json from Bexar County's Tricentennial layers:

  - the San Antonio River as the County maps its historic course, and San Pedro Creek
  - the acequias, the Spanish irrigation ditches, with the year each was dug and abandoned
  - the labores, the irrigated fields the ditches fed
  - 348 land grants along them, with the grantee and the year
  - the presidio and the five missions

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

    data = {"origin": [LON0, LAT0], "river": river, "creek": creek, "acequias": acequias, "fields": fields, "lots": lots, "places": places}
    with open(OUT, "w") as fh:
        json.dump(data, fh, separators=(",", ":"))
    print(f"river {len(river)} rings, creek {len(creek)} lines, {len(acequias)} acequias, {len(fields)} fields, "
          f"{len(lots)} lots ({sum(1 for l in lots if l['year'])} dated), {len(places)} places, "
          f"{os.path.getsize(OUT) / 1024:.0f} KB -> {OUT}")
    for a in acequias:
        print(f"  {a['dug']}-{a['dry']}  {a['name']}  ({a['for']})")


if __name__ == "__main__":
    main()
