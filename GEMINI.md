# Project Guidelines & Rules

## Accessible Interactive Overlays & Animation Safety

1. **Never use `display: none` in `prefers-reduced-motion` for functional UI or mascots:**
   - Reduced motion preferences indicate a need to minimize rapid motion and vestibular triggers, not to erase components.
   - Under `prefers-reduced-motion: reduce`, freeze rapid translation or infinite movement and keep the element static and visible. Provide explicit user-facing toggles (e.g., `Mascot: On / Off`) for complete dismissal.

2. **Root Stacking Context for Fixed Companions & Overlays:**
   - Always inject fixed global widgets (`pointer-events`, mascots, floating HUDs) as immediate children of `<body>` with an authoritative `z-index` (e.g., `9999`) to prevent clipping or stacking context entrapment by parent transforms, filters, or sibling wrappers.

3. **Multi-Action Sprite State Machines:**
   - When extracting multiple video clips into interactive sprite sheets, standardize frame aspect ratios and bounding boxes across all actions (`running`, `inspecting`, `working`) so transitions between sprites occur with zero layout shifts.
