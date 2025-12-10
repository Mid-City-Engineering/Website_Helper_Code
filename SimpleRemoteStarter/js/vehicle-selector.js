/*
==================================================
VEHICLE SELECTOR (UNIVERSAL)
==================================================
Interactive vehicle compatibility selector
Flow: Make → Model → Year → Results

Usage:
1. Include this JS file in your HTML
2. Configure the data source URL in the VehicleSelector constructor
3. Ensure HTML has the required element IDs (see documentation)

Required HTML Elements:
- #loading-state: Loading indicator
- #make-step, #model-step, #year-step, #results-step: Step containers
- #make-grid, #model-grid, #year-grid: Card containers
- #selected-vehicle, #selected-sku, #product-link: Result displays

Data Format (JSON):
[
  {
    "make": "Mercedes-Benz",
    "model": "C-Class",
    "years": "2015-2021",
    "sku": "SKS-MB-001",
    "productUrl": "https://example.com/product-page"
  }
]
==================================================
*/

(function () {

    class VehicleSelector {
        constructor() {
            this.vehicles = [];
            this.selectedMake = null;
            this.selectedModel = null;
            this.selectedYear = null;
            this.currentStep = 'make';

            // Configuration - update this URL to your data endpoint
            // this.dataUrl = 'https://mid-city-engineering.odoo.com/documents/content/uPXGwmWkQLqKcRYpy8jl7Qo15';
            this.dataUrl = '../data/vehicle_compatibility_list.json';

            this.init();
        }

        async init() {
            console.log('🚀 Vehicle Selector: Initializing...');
            try {
                console.log('📡 Fetching vehicle data...');
                await this.loadData();
                console.log('✅ Data loaded successfully:', this.vehicles.length, 'entries');
                console.log('Sample entry:', this.vehicles[0]);
                this.hideLoading();
                this.renderMakes();
                console.log('✅ Make selection rendered');
            } catch (error) {
                console.error('❌ Error loading vehicle data:', error);
                const loadingEl = document.getElementById('loading-state');
                if (loadingEl) {
                    loadingEl.textContent = 'Error loading vehicle data. Please refresh the page.';
                }
            }
        }

        async loadData() {
            console.log('📥 Fetching from URL:', this.dataUrl);
            const response = await fetch(this.dataUrl);
            console.log('📦 Response status:', response.status, response.statusText);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const text = await response.text();
            console.log('📄 Response text length:', text.length);
            console.log('📄 First 200 chars:', text.substring(0, 200));

            this.vehicles = JSON.parse(text);
            console.log('✅ JSON parsed successfully');
        }

        hideLoading() {
            console.log('👻 Hiding loading state and showing make-step');
            const loadingEl = document.getElementById('loading-state');
            const makeStepEl = document.getElementById('make-step');

            if (loadingEl) loadingEl.classList.add('selector-hidden');
            if (makeStepEl) makeStepEl.classList.remove('selector-hidden');
            console.log('✅ Make step should now be visible');
        }

        // ==================== STEP 1: MAKE ====================

        renderMakes() {
            console.log('🎨 Rendering makes...');
            const makes = [...new Set(this.vehicles.map(v => v.make))].sort();
            console.log('Found makes:', makes);

            const makeGrid = document.getElementById('make-grid');
            if (!makeGrid) {
                console.error('❌ make-grid element not found!');
                return;
            }
            makeGrid.innerHTML = '';

            makes.forEach(make => {
                const modelCount = [...new Set(
                    this.vehicles
                        .filter(v => v.make === make)
                        .map(v => v.model)
                )].length;

                console.log(`Creating card for ${make} (${modelCount} models)`);

                const card = document.createElement('div');
                card.className = 'selector-card';
                card.innerHTML = `
                    <h3>${make}</h3>
                    <p>${modelCount} model${modelCount > 1 ? 's' : ''}</p>
                `;
                card.onclick = () => this.selectMake(make);
                makeGrid.appendChild(card);
            });

            console.log('✅ Make cards rendered');
        }

        selectMake(make) {
            this.selectedMake = make;
            this.currentStep = 'model';
            this.renderModels();
            this.showStep('model-step');
        }

        // ==================== STEP 2: MODEL ====================

        renderModels() {
            // Get unique models for selected make
            const models = [...new Set(
                this.vehicles
                    .filter(v => v.make === this.selectedMake)
                    .map(v => v.model)
            )].sort();

            const modelGrid = document.getElementById('model-grid');
            if (!modelGrid) return;

            modelGrid.innerHTML = '';

            models.forEach(model => {
                const card = document.createElement('div');
                card.className = 'selector-card';
                card.innerHTML = `<h3>${model}</h3>`;
                card.onclick = () => this.selectModel(model);
                modelGrid.appendChild(card);
            });
        }

        selectModel(model) {
            this.selectedModel = model;
            this.currentStep = 'year';
            this.renderYears();
            this.showStep('year-step');
        }

        // ==================== STEP 3: YEAR ====================

        renderYears() {
            console.log('🎨 Rendering year ranges...');

            // Get all entries for this make/model
            const entries = this.vehicles.filter(v =>
                v.make === this.selectedMake &&
                v.model === this.selectedModel
            );

            console.log(`Found ${entries.length} entries for ${this.selectedMake} ${this.selectedModel}`);

            const yearGrid = document.getElementById('year-grid');
            if (!yearGrid) {
                console.error('❌ year-grid element not found!');
                return;
            }
            yearGrid.innerHTML = '';

            // Display each entry as a year range card
            entries.forEach(entry => {
                const card = document.createElement('div');
                card.className = 'selector-card';
                card.innerHTML = `
                    <h3>${entry.years}</h3>
                    <p>${entry.sku}</p>
                `;
                card.onclick = () => this.selectYearRange(entry);
                yearGrid.appendChild(card);
                console.log(`Created card for ${entry.years} → ${entry.sku}`);
            });

            console.log('✅ Year range cards rendered');
        }

        selectYearRange(vehicle) {
            console.log('Selected year range:', vehicle.years, '→', vehicle.sku);
            this.showResults(vehicle);
            this.showStep('results-step');
        }

        // ==================== STEP 4: RESULTS ====================

        showResults(vehicle) {
            const vehicleName = `${vehicle.make} ${vehicle.model} (${vehicle.years})`;

            const vehicleNameEl = document.getElementById('selected-vehicle');
            const skuEl = document.getElementById('selected-sku');
            const productLinkEl = document.getElementById('product-link');

            if (vehicleNameEl) vehicleNameEl.textContent = vehicleName;
            if (skuEl) skuEl.textContent = vehicle.sku;
            if (productLinkEl) productLinkEl.href = vehicle.productUrl;

            console.log('✅ Results displayed:', vehicleName, '→', vehicle.sku);
        }

        // ==================== NAVIGATION ====================

        showStep(stepId) {
            // Hide all steps
            document.querySelectorAll('.selector-step').forEach(step => {
                step.classList.add('selector-hidden');
            });

            // Show selected step
            const targetStep = document.getElementById(stepId);
            if (targetStep) {
                targetStep.classList.remove('selector-hidden');
            }

            // Scroll to top of section smoothly
            const section = document.querySelector('.compatibility-section');
            if (section) {
                section.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }

        goToMake() {
            this.selectedMake = null;
            this.selectedModel = null;
            this.selectedYear = null;
            this.currentStep = 'make';
            this.showStep('make-step');
        }

        goToModel() {
            this.selectedModel = null;
            this.selectedYear = null;
            this.currentStep = 'model';
            this.showStep('model-step');
        }

        reset() {
            this.goToMake();
        }
    }

    // Initialize selector when page loads
    window.vehicleSelector = new VehicleSelector();

})();
