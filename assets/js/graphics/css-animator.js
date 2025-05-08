// assets/js/graphics/css-animator.js - JS control for CSS animations 
export function triggerAnimation(element, animationName) { element.style.animation = 'none'; void element.offsetWidth; /* trigger reflow */ element.style.animation = null; element.classList.add(animationName); } 
