const DEFAULT_OPTIONS = Object.freeze({
  targetClass: 'is-pressing',
  rippleClass: 'is-ripple'
});

export function createPressRipple(options = {}) {
  if (typeof window === 'undefined') return () => {};

  const {
    trigger,
    target,
    ripple,
    targetClass = DEFAULT_OPTIONS.targetClass,
    rippleClass = DEFAULT_OPTIONS.rippleClass
  } = options;

  if (!trigger || !target) return () => {};

  const restartClass = (el, className) => {
    if (!el || !className) return;
    el.classList.remove(className);
    // Force reflow so the animation can restart.
    void el.offsetWidth;
    el.classList.add(className);
  };

  const handleDown = () => {
    restartClass(target, targetClass);
    if (ripple) {
      restartClass(ripple, rippleClass);
    }
  };

  const onTargetEnd = () => target.classList.remove(targetClass);
  const onRippleEnd = () => ripple?.classList.remove(rippleClass);

  trigger.addEventListener('pointerdown', handleDown);
  target.addEventListener('animationend', onTargetEnd);
  ripple?.addEventListener('animationend', onRippleEnd);

  return () => {
    trigger.removeEventListener('pointerdown', handleDown);
    target.removeEventListener('animationend', onTargetEnd);
    ripple?.removeEventListener('animationend', onRippleEnd);
  };
}
