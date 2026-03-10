/*
==================================================
FADE OUT ON SCROLL
==================================================
Fades out the tagline as the hero section scrolls
Tagline is fully transparent when hero is 75% scrolled
==================================================
*/

(function () {
    const tagline = document.querySelector('.tagline');
    const heroSection = document.querySelector('.hero-section');

    if (tagline && heroSection) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const heroHeight = heroSection.offsetHeight;

            // Start fading at 15% scroll, complete at 75%
            const fadeStart = heroHeight * 0.15;
            const fadeEnd = heroHeight * 0.75;
            const fadeRange = fadeEnd - fadeStart;

            const opacity = scrolled < fadeStart ? 1 :
                scrolled > fadeEnd ? 0 :
                    1 - ((scrolled - fadeStart) / fadeRange);

            tagline.style.opacity = opacity;
        });
    }
})();
