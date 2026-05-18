from __future__ import annotations

import argparse
import json
import os
import re
import zipfile
from dataclasses import dataclass
from typing import Dict, List, Optional
from xml.etree import ElementTree as ET


OUT_JSON_DEFAULT = os.path.join("data", "ipsidna_prism", "ebook_source.json")


def _read_text(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read().lstrip("\ufeff")


def _docx_to_paragraphs(path: str) -> List[str]:
    # Minimal docx text extraction (no external deps).
    with zipfile.ZipFile(path) as z:
        xml = z.read("word/document.xml")
    root = ET.fromstring(xml)
    ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}

    paras: List[str] = []
    for p in root.findall(".//w:p", ns):
        texts = []
        for t in p.findall(".//w:t", ns):
            if t.text:
                texts.append(t.text)
        line = "".join(texts).strip()
        if line:
            paras.append(line)
    return paras


@dataclass
class Chapter:
    no: str
    title: str
    blocks: List[str]


_CH_RE = re.compile(r"^CHAPTER\s+(\d+)\s*$", re.IGNORECASE)


def _split_chapters(raw: str) -> List[Chapter]:
    lines = [ln.rstrip() for ln in raw.replace("\r\n", "\n").split("\n")]
    chapters: List[Chapter] = []

    current_no: Optional[str] = None
    current_title: Optional[str] = None
    buf: List[str] = []

    def flush():
        nonlocal current_no, current_title, buf
        if current_no and current_title:
            blocks = _lines_to_blocks(buf)
            chapters.append(Chapter(no=current_no.zfill(2), title=current_title.strip(), blocks=blocks))
        current_no = None
        current_title = None
        buf = []

    i = 0
    while i < len(lines):
        m = _CH_RE.match(lines[i].strip())
        if m:
            flush()
            current_no = m.group(1)
            # Next non-empty line is title
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            current_title = lines[j].strip() if j < len(lines) else f"CHAPTER {current_no}"
            i = j + 1
            continue

        if current_no:
            buf.append(lines[i])
        i += 1

    flush()
    return chapters


def _lines_to_blocks(lines: List[str]) -> List[str]:
    # Join into paragraphs; treat long underscores as separators.
    blocks: List[str] = []
    buf: List[str] = []

    def push():
        nonlocal buf
        text = "\n".join([x for x in buf if x.strip()]).strip()
        if text:
            blocks.append(text)
        buf = []

    for ln in lines:
        if re.match(r"^_+\s*$", ln.strip()):
            push()
            continue
        if not ln.strip():
            push()
            continue
        buf.append(ln)
    push()
    return blocks


def _infer_appendix(paras: List[str]) -> Dict[str, List[str]]:
    # We keep this conservative: split by simple headings if present.
    sections: Dict[str, List[str]] = {"ALL": list(paras)}
    current = "ALL"
    for p in list(paras):
        head = p.strip()
        if re.match(r"^(A|B|C|D)\.\s*", head):
            current = head.split(" ", 1)[0]  # e.g. "A."
            sections.setdefault(current, [])
        if current != "ALL":
            sections.setdefault(current, []).append(p)
    return sections


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manuscript", required=True)
    parser.add_argument("--appendix", required=False, default="")
    parser.add_argument("--out", required=False, default=OUT_JSON_DEFAULT)
    args = parser.parse_args()

    manuscript = _read_text(args.manuscript)
    chapters = _split_chapters(manuscript)

    appendix_paras: List[str] = []
    appendix_sections: Dict[str, List[str]] = {}
    if args.appendix and os.path.exists(args.appendix):
        appendix_paras = _docx_to_paragraphs(args.appendix)
        appendix_sections = _infer_appendix(appendix_paras)

    payload = {
        "meta": {
            "title": "입시DNA프리즘",
            "subtitle": "학습엔진 분석",
            "source_manuscript_path": args.manuscript,
            "source_appendix_path": args.appendix,
        },
        "chapters": [{"no": c.no, "title": c.title, "blocks": c.blocks} for c in chapters],
        "appendix": {
            "paragraphs": appendix_paras,
            "sections": appendix_sections,
        },
    }

    out_path = args.out
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    print(out_path)


if __name__ == "__main__":
    main()
