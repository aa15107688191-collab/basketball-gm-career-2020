from __future__ import annotations

import base64
import io
import urllib.request
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PLAYER_IDS = {
    "curry16": 201939, "magic87": 77142, "paul08": 101108, "nash07": 959,
    "kidd03": 467, "iverson01": 947, "harden18": 201935, "wade09": 2548,
    "kyrie16": 202681, "rose11": 201565, "luka24": 1629029, "jordan91": 893,
    "kobe06": 977, "durant17": 201142, "lebron13": 2544, "bird86": 1449,
    "kawhi19": 202695, "pippen96": 937, "tmac03": 1503, "klay16": 202691,
    "ray01": 951, "manu05": 1938, "iguodala15": 2738, "duncan03": 1495,
    "garnett04": 708, "giannis21": 203507, "dirk11": 1717, "barkley90": 787,
    "malone97": 252, "davis20": 203076, "draymond16": 203110, "rodman96": 23,
    "shaq00": 406, "hakeem94": 165, "jokic23": 203999, "kareem71": 76003,
    "wilt67": 76375, "russell65": 78049, "dwight11": 2730, "gobert21": 203497,
}


def fetch(player_id: int) -> bytes:
    url = f"https://cdn.nba.com/headshots/nba/latest/260x190/{player_id}.png"
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read()


def compact_webp(data: bytes) -> bytes:
    image = Image.open(io.BytesIO(data)).convert("RGBA")
    # NBA headshots are landscape canvases. A square crop keeps the face and shoulders.
    width, height = image.size
    side = min(width, height)
    left = (width - side) // 2
    image = image.crop((left, 0, left + side, side)).resize((128, 128), Image.Resampling.LANCZOS)
    output = io.BytesIO()
    image.save(output, "WEBP", quality=78, method=6)
    return output.getvalue()


def main() -> None:
    encoded: dict[str, str] = {}
    failures: list[str] = []
    for key, nba_id in PLAYER_IDS.items():
        try:
            data = compact_webp(fetch(nba_id))
            encoded[key] = "data:image/webp;base64," + base64.b64encode(data).decode("ascii")
            print(f"OK   {key:12} {len(data):6} bytes")
        except Exception as exc:  # Keep the build useful even when one historical photo is unavailable.
            failures.append(key)
            print(f"FAIL {key:12} {exc}")

    lines = ["(function(root){", "  'use strict';", "  root.HexPlayerAvatars={"]
    for key, value in encoded.items():
        lines.append(f"    {key!r}:{value!r},")
    lines.extend(["  };", "})(typeof globalThis!=='undefined'?globalThis:window);", ""])
    (ROOT / "hex-avatars.js").write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {len(encoded)} avatars; missing: {', '.join(failures) or 'none'}")


if __name__ == "__main__":
    main()
