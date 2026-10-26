"""Build the time-lapse for "Watch downtown get built" on /localhost.

    python3 scripts/build-permits.py

Writes public/localhost/permits.json: every building permit the City of San Antonio
has issued in a downtown window since January 2025, as a point, the day it was
issued and what kind of work it was, plus the City's street centerlines to draw
the map on.

The time-lapse plays from this file. Clicking the map does not: it queries the
City's live open-data API, and shows the request.

Garage sales, tree affidavits, signs, banners and billboards are left out, as in
the hero: they aren't building. Only coordinates, type and date are fetched here;
the dataset also names a primary contact for each permit, who is often a private
person, and this never asks for it.

Coordinates are whole meters east and north of Main Plaza, as in sanborn.json.

Data: City of San Antonio Open Data, CC BY 4.0
"""
import datetime, json, math, os, urllib.parse, urllib.request

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "localhost", "permits.json")
SQL = "https://data.sanantonio.gov/api/3/action/datastore_search_sql"
PERMITS = "c21106f9-3ef5-4f3a-8604-f992b4db7512"   # "Permits Issued", 2025 to date
STREETS = "https://services.arcgis.com/g1fRTDLeMgspWrYp/arcgis/rest/services/Streets/FeatureServer/0"
BOX = (-98.512, 29.410, -98.475, 29.445)
LON0, LAT0 = -98.49351, 29.42458          # Main Plaza
KX, KY = 111_320 * math.cos(math.radians(LAT0)), 111_320
START = datetime.date(2025, 1, 1)
NOT_BUILDING = {"Garage Sale", "Tree Affidavit Permit", "Tree Permit", "On Premise Sign", "Across the Street Banner",
                "Temporary Weekend Sign", "Feather Sign", "Avenue Sign", "Event Sign", "Inflatable Sign",
                "Off Premise Billboard", "Billboard Demolition"}
KINDS = ["new", "work", "trades", "demolition"]


def kind(permit_type):
    t = permit_type.lower()
    if "new building" in t:
        return 0
    if "demolition" in t:
        return 3
    if any(w in t for w in ("electrical", "plumbing", "mechanical", "solar", "lsr ")):
        return 2
    return 1


def xy(lon, lat):
    return round((lon - LON0) * KX), round((lat - LAT0) * KY)


def main():
    sql = f'''SELECT "PERMIT TYPE","X_COORD","Y_COORD","DATE ISSUED" FROM "{PERMITS}"
      WHERE "X_COORD" <> '' AND "Y_COORD" <> '' AND "DATE ISSUED" <> ''
      AND CAST("X_COORD" AS float) BETWEEN {BOX[0]} AND {BOX[2]} AND CAST("Y_COORD" AS float) BETWEEN {BOX[1]} AND {BOX[3]}'''
    recs = json.load(urllib.request.urlopen(SQL + "?" + urllib.parse.urlencode({"sql": sql}), timeout=300))["result"]["records"]
    rows = []
    for r in recs:
        if r["PERMIT TYPE"] in NOT_BUILDING:
            continue
        day = (datetime.date.fromisoformat(r["DATE ISSUED"][:10]) - START).days
        if day < 0:
            continue
        rows.append((day, *xy(float(r["X_COORD"]), float(r["Y_COORD"])), kind(r["PERMIT TYPE"])))
    rows.sort()

    streets, offset = [], 0
    while True:
        d = json.load(urllib.request.urlopen(STREETS + "/query?" + urllib.parse.urlencode({
            "where": "1=1", "geometry": ",".join(map(str, BOX)), "geometryType": "esriGeometryEnvelope", "inSR": 4326,
            "spatialRel": "esriSpatialRelIntersects", "outSR": 4326, "returnGeometry": "true", "outFields": "OBJECTID",
            "maxAllowableOffset": 0.00001, "resultOffset": offset, "resultRecordCount": 2000, "f": "json"}), timeout=180))
        for f in d.get("features", []):
            for path in f["geometry"]["paths"]:
                streets.append([v for lon, lat in path for v in xy(lon, lat)])
        offset += len(d.get("features", []))
        if not d.get("exceededTransferLimit") or not d.get("features"):
            break

    last = START + datetime.timedelta(days=rows[-1][0])
    data = {
        "origin": [LON0, LAT0],
        "start": START.isoformat(),
        "asOf": last.isoformat(),
        "kinds": KINDS,
        # day, x, y, kind, flattened, in the order the City issued them
        "permits": [v for r in rows for v in r],
        "streets": streets,
    }
    with open(OUT, "w") as f:
        json.dump(data, f, separators=(",", ":"))
    by_kind = [sum(1 for r in rows if r[3] == k) for k in range(len(KINDS))]
    print(f"{len(rows)} permits through {last} ({dict(zip(KINDS, by_kind))}), {len(streets)} street lines, "
          f"{os.path.getsize(OUT) / 1024:.0f} KB -> {OUT}")


if __name__ == "__main__":
    main()
