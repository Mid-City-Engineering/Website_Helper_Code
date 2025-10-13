/*
==================================================
SCROLL ANIMATIONS
==================================================
Intersection Observer for fade-in animations on scroll
Used by: Problem section, Solution section
==================================================
*/

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {

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

    // Observe all red cards (problem section, CTA section)
    document.querySelectorAll('.universal-red-card').forEach(card => {
        observer.observe(card);
    });

    // Observe all feature list items (solution section)
    document.querySelectorAll('.feature-list li').forEach(item => {
        observer.observe(item);
    });

});
