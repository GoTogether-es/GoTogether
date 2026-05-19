## 2024-05-24 - Accessibility improvements to the mobile menu
**Learning:** Found an accessibility issue pattern where an icon-only button (mobile menu) was lacking context for screen readers and missing keyboard focus indicators.
**Action:** Always add `aria-label` and focus visibility classes (`focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`) to icon-only buttons.
## 2026-05-19 - Accessibility improvements to custom dropdowns
**Learning:** Found an accessibility issue pattern where custom dropdown toggles missed aria-expanded/aria-haspopup state attributes and interactive items inside the dropdown lacked visible focus rings.
**Action:** Always add aria-expanded, aria-haspopup to dropdown toggles and focus visibility classes to all interactive items inside custom dropdowns.
