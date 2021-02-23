
// inject confetti-script from cdn
const script = document.createElement("script");
script.src =
  "https://cdn.jsdelivr.net/npm/canvas-confetti@1.3.3/dist/confetti.browser.min.js";
document.head.appendChild(script);

// throw some confetti where the element lives
window.throwConfetti = (el) => {

    // get relative coordinates of the center of the element
    const rect = el.getBoundingClientRect();
    const brect = document.body.getBoundingClientRect();
    const y = ((rect.top + rect.bottom ) / 2.0 ) / window.innerHeight;
    const x = ((rect.left + rect.right)  / 2.0 ) / window.innerWidth;

    // ta-daaaaa!
    confetti({
        particleCount: 3000,
        spread: 360,
        startVelocity: 30,
        origin: {x, y},
        //colors: ['#000', '#333', '#666']
    });

}
