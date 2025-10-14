/*
==================================================
MODE ANIMATION
==================================================
Drive mode dial animation sequence
Used by: Solution section only
==================================================
*/

// Wait for DOM to be fully loaded
(function () {

    // Get DOM elements
    const engineStatus = document.getElementById('engineStatus');
    const modeVisualizer = document.getElementById('modeVisualizer');
    const currentMode = document.getElementById('currentMode');
    const dialSlider = document.getElementById('dialSlider');

    // Exit early if elements don't exist (not on solution section)
    if (!engineStatus || !currentMode || !dialSlider) {
        return;
    }

    // ==================== HELPER FUNCTIONS ====================

    /**
     * Convert polar coordinates to cartesian
     * Used for positioning mode labels around the dial
     */
    function polarToCartesian(centerX, centerY, radius, angleInDegrees, offsetX = 0, offsetY = 0) {
        const angleInRadians = angleInDegrees * Math.PI / 180;
        return {
            x: centerX + radius * Math.cos(angleInRadians) + offsetX,
            y: centerY + radius * Math.sin(angleInRadians) + offsetY
        };
    }

    // ==================== LABEL POSITIONING ====================

    // Configuration for label positions around the dial
    const label_position_config = {
        center: { x: 240, y: 240 },
        labelRadius: 180,  // Distance from center
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

    // Calculate positions for each mode label
    const positions = {
        wet: {
            angle: label_position_config.angles.wet,
            ...polarToCartesian(
                label_position_config.center.x,
                label_position_config.center.y,
                label_position_config.labelRadius,
                label_position_config.angles.wet,
                label_position_config.offsets.wet.x,
                label_position_config.offsets.wet.y
            )
        },
        normal: {
            angle: label_position_config.angles.normal,
            ...polarToCartesian(
                label_position_config.center.x,
                label_position_config.center.y,
                label_position_config.labelRadius,
                label_position_config.angles.normal,
                label_position_config.offsets.normal.x,
                label_position_config.offsets.normal.y
            )
        },
        sport: {
            angle: label_position_config.angles.sport,
            ...polarToCartesian(
                label_position_config.center.x,
                label_position_config.center.y,
                label_position_config.labelRadius,
                label_position_config.angles.sport,
                label_position_config.offsets.sport.x,
                label_position_config.offsets.sport.y
            )
        },
        sportPlus: {
            angle: label_position_config.angles.sportPlus,
            ...polarToCartesian(
                label_position_config.center.x,
                label_position_config.center.y,
                label_position_config.labelRadius,
                label_position_config.angles.sportPlus,
                label_position_config.offsets.sportPlus.x,
                label_position_config.offsets.sportPlus.y
            )
        }
    };

    // Get SVG and set label positions
    const svg = document.getElementById('modeSvg');
    const labelData = [
        { id: 'labelWet', class: 'wet', text: 'WET', pos: positions.wet },
        { id: 'labelNormal', class: 'normal', text: 'NORMAL', pos: positions.normal },
        { id: 'labelSport', class: 'sport', text: 'SPORT', pos: positions.sport },
        { id: 'labelSportPlus', class: 'sport-plus', text: 'SPORT+', pos: positions.sportPlus }
    ];

    // Position each label
    labelData.forEach(data => {
        const label = document.getElementById(data.id);
        if (label) {
            label.setAttribute('x', data.pos.x);
            label.setAttribute('y', data.pos.y);
        }
    });

    // Get label elements for highlighting
    const labels = {
        wet: document.getElementById('labelWet'),
        normal: document.getElementById('labelNormal'),
        sport: document.getElementById('labelSport'),
        'sport-plus': document.getElementById('labelSportPlus')
    };

    // ==================== MODE CONFIGURATION ====================

    // Define all drive modes and their properties
    const driveModes = [
        { mode: 'NORMAL', class: 'normal', duration: 1750, rotation: 140 },
        { mode: 'WET', class: 'wet', duration: 1750, rotation: 210 },
        { mode: 'SPORT', class: 'sport', duration: 1750, rotation: 290 },
        { mode: 'SPORT+', class: 'sport-plus', duration: 1750, rotation: 0 }
    ];

    let lastMode = null;

    /**
     * Get random mode excluding specified modes
     * @param {Array|Object} excludeModes - Mode(s) to exclude
     * @returns {Object} Random mode object
     */
    function getRandomMode(excludeModes) {
        const excludeArray = Array.isArray(excludeModes) ? excludeModes : [excludeModes];
        const availableModes = driveModes.filter(mode => !excludeArray.includes(mode));
        const randomIndex = Math.floor(Math.random() * availableModes.length);
        return availableModes[randomIndex];
    }

    // ==================== DISPLAY UPDATE ====================

    /**
     * Update the display with current mode
     * @param {Object} mode - Mode object to display
     * @param {String} status - Engine status text
     */
    function updateDisplay(mode, status) {
        // Update engine status
        engineStatus.textContent = status;
        if (status === 'ENGINE ON') {
            engineStatus.classList.add('active');
        } else {
            engineStatus.classList.remove('active');
        }

        // Reset center mode text
        currentMode.classList.remove('active');

        // Reset all label highlights
        Object.values(labels).forEach(label => {
            if (label) label.classList.remove('active');
        });

        // Update display after brief delay for smooth transition
        setTimeout(() => {
            if (mode) {
                // Rotate slider to mode position
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
                // Reset to default state
                currentMode.className = 'current-mode active';
                currentMode.textContent = '---';
                dialSlider.style.transform = 'rotate(69deg)';
                dialSlider.className.baseVal = 'dial-slider';
            }
        }, 300);
    }

    // ==================== ANIMATION SEQUENCE ====================

    /**
     * Main sequence: Engine off -> Last mode (if exists) -> Random modes
     */
    function runSequence() {
        // Start with engine off
        updateDisplay(null, 'ENGINE OFF');

        setTimeout(() => {
            if (lastMode) {
                // If there was a previous mode, show it first
                updateDisplay(lastMode, 'ENGINE ON');
                setTimeout(() => {
                    cycleRandomModes();
                }, lastMode.duration);
            } else {
                // No previous mode, start cycling random modes
                cycleRandomModes();
            }
        }, 2000);
    }

    /**
     * Cycle through random modes
     * Shows 2 random modes, avoiding NORMAL on final mode
     */
    function cycleRandomModes() {
        let currentIndex = 0;
        const maxModes = 2;
        let currentMode = lastMode;

        function showNextMode() {
            if (currentIndex < maxModes) {
                let mode;

                // Last mode: exclude both current mode and NORMAL
                if (currentIndex === maxModes - 1) {
                    mode = getRandomMode([currentMode, driveModes.find(m => m.mode === 'NORMAL')]);
                } else {
                    // Just exclude current mode
                    mode = getRandomMode([currentMode]);
                }

                updateDisplay(mode, 'ENGINE ON');
                lastMode = mode;
                currentMode = mode;

                currentIndex++;

                if (currentIndex >= maxModes) {
                    // Finished cycling, restart sequence
                    setTimeout(() => {
                        runSequence();
                    }, mode.duration);
                } else {
                    // Show next mode
                    setTimeout(showNextMode, mode.duration);
                }
            }
        }

        showNextMode();
    }

    // ==================== START ANIMATION ====================

    // ==================== START ANIMATION ====================

    /**
     * Start animation when mode visualizer is visible
     * Uses Intersection Observer to detect when user scrolls to section
     */
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Start animation when visible
                setTimeout(runSequence, 200);
                // Stop observing after first trigger (animation loops itself)
                animationObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.3,  // Trigger when 30% of element is visible
        rootMargin: '0px'
    });

    // Observe the mode visualizer
    if (modeVisualizer) {
        animationObserver.observe(modeVisualizer);
    }
})();
