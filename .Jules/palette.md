## 2024-05-24 - Accessibility improvements to the mobile menu
**Learning:** Found an accessibility issue pattern where an icon-only button (mobile menu) was lacking context for screen readers and missing keyboard focus indicators.
**Action:** Always add `aria-label` and focus visibility classes (`focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`) to icon-only buttons.
