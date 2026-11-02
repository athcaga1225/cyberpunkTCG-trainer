#!/usr/bin/env python3
"""Mirror RETAIL images into GitHub Pages so Safari does not rely on third-party hotlinks.

The URLs in retail-printings.json are exact numbered Retail image sources.
Only replace a URL after successfully downloading and inspecting actual image bytes.
A temporary failure never removes an existing image or changes the source record.
"""
import concurrent.futures
import json
import pathlib
import re
import urllib.request
import urllib.error

ROOT = pathlib.Path("v3")
DATA = ROOT / "retail-printings.json"
OUT = ROOT / "retail-art"
OUT.mkdir(exist_ok=True)
manifest = json.loads(DATA.read_text(encoding="utf-8"))

def sniff(data):
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP": return "webp"
    if data[:3] == b"\xff\xd8\xff": return "jpg"
    if data[:8] == b"\x89PNG\r\n\x1a\n": return "png"
    return None

def download(card):
    id_ = card["id"]
    url = card.get("retailRemoteImageUrl") or card.get("retailImageUrl")
    if not url or (url.startswith("v3/retail-art/")): return id_, "no remote source", None
    for ext in ("webp","jpg","png"):
        path = OUT / (id_ + "." + ext)
        if path.exists() and path.stat().st_size > 1000:
            return id_, "already cached", "v3/retail-art/" + path.name
    req = urllib.request.Request(url, headers={
        "User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15",
        "Accept":"image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "Referer":"https://exburst.dev/"
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            data=response.read(4000000)
        ext=sniff(data)
        if not ext or len(data)<2500 or len(data)>=4000000:
            return id_, "invalid image bytes or size", None
        path=OUT/(id_+"."+ext)
        path.write_bytes(data)
        return id_, "downloaded "+str(len(data))+" bytes", "v3/retail-art/"+path.name
    except Exception as exc:
        return id_, "failed "+str(exc)[:160], None

with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
    results=list(pool.map(download,manifest["cards"]))

by_id={x["id"]:x for x in manifest["cards"]}
success=0
for id_, status, local in results:
    if not local:
        print(id_,status)
        continue
    entry=by_id[id_]
    if not entry.get("retailRemoteImageUrl"):
        entry["retailRemoteImageUrl"]=entry["retailImageUrl"]
    entry["retailImageUrl"]=local
    entry["imageStatus"]="self-hosted-retail"
    success+=1
print("SELF_HOSTED",success,"of",len(manifest["cards"]))
print("MISSING",",".join(x["id"] for x in manifest["cards"] if x.get("imageStatus")!="self-hosted-retail"))
DATA.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
