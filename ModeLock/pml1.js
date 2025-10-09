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
const engineStatus = document.getElementById('engineStatus');
const modeVisualizer = document.getElementById('modeVisualizer');
const currentMode = document.getElementById('currentMode');
const dialSlider = document.getElementById('dialSlider');

function polarToCartesian(centerX, centerY, radius, angleInDegrees, offsetX = 0, offsetY = 0) {
    const angleInRadians = angleInDegrees * Math.PI / 180;
    return {
        x: centerX + radius * Math.cos(angleInRadians) + offsetX,
        y: centerY + radius * Math.sin(angleInRadians) + offsetY
    };
}

const label_position_config = {
    center: { x: 225, y: 225 },
    labelRadius: 160,  // Pushed further out
    angles: {
        normal: 165,       // Bottom-left
        wet: 225,          // Top-Left
        sport: 315,        // Top-Right
        sportPlus: 15      // Bottom-right
    },
    offsets: {
        normal: { x: -10, y: 0 },
        wet: { x: 5, y: 0 },
        sport: { x: 0, y: 0 },
        sportPlus: { x: 10, y: 0 }
    }
};

// For a circle at (160, 160) with radius 160 (outside the dial)
// WET at 225°, NORMAL at 135°, SPORT at 45°, SPORT+ at 315°
const positions = {
    wet: {
        angle: label_position_config.angles.wet,
        ...polarToCartesian(label_position_config.center.x, label_position_config.center.y, label_position_config.labelRadius, label_position_config.angles.wet, label_position_config.offsets.wet.x, label_position_config.offsets.wet.y)
    },
    normal: {
        angle: label_position_config.angles.normal,
        ...polarToCartesian(label_position_config.center.x, label_position_config.center.y, label_position_config.labelRadius, label_position_config.angles.normal, label_position_config.offsets.normal.x, label_position_config.offsets.normal.y)
    },
    sport: {
        angle: label_position_config.angles.sport,
        ...polarToCartesian(label_position_config.center.x, label_position_config.center.y, label_position_config.labelRadius, label_position_config.angles.sport, label_position_config.offsets.sport.x, label_position_config.offsets.sport.y)
    },
    sportPlus: {
        angle: label_position_config.angles.sportPlus,
        ...polarToCartesian(label_position_config.center.x, label_position_config.center.y, label_position_config.labelRadius, label_position_config.angles.sportPlus, label_position_config.offsets.sportPlus.x, label_position_config.offsets.sportPlus.y)
    }
};

const svg = document.getElementById('modeSvg');
const labelData = [
    { id: 'labelWet', class: 'wet', text: 'WET', pos: positions.wet },
    { id: 'labelNormal', class: 'normal', text: 'NORMAL', pos: positions.normal },
    { id: 'labelSport', class: 'sport', text: 'SPORT', pos: positions.sport },
    { id: 'labelSportPlus', class: 'sport-plus', text: 'SPORT+', pos: positions.sportPlus }
];

labelData.forEach(data => {
    const label = document.getElementById(data.id);
    label.setAttribute('x', data.pos.x);
    label.setAttribute('y', data.pos.y);
});

const labels = {
    wet: document.getElementById('labelWet'),
    normal: document.getElementById('labelNormal'),
    sport: document.getElementById('labelSport'),
    'sport-plus': document.getElementById('labelSportPlus')
};

const driveModes = [
    { mode: 'NORMAL', class: 'normal', duration: 1750, rotation: 140 },
    { mode: 'WET', class: 'wet', duration: 1750, rotation: 210 },
    { mode: 'SPORT', class: 'sport', duration: 1750, rotation: 290 },
    { mode: 'SPORT+', class: 'sport-plus', duration: 1750, rotation: 0 }
];

let lastMode = null;

function getRandomMode(excludeModes) {
    // Convert single mode to array for backwards compatibility
    const excludeArray = Array.isArray(excludeModes) ? excludeModes : [excludeModes];

    const availableModes = driveModes.filter(mode => !excludeArray.includes(mode));
    const randomIndex = Math.floor(Math.random() * availableModes.length);
    return availableModes[randomIndex];
}

function updateDisplay(mode, status) {
    engineStatus.textContent = status;
    if (status === 'ENGINE ON') {
        engineStatus.classList.add('active');
    } else {
        engineStatus.classList.remove('active');
    }

    currentMode.classList.remove('active');

    // Reset all labels
    Object.values(labels).forEach(label => label.classList.remove('active'));

    setTimeout(() => {
        if (mode) {
            // Rotate the slider to the mode position
            dialSlider.style.transform = `rotate(${mode.rotation}deg)`;
            dialSlider.className.baseVal = 'dial-slider ' + mode.class;

            // Update center text
            currentMode.className = 'current-mode active ' + mode.class;
            currentMode.textContent = mode.mode;

            // Highlight active label
            const labelKey = mode.class;
            if (labels[labelKey]) {
                labels[labelKey].classList.add('active');
            }
        } else {
            currentMode.className = 'current-mode active';
            currentMode.textContent = '---';
            dialSlider.style.transform = 'rotate(69deg)';
            dialSlider.className.baseVal = 'dial-slider';
        }
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
    const maxModes = 2;
    let currentMode = lastMode;

    function showNextMode() {
        if (currentIndex < maxModes) {
            let mode;

            // If this is the last mode, exclude both current mode and NORMAL
            if (currentIndex === maxModes - 1) {
                mode = getRandomMode([currentMode, driveModes.find(m => m.mode === 'NORMAL')]);
            } else {
                mode = getRandomMode([currentMode]);
            }

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
