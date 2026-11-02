#!/usr/bin/env python3
"""Upgrade Retail 148-171 using full-resolution ExBurst MS01 card renders.

Only replace a cached image after inspecting BOTH decoded dimensions and
card identity (the URL must originate from the existing MS01 entry). All
original 148-171 files remain in place as fallback.
"""
from concurrent.futures import ThreadPoolExecutor, as_completed
from io import BytesIO
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode
from PIL import Image
import json
import urllib.request

root=Path("v3")
manifest_path=root/"retail-printings.json"
manifest=json.loads(manifest_path.read_text(encoding="utf-8"))
cards=[c for c in manifest["cards"] if c["id"].isdigit() and 148<=int(c["id"])<=171]
assert len(cards)==24, f"Expected 24 Retail images, got {len(cards)}"

def high_res_url(source):
    parsed=urlsplit(source)
    if parsed.hostname!="cdn.exburst.dev" or "/cards/cyberpunk/render-" not in parsed.path:
        raise ValueError("Unexpected source; cannot verify RETAIL printing")
    q=dict(parse_qsl(parsed.query))
    q["format"]="webp"
    q["quality"]="96"
    q["width"]="1400"
    return urlunsplit((parsed.scheme,parsed.netloc,parsed.path,urlencode(q),""))

def dimensions(data):
    with Image.open(BytesIO(data)) as image:
        image.verify()
    with Image.open(BytesIO(data)) as image:
        return (image.width,image.height,image.format)

def handle(card):
    n=card["id"]
    original=root/"retail-art"/(n+".webp")
    if not original.exists(): return n,"missing old image",None
    previous=original.read_bytes()
    old_w,old_h,_=dimensions(previous)
    source=card.get("retailRemoteImageUrl")
    if not source: return n,"missing source",None
    url=high_res_url(source)
    request=urllib.request.Request(url,headers={
        "User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15",
        "Referer":"https://exburst.dev/",
        "Accept":"image/webp,image/*;q=0.8"
    })
    try:
        with urllib.request.urlopen(request,timeout=35) as response:
            raw=response.read(6_000_000)
        new_w,new_h,fmt=dimensions(raw)
    except Exception as e:
        return n,f"download failed: {str(e)[:120]}",None
    if fmt!="WEBP" or len(raw)<3000 or len(raw)>=6_000_000:
        return n,"unexpected image format or bytes",None
    if new_w < old_w*1.25 or new_h < old_h*1.25:
        return n,f"not improved: {old_w}x{old_h} vs {new_w}x{new_h}",None
    if abs(new_w/new_h-old_w/old_h)>0.02:
        return n,"wrong aspect ratio",None
    if len(raw)<len(previous)*0.65:
        return n,"suspiciously small candidate",None
    out=root/"retail-art"/(n+"-hq.webp")
    out.write_bytes(raw)
    return n,f"UPGRADED {old_w}x{old_h} -> {new_w}x{new_h}, {len(previous)} -> {len(raw)} bytes",("v3/retail-art/"+out.name,url,(new_w,new_h))

updated=0
with ThreadPoolExecutor(max_workers=8) as pool:
    futures=[pool.submit(handle,c) for c in cards]
    for future in as_completed(futures):
        n,description,result=future.result()
        print(n,description,flush=True)
        if not result: continue
        card=next(c for c in cards if c["id"]==n)
        card["retailImageUrl"]=result[0]
        card["retailHighResSourceUrl"]=result[1]
        card["retailHighResDimensions"]=list(result[2])
        card["imageStatus"]="self-hosted-retail"
        card["retailImageBackupUrl"]="v3/retail-art/"+n+".webp"
        updated+=1
print("UPGRADED_TOTAL",updated,"of",len(cards))
if updated:
    manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
