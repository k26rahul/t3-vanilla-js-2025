export function applyAndRemoveAnimationClasses(element, classes, callback) {
  function handleAnimationEnd() {
    element.classList.remove(...classes);
    element.removeEventListener('animationend', handleAnimationEnd);
    if (callback) callback();
  }
  element.classList.add(...classes);
  element.addEventListener('animationend', handleAnimationEnd);
}
