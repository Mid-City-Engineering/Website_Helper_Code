/*
==================================================
FADE IN ON SCROLL (UNIVERSAL)
==================================================
Intersection Observer for fade-in animations on scroll
Uses data-fade-in attribute to mark elements for fade-in effect

Usage in HTML:
<div class="universal-red-card" data-fade-in>Content</div>
<div class="universal-green-card" data-fade-in>Content</div>
<li data-fade-in>List item</li>

Works with ANY element that has data-fade-in attribute
==================================================
*/

(function () {

    // Intersection Observer configuration
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };

    // Create observer instance
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger animation with delay
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
            }
        });
    }, observerOptions);

    // Observe all elements with data-fade-in attribute
    document.querySelectorAll('[data-fade-in]').forEach(element => {
        observer.observe(element);
    });

})();
