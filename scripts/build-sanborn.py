"""Build the 1896 Sanborn map for "What was here?" on /localhost.

    python3 scripts/build-sanborn.py

Writes public/localhost/sanborn.json: every 1896 building footprint in a downtown
window (Main Plaza to the Central Library, I-35 to the river), from Bexar County's
Historic Buildings layer, with the color each was drawn in on the original Sanborn
fire-insurance map, and the 1896 city blocks for the streets between them.

The map is drawn from this file. The lookups on the page are not: they query the
County's live service, and show the request, because the point is that anyone
can make the same call.

Coordinates are whole meters east and north of Main Plaza, outlines simplified to about a
meter: at this scale nothing finer shows, and it halves the download.

Data: Bexar County Information Technology GIS
"""
import json, math, os, urllib.parse, urllib.request

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "localhost", "sanborn.json")
A = "https://services1.arcgis.com/8onVmslF2KXErTHT/arcgis/rest/services"
BOX = (-98.503, 29.418, -98.483, 29.437)
LON0, LAT0 = -98.49351, 29.42458          # Main Plaza
KX, KY = 111_320 * math.cos(math.radians(LAT0)), 111_320

# The Sanborn color key: what each building was made of, as the 1896 map drew it.
MATERIAL = [("Y", "frame"), ("BL", "stone"), ("P", "brick"), ("GR", "iron"), ("BR", "adobe"), ("GREEN", "special")]


def material(code):
    c = (code or "").upper().replace("/", " ").split()
    first = c[0] if c else ""
    if first.startswith("GREEN"):
        return 5
    if first.startswith("BR"):
        return 4
    if first.startswith("BL"):
        return 1
    if first.startswith("P"):
        return 2
    if first.startswith("GR"):
        return 3
    return 0


def query(svc, fields, offset):
    out, start = [], 0
    while True:
        p = {"where": "1=1", "geometry": ",".join(map(str, BOX)), "geometryType": "esriGeometryEnvelope", "inSR": 4326,
             "spatialRel": "esriSpatialRelIntersects", "outFields": fields, "outSR": 4326, "returnGeometry": "true",
             "maxAllowableOffset": offset, "geometryPrecision": 6, "resultOffset": start, "resultRecordCount": 2000, "f": "json"}
        with urllib.request.urlopen(f"{A}/{svc}/FeatureServer/0/query?" + urllib.parse.urlencode(p), timeout=180) as r:
            d = json.load(r)
        out += d.get("features", [])
        if not d.get("exceededTransferLimit"):
            return out
        start += len(d["features"])


def ring(r):
    pts = [[round((x - LON0) * KX), round((y - LAT0) * KY)] for x, y in r]
    flat = [v for p in pts for v in p]
    return flat


def main():
    buildings = []
    for f in query("Historic_Buildings", "ColorCode", 0.00001):
        rings = f.get("geometry", {}).get("rings")
        if rings and len(rings[0]) >= 4:
            buildings.append([material(f["attributes"].get("ColorCode")), ring(rings[0])])
    blocks = [ring(f["geometry"]["rings"][0]) for f in query("Blocks1896", "OBJECTID", 0.00001) if f.get("geometry")]
    data = {"origin": [LON0, LAT0], "materials": [m for _, m in MATERIAL], "buildings": buildings, "blocks": blocks}
    with open(OUT, "w") as f:
        json.dump(data, f, separators=(",", ":"))
    counts = [sum(1 for b in buildings if b[0] == i) for i in range(len(MATERIAL))]
    print(f"{len(buildings)} buildings, {len(blocks)} blocks;", dict(zip(data["materials"], counts)))


if __name__ == "__main__":
    main()
