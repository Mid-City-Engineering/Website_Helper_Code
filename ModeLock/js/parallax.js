/*
==================================================
PARALLAX EFFECT
==================================================
Hero section parallax scrolling effect
Used by: Hero section
==================================================
*/

(function () {

    const heroContent = document.querySelector('.hero-content');

    if (heroContent) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
            heroContent.style.opacity = 1 - (scrolled / 600);
        });
    }

})();
