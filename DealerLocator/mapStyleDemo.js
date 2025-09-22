<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
    <style>
        body {
            margin: 0;
        padding: 20px;
        font-family: Arial, sans-serif;
        }

        .maps-container {
            display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        max-width: 1200px;
        margin: 0 auto;
        }

        .map-item {
            background: white;
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .map-item.single {
            grid - column: 1 / -1;
        width: 50vw;
        margin: 0 auto;
        }

        .map-title {
            text - align: center;
        margin-bottom: 10px;
        font-weight: bold;
        color: #333;
        }

        .map-div {
            height: 300px;
        width: 100%;
        border-radius: 4px;
        overflow: hidden;
        }

        .loading {
            display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #666;
        }
    </style>


    <h2 style="text-align: center; margin-bottom: 30px;">6 Different Map Styles - Chicago Area Dealers</h2>

    <div class="maps-container">
        <div class="map-item">
            <div class="map-title">Standard</div>
            <div id="map1" class="map-div"><div class="loading">Loading dealers...</div></div>
        </div>

        <div class="map-item">
            <div class="map-title">Clean Light</div>
            <div id="map2" class="map-div"><div class="loading">Loading dealers...</div></div>
        </div>

        <div class="map-item">
            <div class="map-title">Dark</div>
            <div id="map3" class="map-div"><div class="loading">Loading dealers...</div></div>
        </div>

        <div class="map-item">
            <div class="map-title">Ultra Minimal</div>
            <div id="map4" class="map-div"><div class="loading">Loading dealers...</div></div>
        </div>

        <div class="map-item">
            <div class="map-title">Voyager</div>
            <div id="map5" class="map-div"><div class="loading">Loading dealers...</div></div>
        </div>

        <div class="map-item">
            <div class="map-title">Voyager Black</div>
            <div id="map6" class="map-div"><div class="loading">Loading dealers...</div></div>
        </div>
    </div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        // Get all dealer contacts from Odoo
        async function getDealerContacts() {
            try {
                const response = await fetch('/web/dataset/call_kw', {
            method: 'POST',
        headers: {
            'Content-Type': 'application/json',
                    },
        body: JSON.stringify({
            jsonrpc: '2.0',
        method: 'call',
        params: {
            model: 'res.partner',
        method: 'search_read',
        args: [[['category_id.name', '=', 'Dealer']]],
        kwargs: {
            fields: ['name', 'partner_latitude', 'partner_longitude', 'x_latitude', 'x_longitude', 'street', 'city', 'state_id', 'zip']
                            }
                        }
                    })
                });

        const data = await response.json();
        return data.result || [];
            } catch (error) {
            console.error('Error fetching dealers:', error);
        throw new Error('Unable to fetch dealer data');
            }
        }

        // Filter and format Chicago dealers
        function getChicagoDealers(dealers) {
            return dealers
                .filter(dealer => dealer.zip && String(dealer.zip).charAt(0) == '6')
                .map(dealer => ({
            lat: dealer.partner_latitude || dealer.x_latitude,
        lng: dealer.partner_longitude || dealer.x_longitude,
        name: dealer.name,
        popup: `<strong>${dealer.name}</strong><br>${dealer.street || ''}<br>${dealer.city || ''}, ${dealer.state_id ? dealer.state_id[1] : ''} ${dealer.zip || ''}`
                }))
                .filter(dealer => dealer.lat && dealer.lng);
        }

            // Initialize all maps
            async function initializeMaps() {
            try {
                console.log('Fetching dealer data...');
            const allDealers = await getDealerContacts();
            console.log('All dealers:', allDealers);

            const chicagoDealers = getChicagoDealers(allDealers);
            console.log('Chicago dealers:', chicagoDealers);

            if (chicagoDealers.length === 0) {
                console.warn('No Chicago dealers found with coordinates');
            // Fallback to sample data
            chicagoDealers.push({
                lat: 41.8781,
            lng: -87.6298,
            name: 'Sample Chicago Dealer',
            popup: '<strong>Sample Chicago Dealer</strong><br>No dealers found in database'
                    });
                }

                // Calculate center point (but default to Chicago if no dealers or use Chicago as fallback)
                let centerLat = 41.8781; // Chicago downtown
                let centerLng = -87.6298; // Chicago downtown
                
                if (chicagoDealers.length > 0) {
                    // If we have dealers, we can still center on them, or keep Chicago as center
                    const avgLat = chicagoDealers.reduce((sum, dealer) => sum + dealer.lat, 0) / chicagoDealers.length;
                    const avgLng = chicagoDealers.reduce((sum, dealer) => sum + dealer.lng, 0) / chicagoDealers.length;

                // Use Chicago as center to provide consistent starting view
                centerLat = 41.8781;
                centerLng = -87.6298;
                }

                // Clear loading messages
                document.querySelectorAll('.loading').forEach(el => el.remove());

                // Map 1 - Standard with teardrop markers
                const map1 = L.map('map1').setView([centerLat, centerLng], 11);
                L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(map1);
                
                chicagoDealers.forEach((dealer, index) => {
                    const tearDropIcon = L.divIcon({
                    className: 'teardrop-marker',
                html: `<div style="position: relative; width: 30px; height: 40px;">
                    <svg width="30" height="40" viewBox="0 0 30 40" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
                        <defs>
                            <linearGradient id="darkGradient${index}" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#2c3e50" />
                                <stop offset="50%" style="stop-color:#4a4a4a" />
                                <stop offset="100%" style="stop-color:#1a1a1a" />
                            </linearGradient>
                        </defs>
                        <path d="M15 40 C15 40, 5 25, 5 15 C5 8.4, 8.4 5, 15 5 C21.6 5, 25 8.4, 25 15 C25 25, 15 40, 15 40 Z"
                            fill="url(#darkGradient${index})"
                            stroke="#333"
                            stroke-width="1" />
                    </svg>
                    <div style="
                                position: absolute;
                                top: 15px;
                                left: 15px;
                                transform: translate(-50%, -50%);
                                color: white;
                                font-family: Arial, sans-serif;
                                font-size: 12px;
                                font-weight: 700;
                                text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
                            ">M</div>
                </div>`,
                iconSize: [30, 40],
                iconAnchor: [15, 40]
                    });
                L.marker([dealer.lat, dealer.lng], {icon: tearDropIcon})
                .addTo(map1)
                .bindPopup(dealer.popup);
                });

                // Map 2 - Clean Light with colorful dots
                const map2 = L.map('map2').setView([centerLat, centerLng], 11);
                L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                    attribution: '© OpenStreetMap contributors © CARTO',
                subdomains: 'abcd'
                }).addTo(map2);

                const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
                chicagoDealers.forEach((dealer, index) => {
                    const coloredIcon = L.divIcon({
                    className: 'custom-div-icon',
                html: `<div style="background-color: ${colors[index % colors.length]}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
                    });
                L.marker([dealer.lat, dealer.lng], {icon: coloredIcon})
                .addTo(map2)
                .bindPopup(dealer.popup);
                });

                // Map 3 - Dark with 3D flag markers
                const map3 = L.map('map3').setView([centerLat, centerLng], 11);
                L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                    attribution: '© OpenStreetMap contributors © CARTO',
                subdomains: 'abcd'
                }).addTo(map3);
                
                chicagoDealers.forEach(dealer => {
                    const flag3D = L.divIcon({
                    className: 'flag-3d-marker',
                html: `<div style="
                            position: relative;
                            width: 20px;
                            height: 24px;
                            transform: perspective(150px) rotateX(10deg) rotateY(-5deg);
                        ">
                    <div style="
                                position: absolute;
                                width: 2px;
                                height: 24px;
                                background-color: #00f5ff;
                                box-shadow: 0 0 8px #00f5ff, 0 0 16px rgba(0, 245, 255, 0.3);
                                top: 0px;
                                left: 2px;
                                border-radius: 1px;
                            "></div>
                    <div style="
                                position: absolute;
                                width: 14px;
                                height: 2px;
                                background-color: #00f5ff;
                                box-shadow: 0 0 8px #00f5ff, 0 0 16px rgba(0, 245, 255, 0.3);
                                top: 0px;
                                left: 4px;
                                border-radius: 1px;
                            "></div>
                </div>`,
                iconSize: [20, 24],
                iconAnchor: [2, 24]
                    });
                L.marker([dealer.lat, dealer.lng], {icon: flag3D})
                .addTo(map3)
                .bindPopup(dealer.popup);
                });

                // Map 4 - Ultra Minimal with Airbnb style markers
                const map4 = L.map('map4').setView([centerLat, centerLng], 11);
                L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
                    attribution: '© OpenStreetMap contributors © CARTO',
                subdomains: 'abcd'
                }).addTo(map4);

                const airbnbColors = ['#FF385C', '#00A699', '#484848', '#767676', '#FF5A5F'];
                chicagoDealers.forEach((dealer, index) => {
                    const airbnbIcon = L.divIcon({
                    className: 'airbnb-marker',
                html: `<div style="
                            background-color: ${airbnbColors[index % airbnbColors.length]};
                            border: 1px solid ${airbnbColors[index % airbnbColors.length]};
                            border-radius: 12px;
                            padding: 6px 10px;
                            font-family: Arial, sans-serif;
                            font-size: 12px;
                            font-weight: 600;
                            color: #222;
                            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                            white-space: nowrap;
                            position: relative;
                        ">
                    ${dealer.name}
                    <div style="
                                position: absolute;
                                bottom: -6px;
                                left: 50%;
                                transform: translateX(-50%);
                                width: 0;
                                height: 0;
                                border-left: 6px solid transparent;
                                border-right: 6px solid transparent;
                                border-top: 6px solid ${airbnbColors[index % airbnbColors.length]};
                            "></div>
                </div>`,
                iconSize: [0, 0],
                iconAnchor: [0, -6]
                    });
                L.marker([dealer.lat, dealer.lng], {icon: airbnbIcon})
                .addTo(map4)
                .bindPopup(dealer.popup);
                });

                // Map 5 - Voyager with animated pulse markers
                const map5 = L.map('map5').setView([centerLat, centerLng], 11);
                L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                    attribution: '© OpenStreetMap contributors © CARTO',
                subdomains: 'abcd'
                }).addTo(map5);

                const voyagerGradients = [
                'linear-gradient(45deg, #FF6B6B, #FF8E53)',
                'linear-gradient(45deg, #4ECDC4, #44A08D)',
                'linear-gradient(45deg, #45B7D1, #96C93D)',
                'linear-gradient(45deg, #96CEB4, #FECA57)',
                'linear-gradient(45deg, #FFEAA7, #DDA0DD)'
                ];
                
                chicagoDealers.forEach((dealer, index) => {
                    const voyagerIcon = L.divIcon({
                    className: 'voyager-marker',
                html: `
                <style>
                    @keyframes voyager-pulse-${index} {
                        0 % { transform: scale(1); box- shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
                    50% {transform: scale(1.1); }
                    100% {transform: scale(1); box-shadow: 0 0 0 20px rgba(255, 255, 255, 0); }
                            }
                </style>
                <div style="
                            width: 24px;
                            height: 24px;
                            background: ${voyagerGradients[index % voyagerGradients.length]};
                            border-radius: 50%;
                            border: 3px solid white;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                            animation: voyager-pulse-${index} 2s infinite;
                            position: relative;
                        ">
                    <div style="
                                position: absolute;
                                top: 50%;
                                left: 50%;
                                transform: translate(-50%, -50%);
                                width: 8px;
                                height: 8px;
                                background: white;
                                border-radius: 50%;
                                opacity: 0.9;
                            "></div>
                </div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
                    });
                L.marker([dealer.lat, dealer.lng], {icon: voyagerIcon})
                .addTo(map5)
                .bindPopup(dealer.popup);
                });

                // Map 6 - Voyager Black with Airbnb-style markers and selection effects
                const map6 = L.map('map6').setView([centerLat, centerLng], 11);
                L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                    attribution: '© OpenStreetMap contributors © CARTO',
                subdomains: 'abcd'
                }).addTo(map6);

                let selectedMarker = null;
                
                chicagoDealers.forEach((dealer, index) => {
                    const markerId = `marker-${index}`;
                const blackAirbnbIcon = L.divIcon({
                    className: 'black-airbnb-marker',
                html: `
                <style>
                    @keyframes intense-pulse {
                        0 % {
                            transform: scale(1.5);
                            box- shadow: 0 0 0 0 rgba(255, 255, 255, 0.9), 0 2px 8px rgba(0, 0, 0, 0.3); 
                                }
                    25% {
                        transform: scale(1.6);
                    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0.6), 0 2px 8px rgba(0, 0, 0, 0.3); 
                                }
                    50% {
                        transform: scale(1.7);
                    box-shadow: 0 0 0 20px rgba(255, 255, 255, 0.3), 0 2px 8px rgba(0, 0, 0, 0.3); 
                                }
                    75% {
                        transform: scale(1.6);
                    box-shadow: 0 0 0 30px rgba(255, 255, 255, 0.1), 0 2px 8px rgba(0, 0, 0, 0.3); 
                                }
                    100% {
                        transform: scale(1.5);
                    box-shadow: 0 0 0 40px rgba(255, 255, 255, 0), 0 2px 8px rgba(0, 0, 0, 0.3); 
                                }
                            }
                    .marker-selected {
                        animation: intense-pulse 1.5s infinite !important;
                            }
                </style>
                <div id="${markerId}" style="
                            background-color: #333;
                            border: 1px solid #333;
                            border-radius: 12px;
                            padding: 16px 12px;
                            font-family: Arial, sans-serif;
                            font-size: 14px;
                            font-weight: 700;
                            color: white;
                            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                            white-space: nowrap;
                            position: relative;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            min-width: 20px;
                            height: 40px;
                            transition: all 0.3s ease;
                            cursor: pointer;
                        ">
                    M
                    <div style="
                                position: absolute;
                                bottom: -6px;
                                left: 50%;
                                transform: translateX(-50%);
                                width: 0;
                                height: 0;
                                border-left: 6px solid transparent;
                                border-right: 6px solid transparent;
                                border-top: 6px solid #333;
                            "></div>
                </div>`,
                iconSize: [0, 0],
                iconAnchor: [0, -6]
                    });

                const marker = L.marker([dealer.lat, dealer.lng], {icon: blackAirbnbIcon})
                .addTo(map6)
                .bindPopup(dealer.popup);

                // Add click event to marker
                marker.on('click', function(e) {
                        // Remove selection from previous marker
                        if (selectedMarker) {
                            const prevElement = document.getElementById(selectedMarker);
                if (prevElement) {
                    prevElement.classList.remove('marker-selected');
                            }
                        }

                // Add selection to current marker
                const currentElement = document.getElementById(markerId);
                if (currentElement) {
                    currentElement.classList.add('marker-selected');
                selectedMarker = markerId;
                        }
                    });
                });

                // Deselect marker when clicking on map
                map6.on('click', function(e) {
                    if (selectedMarker) {
                        const element = document.getElementById(selectedMarker);
                if (element) {
                    element.classList.remove('marker-selected');
                        }
                selectedMarker = null;
                    }
                });

                console.log('Maps initialized successfully');

            } catch (error) {
                    console.error('Error initializing maps:', error);
                document.querySelectorAll('.loading').forEach(el => {
                    el.innerHTML = 'Error loading dealer data';
                el.style.color = '#d32f2f';
                });
            }
        }

                // Start the initialization when page loads
                initializeMaps();
            </script>
