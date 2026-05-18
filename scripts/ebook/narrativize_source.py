from __future__ import annotations

import argparse
import json
import os
import re
from typing import Any, Dict, List


def _norm(text: str) -> str:
    return text.replace("\r\n", "\n").replace("\r", "\n").strip()


def _is_separator(line: str) -> bool:
    return bool(re.match(r"^_+\s*$", line.strip()))


def narrativize_block(block: str) -> str:
    raw = _norm(block)
    if not raw:
        return ""

    lines = [ln.strip() for ln in raw.split("\n") if ln.strip() and not _is_separator(ln)]
    if not lines:
        return ""

    bullets = [ln[1:].strip() for ln in lines if ln.startswith("*")]
    heads = [ln for ln in lines if not ln.startswith("*")]

    # If the block is mostly bullets, convert into one narrative paragraph.
    if bullets and len(bullets) >= max(2, len(heads)):
        head_text = " ".join(heads).strip()
        bullet_text = ", ".join(bullets).strip()
        if head_text and not head_text.endswith((".", "?", "!", "습니다", "다", "요")):
            head_text += "입니다."
        if head_text:
            return f"{head_text} 구체적으로는 {bullet_text} 등으로 나타납니다."
        return f"구체적으로는 {bullet_text} 등으로 나타납니다."

    # Otherwise, merge lines into a clean paragraph with minimal line breaks.
    merged = " ".join(lines)
    merged = re.sub(r"\s{2,}", " ", merged).strip()
    return merged


def narrativize_chapter(chapter: Dict[str, Any]) -> Dict[str, Any]:
    blocks_in = chapter.get("blocks", [])
    blocks_out: List[str] = []
    for b in blocks_in:
        nb = narrativize_block(str(b))
        if nb:
            blocks_out.append(nb)
    return {
        "no": chapter.get("no"),
        "title": chapter.get("title"),
        "blocks": blocks_out,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--in", dest="in_path", required=True)
    parser.add_argument("--out", dest="out_path", required=True)
    args = parser.parse_args()

    with open(args.in_path, "r", encoding="utf-8") as f:
        src = json.load(f)

    out: Dict[str, Any] = {
        "meta": {**(src.get("meta") or {}), "variant": "narrative"},
        "chapters": [narrativize_chapter(c) for c in (src.get("chapters") or [])],
        "appendix": src.get("appendix") or {},
    }

    os.makedirs(os.path.dirname(args.out_path), exist_ok=True)
    with open(args.out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    print(args.out_path)


if __name__ == "__main__":
    main()

