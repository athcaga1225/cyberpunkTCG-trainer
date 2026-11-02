#!/usr/bin/env python3
"""Fill only missing Retail Iconic image URLs using ExBurst card-page metadata.

Runs on GitHub Actions where external HTTP requests are available. Never falls back
to Beta artwork or guesses ExBurst's non-deterministic CDN render IDs.
"""
import html
import json
import re
import sys
import urllib.request
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

MANIFEST = Path("v3/retail-printings.json")
CARD_IDS = ("141","142","143","144","145","147","151","153","156","160","161","163","167")

class Metadata(HTMLParser):
    def __init__(self):
        super().__init__()
        self.images = []
    def handle_starttag(self, tag, attrs):
        if tag != "meta":
            return
        d = dict(attrs)
        if d.get("property") in ("og:image","og:image:url") or d.get("name") in ("twitter:image","twitter:image:src"):
            if d.get("content"):
                self.images.append(d["content"])

def request(url, method="GET"):
    req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0 (compatible; retail-card-image-reconciler/1.0)","Accept":"text/html,image/webp,image/*"}, method=method)
    with urllib.request.urlopen(req, timeout=20) as response:
        return response.headers, response.read() if method == "GET" else b""

def valid(url):
    p = urlparse(html.unescape(url))
    return p.scheme == "https" and p.hostname == "cdn.exburst.dev" and p.path.startswith("/cards/cyberpunk/") and re.search(r"render-[^/]+\\.(webp|png|jpg)$", p.path, re.I)

def main():
    manifest = json.loads(MANIFEST.read_text())
    by_id = {c["id"]:c for c in manifest["cards"]}
    changed = 0
    for card_id in CARD_IDS:
        item = by_id[card_id]
        if item.get("retailImageUrl"):
            print(card_id, "already present")
            continue
        page = f"https://exburst.dev/cyberpunk/cards/MS01-{card_id}"
        try:
            _, body = request(page)
            parser = Metadata()
            parser.feed(body.decode("utf-8","replace"))
            matches = [html.unescape(x) for x in parser.images if valid(x)]
            matches = list(dict.fromkeys(matches))
            if len(matches) != 1:
                print(card_id, "not uniquely matched og:image",len(matches))
                continue
            url = matches[0]
            headers, _ = request(url, "HEAD")
            if not headers.get("content-type","").startswith("image/"):
                print(card_id, "non-image response")
                continue
            item.update(retailImageUrl=url,imageStatus="cross-referenced-iconic",imageSource="ExBurst (Retail MS01)",imageSourceUrl=page,mappingStatus="ExBurst-page-og-image-checked")
            changed+=1
            print(card_id,"matched",url)
        except Exception as exc:
            print(card_id,"unresolved",str(exc)[:220])
    if changed:
        MANIFEST.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\\n")
    print("new sources:",changed, "remaining:",sum(not c.get("retailImageUrl") for c in manifest["cards"]))
if __name__=="__main__":
    main()
