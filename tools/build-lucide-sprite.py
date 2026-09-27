"""Rebuild public/icons/lucide.svg from a Lucide checkout.

usage: python3 tools/build-lucide-sprite.py /path/to/lucide/icons
"""
import json, os, re, sys

src = sys.argv[1].rstrip("/") + "/"
m = json.load(open("tools/lucide-map.json"))
names = sorted(set(m.values()))
out = ['<svg xmlns="http://www.w3.org/2000/svg" style="display:none">']
for name in names:
    s = open(src + name + ".svg").read()
    inner = s[s.index(">", s.index("<svg")) + 1 : s.rindex("</svg>")]
    inner = re.sub(r"\s+", " ", inner).strip()
    out.append(
        f'<symbol id="{name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
        f'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">{inner}</symbol>'
    )
out.append("</svg>")
open("public/icons/lucide.svg", "w").write("\n".join(out) + "\n")
print(f"{len(names)} icons")
