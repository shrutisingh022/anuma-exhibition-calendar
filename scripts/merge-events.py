"""Merge researched exhibition files into src/data/events.json.

Usage: python3 scripts/merge-events.py <dir-with-json-files>
Validates every record, drops duplicates and anything outside the window, and prints what it dropped.
"""
import json, re, sys, pathlib
from datetime import date

WINDOW = (date(2026, 10, 1), date(2027, 12, 31))
TYPES = pathlib.Path(__file__).parent.parent / "src/data/types.ts"
SECTORS = set(re.findall(r'^\s+"([^"]+)",$', TYPES.read_text().split("SECTORS = [")[1], re.M))
STATUSES = {"confirmed", "listed", "expected"}
FREQ = {"annual", "biennial", "other"}
RANK = {"confirmed": 0, "listed": 1, "expected": 2}

def slug(s): return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
def norm(s): return re.sub(r"[^a-z0-9]", "", s.lower())

out, dropped = {}, []
src = pathlib.Path(sys.argv[1])
# _corrections.json: {id: {field: value}} applied after merging, from the source-check pass.
corr_file = src / "_corrections.json"
corrections = json.loads(corr_file.read_text()) if corr_file.exists() else {}
for f in sorted(p for p in src.glob("*.json") if not p.name.startswith("_")):
    for r in json.loads(f.read_text()):
        name = (r.get("name") or "").strip()
        try:
            a, b = date.fromisoformat(r["startDate"]), date.fromisoformat(r["endDate"])
        except Exception:
            dropped.append(f"{f.name}: {name}: bad dates"); continue
        if b < a: dropped.append(f"{f.name}: {name}: end before start"); continue
        if b < WINDOW[0] or a > WINDOW[1]: dropped.append(f"{f.name}: {name}: outside window"); continue
        if r.get("status") not in STATUSES: dropped.append(f"{f.name}: {name}: bad status"); continue
        if not str(r.get("sourceUrl", "")).startswith("http"): dropped.append(f"{f.name}: {name}: no source"); continue
        sectors = [s for s in r.get("sectors", []) if s in SECTORS]
        bad = [s for s in r.get("sectors", []) if s not in SECTORS]
        if bad: dropped.append(f"{f.name}: {name}: unknown sector(s) removed {bad}")
        if not sectors: sectors = ["General engineering"]
        rec = {
            "id": slug(f"{name}-{a.isoformat()}"),
            "name": name,
            "startDate": a.isoformat(), "endDate": b.isoformat(),
            "city": (r.get("city") or "").strip(), "state": (r.get("state") or "").strip(),
            "venue": (r.get("venue") or "").strip(), "organiser": (r.get("organiser") or "").strip(),
            "sectors": sectors[:3],
            "frequency": r.get("frequency") if r.get("frequency") in FREQ else "other",
            "website": r.get("website") or r["sourceUrl"], "sourceUrl": r["sourceUrl"],
            "status": r["status"],
            "exhibitors": r.get("exhibitors") if isinstance(r.get("exhibitors"), int) else None,
            "notes": (r.get("notes") or "").strip(),
        }
        key = (norm(name), a.isoformat())
        if key in out:
            keep = min(out[key], rec, key=lambda x: RANK[x["status"]])
            dropped.append(f"{f.name}: {name}: duplicate, kept {keep['status']}")
            out[key] = keep
        else:
            out[key] = rec

for rec in out.values():
    rec.update(corrections.pop(rec["id"], {}))
for missing in corrections:
    dropped.append(f"correction for unknown id {missing}")
out = {k: r for k, r in out.items() if not r.get("remove")}

events = sorted(out.values(), key=lambda e: (e["startDate"], e["name"]))
dest = pathlib.Path(__file__).parent.parent / "src/data/events.json"
dest.write_text(json.dumps(events, indent=2, ensure_ascii=False) + "\n")
by = {s: sum(e["status"] == s for e in events) for s in STATUSES}
print(f"{len(events)} events written · {by}")
print("\n".join(dropped) if dropped else "nothing dropped")
