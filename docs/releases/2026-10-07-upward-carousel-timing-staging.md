# Upward Carousel timing update — 2026-10-07

User changed the shared hold multiplier from 6 to 3 and move multiplier from 4 to 2, and authorized GitHub merge plus staging animation activation. This intentionally halves the cycle for Digital Wallet, Peer-to-Peer Transfers and Revolving Credit: at the 770ms global duration, hold is 2310ms, movement 1540ms, and each step 3850ms.

Digital Wallet’s initial movement-phase offset follows the shortened hold (3×duration), preserving immediate movement after its entrances. Loop-seam and per-property easing regression assertions use the new cycle. Geometry, easing and opacity behavior are unchanged.

Webflow remains unpublished, using Playground Preview with the permanent staging loader. Production is not authorized. Full shared release validation and deployment evidence follow in the GitHub PR/workflow.
