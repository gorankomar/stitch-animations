// CSS owns the stack geometry and pointer interaction. Reveal only runs the entrance.
export function createHeroStackController(section, revealController) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const onPreference = () => {
    if (reduced.matches) revealController.cancel();
  };

  if (!reduced.matches && section.dataset.revealEarlyState !== 'expired') {
    revealController.ensure();
  }
  reduced.addEventListener('change', onPreference);

  return () => {
    reduced.removeEventListener('change', onPreference);
    revealController.cancel();
  };
}
