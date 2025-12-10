/*
==================================================
FADE OUT ON SCROLL (UNIVERSAL)
==================================================
Fades out elements as their parent section scrolls
Uses data-fade-scroll attribute to mark elements for fading

Usage in HTML:
<section data-fade-container>
  <h1 data-fade-scroll>This will fade out</h1>
  <p data-fade-scroll>This will also fade out</p>
</section>

The fade starts at 15% scroll and completes at 75% of the container height
==================================================
*/

(function () {
    // Find all containers that have fade elements
    const fadeContainers = document.querySelectorAll('[data-fade-container]');

    if (fadeContainers.length > 0) {
        window.addEventListener('scroll', () => {
            fadeContainers.forEach(container => {
                const fadeElements = container.querySelectorAll('[data-fade-scroll]');

                if (fadeElements.length > 0) {
                    const scrolled = window.pageYOffset;
                    const containerHeight = container.offsetHeight;

                    // Start fading at 15% scroll, complete at 75%
                    const fadeStart = containerHeight * 0.15;
                    const fadeEnd = containerHeight * 0.75;
                    const fadeRange = fadeEnd - fadeStart;

                    const opacity = scrolled < fadeStart ? 1 :
                        scrolled > fadeEnd ? 0 :
                            1 - ((scrolled - fadeStart) / fadeRange);

                    fadeElements.forEach(element => {
                        element.style.opacity = opacity;
                    });
                }
            });
        });
    }
})();
