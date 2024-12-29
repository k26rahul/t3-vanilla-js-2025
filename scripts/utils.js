export function applyAndRemoveAnimationClasses(element, ...classes) {
  function handleAnimationEnd() {
    element.classList.remove(...classes);
    element.removeEventListener('animationend', handleAnimationEnd);
  }
  element.classList.add(...classes);
  element.addEventListener('animationend', handleAnimationEnd);
}
