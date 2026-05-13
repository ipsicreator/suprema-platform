# Suprema Design Skill

Purpose:
- Apply `design.md` rules consistently across landing, intro, diagnosis, and report screens.

When to use:
- Any UI/UX change in this repository.

Workflow:
1. Read `/design.md` first.
2. Keep dark premium tone with cyan/mint accent.
3. Enforce text stability:
   - `word-break: keep-all`
   - `overflow-wrap: anywhere`
   - responsive 1-column fallback below 980px.
4. Keep CTA hierarchy:
   - primary gradient button
   - secondary outlined dark button.
5. For report tables, always ensure fixed layout and safe wrapping in cells.

Output checklist:
- Visual consistency with `design.md`
- No broken Korean text
- No overflow or clipped content
- Mobile and desktop both readable