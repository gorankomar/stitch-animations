# Complaint: overriding an established component

Recorded from user feedback on Buy Now Pay Later, 2026-10-02.

The Credit Card was already an approved, finished reusable component. Illustration-specific CSS changed its card type size and position, digits, provider, logo, spacing, and other internal styles. The resulting card looked different from the established component. This was unnecessary and violated the intended reuse contract.

Once a component is established, preserve its internal appearance unless the user explicitly requests a change. Reusing a component does not authorize restyling its descendants. Select its supported variant and props; position and animate outer wrappers. Do not add CSS overrides simply to make a reused component fit an illustration.

If a specific adjustment is authorized, such as logo size, make only that adjustment through an existing prop or a narrowly scoped supported mechanism. Do not rewrite surrounding typography, provider sizing, number placement, padding, or layout. Prefer proportional sizing of the complete component and avoid extra CSS where existing styles already solve the need.

For Buy Now Pay Later, the user is cleaning up the Webflow styles themselves. Do not perform component cleanup or reapply the rejected overrides from local source/build artifacts. The existing CSS and earlier verification notes must not be treated as approval of those card changes.

Before integrating another illustration, inspect each reused component and confirm the integration changes only its supported props and outer composition. Review added selectors targeting component descendants and remove unjustified overrides before delivery.
