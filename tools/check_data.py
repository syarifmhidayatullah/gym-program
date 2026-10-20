#!/usr/bin/env python3
"""Cek data/*.json sebelum commit: python3 tools/check_data.py"""
import datetime as dt
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
errors, warns = [], []


def load(name):
    try:
        return json.loads((ROOT / "data" / name).read_text())
    except Exception as e:  # JSON rusak = halaman kosong, jadi berhenti di sini
        sys.exit(f"data/{name}: {e}")


def date(s, where):
    try:
        return dt.date.fromisoformat(s)
    except Exception:
        errors.append(f"{where}: tanggal '{s}' bukan YYYY-MM-DD")
        return None


P, C, B = load("program.json"), load("cycles.json"), load("body.json")

ids = {}
for v in P["versions"]:
    seen = set()
    for d in v["days"]:
        for e in d["ex"]:
            if e["id"] in seen:
                errors.append(f"program.json Versi {v['id']}: id '{e['id']}' dobel")
            seen.add(e["id"])
    ids[v["id"]] = seen
all_ids = set().union(*ids.values())

prev_end = None
for n, c in enumerate(C["cycles"], 1):
    w = f"cycles.json siklus {n}"
    start = date(c["start"], w)
    if c.get("version") not in ids:
        errors.append(f"{w}: versi '{c.get('version')}' tidak ada di program.json")
    if start:
        if start.weekday() != 0:
            errors.append(f"{w}: start {start} bukan Senin")
        if prev_end and start <= prev_end:
            errors.append(f"{w}: mulai {start} sebelum siklus sebelumnya selesai ({prev_end})")
        prev_end = start + dt.timedelta(days=7 * len(c["weeks"]) - 1)
    for i, wk in enumerate(c["weeks"], 1):
        if wk.get("type") not in ("build", "deload", "test"):
            errors.append(f"{w} minggu {i}: type '{wk.get('type')}' tidak dikenal")
        for lid, l in (wk.get("loads") or {}).items():
            if lid not in all_ids:
                errors.append(f"{w} minggu {i}: id '{lid}' tidak ada di program.json")
            if not isinstance(l.get("kg"), (int, float)):
                errors.append(f"{w} minggu {i} {lid}: kg harus angka")
            elif (l["kg"] * 10) % 25:
                warns.append(f"{w} minggu {i} {lid}: {l['kg']} kg bukan kelipatan 2,5")
    for lid in c.get("loads") or {}:
        if lid not in ids.get(c.get("version"), ()):
            errors.append(f"{w}: beban tetap '{lid}' tidak ada di Versi {c.get('version')}")

dates = [x["date"] for x in C.get("e1rm", [])]
if dates != sorted(dates):
    errors.append("cycles.json e1rm: belum urut tanggal")
scans = [x["date"] for x in B.get("scans", [])]
if scans != sorted(scans):
    errors.append("body.json scans: belum urut tanggal")
for s in B.get("scans", []):
    date(s["date"], "body.json scan")

for m in warns:
    print("peringatan:", m)
for m in errors:
    print("SALAH:", m)
print("OK" if not errors else f"{len(errors)} kesalahan")
sys.exit(1 if errors else 0)
