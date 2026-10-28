# Webflow structure and shared styles

Applies to every new or edited Webflow element, illustration, component, and page section, whether or not it becomes a reusable component.

## Preserve appearance; minimize structure

Match the supplied Figma design while using the fewest elements and nesting levels needed for correct semantics, layout, responsive behavior, accessibility, and requested motion. Structural optimization must not change the visual composition, spacing, proportions, layering, or content.

Do not reproduce Figma's layer/group hierarchy automatically. Translate the visual result into an efficient Webflow structure. Prefer native semantic elements and direct children in flex/grid layouts; apply sizing, spacing, backgrounds, borders, and radii to the element that owns them instead of adding a wrapper for each property.

Every wrapper must have a concrete purpose that cannot reasonably be handled by an existing element: for example, a necessary layout group, clipping boundary, query container, semantic grouping, or independent motion transform. Combine compatible responsibilities on one element. Remove empty groups, single-child pass-through wrappers, and redundant sizing or positioning parents. Do not add seven or eight ancestor levels for a simple object; any deep structure must be justified by actual requirements, never by copied Figma groups or construction convenience.

Use the shallowest structure that still satisfies the design. Do not flatten meaningful semantics, remove required accessibility, or combine independent transforms in a way that breaks motion. Preserve established reusable component internals and appearance; optimize their integration using supported variants/props and only necessary outer wrappers. Follow [component preservation](component-preservation-complaint.md).

## Specific names and reusable classes

Name elements, components, and object-specific classes for the actual object and role being created. Prefer names such as `payment-summary`, `payment-summary-total`, and `payment-summary-icon` over `wrapper-7`, `div-block`, or generic `box` names. Follow existing project conventions and avoid accidental class collisions.

Before creating a style, inspect existing Webflow classes and the relevant component notes. Reuse an existing compatible shared class for recurring properties such as corner radius, spacing, or surface treatment. Apply that shared class alongside the object's specific class using Webflow's supported class/combo-class structure. Keep the shared property defined in one place so changing it updates every intended use.

Do not duplicate a shared radius value into each object's class or override it locally without a design requirement. Verify that a reused class produces the intended result in the target class combination; a name alone does not establish compatibility. Do not modify a shared class to satisfy one object if that would change unrelated consumers. When no compatible class exists and the property is genuinely shared, create a clearly named reusable class with a deliberate scope rather than repeating declarations.

Reuse existing variables where available and appropriate. A broader variable/token migration is separate work; this rule does not authorize one.

## Review before saving

- Inspect the final Navigator hierarchy. For each parent, identify its purpose and remove it if its child or existing parent can perform that role safely.
- Check object-specific names and reuse of existing shared styles. Ensure shared properties have one authoritative definition rather than repeated local overrides.
- Verify the Figma appearance and responsive behavior after structural changes, including clipping, layering, text wrapping, and requested motion.
- Record necessary unusual nesting or style exceptions in the object's component notes so later work does not reintroduce redundant structure.

Apply this rule to the requested scope. Existing unrelated components are not an automatic cleanup target.
