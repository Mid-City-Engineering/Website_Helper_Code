/*
==================================================
KEY FOB ANIMATION (UNIVERSAL)
==================================================
Interactive sequence: Panic press → Signal → Car starts
Works with any element that has data-key-animation attribute

Usage in HTML:
<div id="keyVisualizer" data-key-animation>
  <!-- SVG with specific IDs for animation targets -->
  <svg>
    <circle id="panicButton" />
    <circle id="wave1" />
    <circle id="wave2" />
    <circle id="wave3" />
    <!-- etc -->
  </svg>
</div>

Required element IDs:
- keyStatus (text element)
- panicButton (clickable button)
- wave1, wave2, wave3 (signal waves)
- car elements: .car-silhouette, leftLight, rightLight, vapor
==================================================
*/

(function () {

    // Get DOM elements
    const keyStatus = document.getElementById('keyStatus');
    const panicButton = document.getElementById('panicButton');
    const wave1 = document.getElementById('wave1');
    const wave2 = document.getElementById('wave2');
    const wave3 = document.getElementById('wave3');
    const car = document.querySelector('#car .car-silhouette');
    const leftLight = document.getElementById('leftLight');
    const rightLight = document.getElementById('rightLight');
    const vapor = document.getElementById('vapor');
    const keyVisualizer = document.querySelector('[data-key-animation]');

    // Exit early if elements don't exist
    if (!keyStatus || !panicButton || !keyVisualizer) {
        return;
    }

    let isAnimating = false;

    /**
     * Main animation sequence
     */
    function runAnimation() {
        if (isAnimating) return;
        isAnimating = true;

        // Step 1: Press panic button
        keyStatus.textContent = 'PANIC PRESSED';
        keyStatus.classList.add('active');
        panicButton.classList.add('pressed');

        setTimeout(() => {
            // Step 2: Send signal waves
            keyStatus.textContent = 'SENDING SIGNAL';

            if (wave1) wave1.classList.add('active');
            setTimeout(() => { if (wave2) wave2.classList.add('active'); }, 200);
            setTimeout(() => { if (wave3) wave3.classList.add('active'); }, 400);

            // Remove wave classes after animation
            setTimeout(() => {
                if (wave1) wave1.classList.remove('active');
                if (wave2) wave2.classList.remove('active');
                if (wave3) wave3.classList.remove('active');
            }, 1500);

        }, 500);

        setTimeout(() => {
            // Step 3: Car starts
            keyStatus.textContent = 'ENGINE STARTED';
            panicButton.classList.remove('pressed');

            if (car) car.classList.add('active');
            if (leftLight) leftLight.classList.add('active');
            if (rightLight) rightLight.classList.add('active');
            if (vapor) vapor.classList.add('active');

        }, 2000);

        setTimeout(() => {
            // Step 4: Reset for next cycle
            keyStatus.textContent = 'PRESS PANIC BUTTON';
            keyStatus.classList.remove('active');

            if (car) car.classList.remove('active');
            if (leftLight) leftLight.classList.remove('active');
            if (rightLight) rightLight.classList.remove('active');
            if (vapor) vapor.classList.remove('active');

            isAnimating = false;

        }, 5000);
    }

    // Click to trigger animation
    panicButton.addEventListener('click', runAnimation);

    // Auto-start animation when visible
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(runAnimation, 500);
                animationObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.4
    });

    animationObserver.observe(keyVisualizer);

})();
