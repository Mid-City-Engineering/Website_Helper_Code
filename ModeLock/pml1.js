// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, index * 100);
        }
    });
}, observerOptions);

document.querySelectorAll('.problem-card').forEach(card => {
    observer.observe(card);
});

document.querySelectorAll('.feature-list li').forEach(item => {
    observer.observe(item);
});

// Mode sequence animation
const carStatus = document.getElementById('carStatus');
const modeDisplay = document.getElementById('modeDisplay');
const modeText = document.getElementById('modeText');

const driveModes = [
    { mode: 'SPORT', class: 'sport', duration: 1750 },
    { mode: 'SPORT+', class: 'sport-plus', duration: 1750 },
    { mode: 'TRACK', class: 'track', duration: 1750 },
    { mode: 'WET', class: 'wet', duration: 1750 }
];

let lastMode = null;

function getRandomMode(excludeMode) {
    const availableModes = driveModes.filter(mode => mode !== excludeMode);
    const randomIndex = Math.floor(Math.random() * availableModes.length);
    return availableModes[randomIndex];
}

function updateDisplay(mode, status) {
    carStatus.textContent = status;
    if (status === 'ENGINE ON') {
        carStatus.classList.add('active');
    } else {
        carStatus.classList.remove('active');
    }

    modeDisplay.classList.add('changing');
    modeText.classList.remove('active');

    setTimeout(() => {
        if (mode) {
            modeText.className = 'mode-text active ' + mode.class;
            modeText.textContent = mode.mode;
        } else {
            modeText.className = 'mode-text active';
            modeText.textContent = '---';
        }
        modeDisplay.classList.remove('changing');
    }, 300);
}

function runSequence() {
    updateDisplay(null, 'ENGINE OFF');

    setTimeout(() => {
        if (lastMode) {
            updateDisplay(lastMode, 'ENGINE ON');
            setTimeout(() => {
                cycleRandomModes();
            }, lastMode.duration);
        } else {
            cycleRandomModes();
        }
    }, 2000);
}

function cycleRandomModes() {
    let currentIndex = 0;
    const maxModes = 3;
    let currentMode = lastMode;

    function showNextMode() {
        if (currentIndex < maxModes) {
            const mode = getRandomMode(currentMode);
            updateDisplay(mode, 'ENGINE ON');
            lastMode = mode;
            currentMode = mode;

            currentIndex++;

            if (currentIndex >= maxModes) {
                setTimeout(() => {
                    runSequence();
                }, mode.duration);
            } else {
                setTimeout(showNextMode, mode.duration);
            }
        }
    }

    showNextMode();
}

setTimeout(runSequence, 1000);

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Parallax effect on hero background
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
        heroContent.style.opacity = 1 - (scrolled / 600);
    }
});
