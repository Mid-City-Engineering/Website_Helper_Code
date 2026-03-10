// Global variables for map management
let dealerMap = null;
let allDealersCache = []; // Cache all dealers to avoid repeated API calls
let currentMarkers = [];
let userLocationMarker = null; // Marker for user's searched location
let selectedMarker = null;
let selectedListItem = null;
const GOOGLE_MAPS_SERVER_API_KEY = 'AIzaSyBez7bMMNmEmyK8Om2hIeirvDl0WYcP0Wo';

function showLoading() {
    // Option 1: Use your existing loading div
    const loadingEl = document.querySelector('.loading');
    if (loadingEl) {
        loadingEl.style.display = 'block';
    }
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.remove();
    }

    const loadingEl = document.querySelector('.loading');
    if (loadingEl) {
        loadingEl.remove();
    }
}

// Add user location marker to the map
// Add user location marker to the map
function addUserLocationMarker(lat, lon, address) {
    // Remove existing user location marker if it exists
    if (userLocationMarker) {
        dealerMap.removeLayer(userLocationMarker);
    }

    // Create a distinct icon for user location (same shape as dealer markers)
    const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
            <style>
                @keyframes user-pulse {
                    0% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            </style>
            <div style="
                background-color: #810305;
                border: 1px solid #810305;
                border-radius: 12px;
                padding: 16px 12px;
                font-family: Arial, sans-serif;
                font-size: 14px;
                font-weight: 700;
                color: #D4AF85;
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
                    border-top: 6px solid #810305;
                "></div>
                <div style="
                    position: absolute;
                    transform: translateX(-25%);
                    width: 60px;
                    height: 60px;
                    background-color: rgba(212, 175, 133, 0.4);
                    border-radius: 50%;
                    animation: user-pulse 2s infinite;
                    pointer-events: none;
                "></div>
            </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, -6]
    });

    // Create the marker
    userLocationMarker = L.marker([lat, lon], { icon: userIcon })
        .addTo(dealerMap)
        .bindPopup(`<strong>Your Location</strong><br>${address || 'Selected location'}`);

    console.log(`Added user location marker at ${lat}, ${lon}`);
}

// Test search function that logs to console and updates the map
async function filterAndShowDealers() {
    const addressInput = document.getElementById('address-input');
    const radiusSelect = document.getElementById('radius-select');

    const address = addressInput ? addressInput.value.trim() : '';
    const radius = radiusSelect ? radiusSelect.value : 'all';

    console.log(`Search triggered - Address: "${address}", Radius: ${radius}`);

    try {
        let userLat = null;
        let userLon = null;
        let geocodedAddress = null;

        // Skip geocoding if address is empty
        if (address === '') {
            console.log('Address is empty - skipping geocoding');
            // Remove user location marker if address is cleared
            if (userLocationMarker) {
                dealerMap.removeLayer(userLocationMarker);
                userLocationMarker = null;
            }
        } else {
            // Geocode the address
            console.log(`Geocoding address: ${address}`);
            const geocoded = await geocodeAddress(address);
            console.log(`Geocoded result: ${geocoded.display_name} (${geocoded.lat}, ${geocoded.lon})`);
            userLat = geocoded.lat;
            userLon = geocoded.lon;
            geocodedAddress = geocoded.display_name;
        }

        // Get filtered dealers using the new getTargetDealers function
        console.log('Filtering dealers...');
        const targetDealers = getTargetDealers(allDealersCache, userLat, userLon, radius);

        // Add user location marker if we have coordinates
        if (userLat && userLon) {
            addUserLocationMarker(userLat, userLon, geocodedAddress);
            dealerMap.setView([userLat, userLon], 10);
        }

        // Update the map with filtered results
        await updateDealerMarkers(targetDealers);

    } catch (error) {
        console.log(`Error in filterAndShowDealers: ${error.message}`);
        // On error, still show all dealers as fallback
        const fallbackDealers = getTargetDealers(allDealersCache);
        await updateDealerMarkers(fallbackDealers);
    }
}
// Setup event listeners
function setupEventListeners() {
    const addressInput = document.getElementById('address-input');
    const radiusSelect = document.getElementById('radius-select');

    // Debounce timer for address input
    let debounceTimer = null;

    // Handle Enter key in address field
    if (addressInput) {
        addressInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                // Clear any pending debounced search
                clearTimeout(debounceTimer);
                filterAndShowDealers();
            }
        });

        // Handle typing in address field with debouncing
        addressInput.addEventListener('input', function () {
            // Clear the previous timer
            clearTimeout(debounceTimer);

            // Set a new timer to trigger search after 1.5 seconds of no typing
            debounceTimer = setTimeout(() => {
                filterAndShowDealers();
            }, 1500); // 1.5 second delay
        });
    }

    // Handle radius dropdown changes
    if (radiusSelect) {
        radiusSelect.addEventListener('change', function () {
            // Clear any pending debounced search since user explicitly changed radius
            clearTimeout(debounceTimer);
            filterAndShowDealers();
        });
    }
}

// Get all dealer contacts from GitHub CSV with field mapping
async function getDealerContacts() {
    try {
        const response = await fetch('https://vercel-secrets-demo.vercel.app/api/get-dealers');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        return data.dealers; // Returns array of dealer objects
    } catch (error) {
        console.error('Error fetching dealers:', error);
        throw error;
    }
}

// Filter and format dealers based on user location and radius
function getTargetDealers(dealers, userLat = null, userLon = null, radius = 'all') {
    // First, process all dealers to standardize format
    console.log(`Entered getTargetDealers with userLat=${userLat}, userLon=${userLon}, and radius=${radius}`)
    const processedDealers = dealers.map(dealer => {
        const address = [dealer.street, `${dealer.city || ''}, ${dealer.state_id ? dealer.state_id[1] : ''} ${dealer.zip || ''}`].filter(Boolean).join('<br>');
        const contact = [];
        if (dealer.phone) contact.push(`📞 ${dealer.phone}`);
        // if (dealer.email) contact.push(`✉️ ${dealer.email}`);

        return {
            lat: dealer.partner_latitude || dealer.x_latitude,
            lng: dealer.partner_longitude || dealer.x_longitude,
            name: dealer.name,
            phone: dealer.phone,
            // email: dealer.email,
            address: dealer.street,
            city: dealer.city,
            state: dealer.state_id ? dealer.state_id[1] : '',
            zip: dealer.zip,
            popup: `<strong>${dealer.name}</strong><br>${address}${contact.length ? '<br>' + contact.join('<br>') : ''}`,
            // Keep original dealer data for distance calculations
            partner_latitude: dealer.partner_latitude,
            partner_longitude: dealer.partner_longitude
        };
    }).filter(dealer => dealer.lat && dealer.lng && !(dealer.lat == 0 && dealer.lng == 0)); // Only keep dealers with valid coordinates

    console.log(`Found ${processedDealers.length} dealers with valid coordinates`);

    // If radius is "all" or no user coordinates, return all processed dealers
    if (radius === 'all' || !userLat || !userLon) {
        return processedDealers;
    }

    // Filter by distance
    const dealersWithDistance = [];

    processedDealers.forEach(dealer => {
        // Use the coordinates we validated above
        const lat = dealer.lat;
        const lon = dealer.lng;

        const distance = calculateDistance(userLat, userLon, lat, lon);

        if (distance <= Number(radius)) {
            dealersWithDistance.push({
                ...dealer,
                distance: distance
            });
        }
    });

    // Sort by distance
    return dealersWithDistance.sort((a, b) => a.distance - b.distance);
}

// geocodeAddress function
async function geocodeAddress(address) {
    const geocoder = new google.maps.Geocoder();

    return new Promise((resolve, reject) => {
        geocoder.geocode({ address: address }, (results, status) => {
            if (status === 'OK' && results.length > 0) {
                const location = results[0].geometry.location;
                resolve({
                    lat: location.lat(),
                    lon: location.lng(),
                    display_name: results[0].formatted_address
                });
            } else {
                reject(new Error('Address not found'));
            }
        });
    });
}

// Reverse geocode coordinates to get address using Google Maps
async function reverseGeocode(lat, lon) {
    try {
        const geocoder = new google.maps.Geocoder();
        const latlng = { lat: lat, lng: lon };

        return new Promise((resolve, reject) => {
            geocoder.geocode({ location: latlng }, (results, status) => {
                if (status === 'OK' && results.length > 0) {
                    resolve(results[0].formatted_address);
                } else {
                    reject(new Error('Location not found'));
                }
            });
        });
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        throw new Error('Unable to determine address from location');
    }
}

function setRadiusToAll() {
    const radiusSelect = document.getElementById('radius-select');
    if (radiusSelect) {
        radiusSelect.value = 'all';
        // Trigger the search with the new radius
        filterAndShowDealers();
    }
}

async function getCurrentLocation() {
    try {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            console.error('Geolocation is not supported by this browser');
            alert('Geolocation is not supported by your browser');
            return;
        }

        console.log('Requesting current location...');

        // Get current position
        navigator.geolocation.getCurrentPosition(
            async function (position) {
                try {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;

                    console.log(`Current location: ${lat}, ${lon}`);

                    // Reverse geocode to get address
                    const address = await reverseGeocode(lat, lon);
                    console.log(`Reverse geocoded address: ${address}`);

                    // Update the address input field
                    const addressInput = document.getElementById('address-input');
                    if (addressInput) {
                        addressInput.value = address;
                        // Trigger search with the new address
                        filterAndShowDealers();
                    }

                } catch (error) {
                    console.error('Error processing location:', error);
                    alert('Unable to determine your address from your location');
                }
            },
            function (error) {
                console.error('Geolocation error:', error);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        alert('Location access denied. Please enable location permissions and try again.');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        alert('Location information is unavailable.');
                        break;
                    case error.TIMEOUT:
                        alert('Location request timed out.');
                        break;
                    default:
                        alert('An unknown error occurred while retrieving your location.');
                        break;
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );

    } catch (error) {
        console.error('Error in getCurrentLocation:', error);
        alert('Unable to get your current location');
    }
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in miles
}

// Initialize the dealer map once (called on page load)
async function initializeDealerMap() {
    try {
        console.log('Initializing dealer map...');

        // Clear loading message
        // const loadingEl = document.querySelector('.loading');
        // if (loadingEl) loadingEl.remove();

        // Initialize Voyager map centered on Chicago
        chicagoLat = 41.8781;
        chicagoLon = -87.6298;
        dealerMap = L.map('dealer-map').setView([chicagoLat, chicagoLon], 6);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors © CARTO',
            subdomains: 'abcd'
        }).addTo(dealerMap);

        // Setup global map event listeners
        dealerMap.on('click', function (e) {
            // Deselect any selected markers when clicking on empty map
            if (selectedMarker) {
                const element = document.getElementById(selectedMarker);
                if (element) {
                    element.classList.remove('dealer-selected');
                }
                selectedMarker = null;
            }
            if (selectedListItem) {
                const element = document.getElementById(selectedListItem);
                if (element) {
                    element.classList.remove('selected');
                }
                selectedListItem = null;
            }
        });

        console.log('Base map initialized successfully');

    } catch (error) {
        console.error('Erorr in initializeDealerMap -> Error initializing dealer map:', error);
    }
}

// Update map markers and sidebar list (called when dealer set changes)
async function updateDealerMarkers(locations = []) {
    try {
        console.log(`Updating map with ${locations.length} locations`);

        // Check if map is initialized
        if (!dealerMap) {
            console.error('Map not initialized - cannot update markers');
            return;
        }

        // Clear existing markers from map
        currentMarkers.forEach(markerData => {
            if (markerData.marker) {
                dealerMap.removeLayer(markerData.marker);
            }
        });
        currentMarkers = [];
        selectedMarker = null;
        selectedListItem = null;

        // Clear existing locations list
        const locationsList = document.getElementById('locations-list');
        if (!locationsList) {
            console.error('Locations list element not found');
            return;
        }
        locationsList.innerHTML = '';

        // Handle empty locations
        if (locations.length === 0) {
            console.log('No locations provided, showing empty state');
            locationsList.innerHTML = '<div class="location-item" style="text-align: center; color: #999; font-style: italic;">No locations to display</div>';
            return;
        }

        console.log(`Adding markers for ${locations.length} locations`);

        // Add new markers and list items
        locations.forEach((dealer, index) => {
            const markerId = `dealer-marker-${index}`;
            const listItemId = `list-item-${index}`;

            // console.log(`Processing dealer ${index}:`, dealer);

            // Validate dealer coordinates
            if (!dealer.lat || !dealer.lng) {
                console.warn(`Dealer ${dealer.name} has invalid coordinates:`, dealer.lat, dealer.lng);
                return;
            }

            // Create map marker
            const blackAirbnbIcon = L.divIcon({
                className: 'interactive-dealer-marker',
                html: `
                        <style>
                            @keyframes dealer-pulse {
                                0% { 
                                    transform: scale(1.5); 
                                    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.9), 0 2px 8px rgba(0, 0, 0, 0.3); 
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
                            .dealer-selected {
                                animation: dealer-pulse 1.5s infinite !important;
                            }
                            .dealer-marker-hover:hover {
                                transform: scale(1.1);
                            }
                        </style>
                        <div id="${markerId}" class="dealer-marker-hover" style="
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

            const marker = L.marker([dealer.lat, dealer.lng], { icon: blackAirbnbIcon })
                .addTo(dealerMap)
                .bindPopup(dealer.popup || `<strong>${dealer.name}</strong>`);

            // Store marker data
            currentMarkers.push({ marker, markerId, listItemId });

            // Create list item
            const listItem = document.createElement('div');
            listItem.className = 'location-item';
            listItem.id = listItemId;

            const addressParts = [];
            if (dealer.address) addressParts.push(dealer.address);
            if (dealer.city || dealer.state || dealer.zip) {
                addressParts.push(`${dealer.city || ''}, ${dealer.state || ''} ${dealer.zip || ''}`.trim());
            }

            const contactParts = [];
            if (dealer.phone) contactParts.push(`📞 ${dealer.phone}`);
            // if (dealer.email) contactParts.push(`✉️ ${dealer.email}`);

            // Show distance if available
            let distanceText = '';
            if (dealer.distance !== undefined) {
                distanceText = `<div style="color: #888; font-size: 12px; margin-top: 4px;">${dealer.distance.toFixed(1)} miles away</div>`;
            }

            listItem.innerHTML = `
                        <div class="location-name">${dealer.name}</div>
                        <div class="location-address">${addressParts.join('<br>')}</div>
                        ${contactParts.length ? `<div class="location-contact">${contactParts.join(' • ')}</div>` : ''}
                        ${distanceText}
                    `;

            // Add click event to list item
            listItem.addEventListener('click', function () {
                selectLocation(index);
                // Center map on selected dealer with minimal zoom change
                dealerMap.setView([dealer.lat, dealer.lng], Math.max(dealerMap.getZoom(), 12));
                marker.openPopup();
            });

            locationsList.appendChild(listItem);

            // Add click event to marker
            marker.on('click', function (e) {
                selectLocation(index);
            });
        });

        // Adjust map view to show all markers if there are any
        if (currentMarkers.length > 0) {
            try {
                // Create array of valid coordinates
                const validMarkers = currentMarkers.filter(m => m.marker && m.marker.getLatLng);

                if (validMarkers.length === 0) {
                    console.warn('No valid markers found for bounds calculation');
                    return; // Just stay at current view (user location or previous view)
                }

                if (validMarkers.length === 1) {
                    // If only one marker, center on it
                    dealerMap.setView(validMarkers[0].marker.getLatLng(), 10);
                } else {
                    // For multiple markers, try to fit bounds
                    const group = new L.featureGroup(validMarkers.map(m => m.marker));
                    const bounds = group.getBounds();

                    // Additional validation - check if bounds have valid coordinates
                    const sw = bounds.getSouthWest();
                    const ne = bounds.getNorthEast();

                    if (isFinite(sw.lat) && isFinite(sw.lng) && isFinite(ne.lat) && isFinite(ne.lng) &&
                        sw.lat !== ne.lat && sw.lng !== ne.lng) {
                        dealerMap.fitBounds(bounds.pad(0.1));
                    } else {
                        console.warn('Bounds coordinates are invalid, centering on first marker');
                        dealerMap.setView(validMarkers[0].marker.getLatLng(), 8);
                    }
                }
            } catch (boundsError) {
                console.warn('Error calculating bounds, using default view:', boundsError.message);
                // Just stay at current view (user location or previous view)
            }
        }

        console.log(`Map markers updated successfully - ${currentMarkers.length} markers added`);

    } catch (error) {
        console.error('Error updating map markers:', error);
        console.error('Error stack:', error.stack);
        const locationsList = document.getElementById('locations-list');
        if (locationsList) {
            locationsList.innerHTML = '<div class="location-item" style="text-align: center; color: #d32f2f;">Error updating locations</div>';
        }
    }
}

// Function to select a location (from either map or list)
function selectLocation(index) {
    if (index >= currentMarkers.length) return;

    const { markerId, listItemId } = currentMarkers[index];

    // Remove previous selection
    if (selectedMarker) {
        const prevMarkerElement = document.getElementById(selectedMarker);
        if (prevMarkerElement) {
            prevMarkerElement.classList.remove('dealer-selected');
        }
    }
    if (selectedListItem) {
        const prevListElement = document.getElementById(selectedListItem);
        if (prevListElement) {
            prevListElement.classList.remove('selected');
        }
    }

    // Add new selection
    const markerElement = document.getElementById(markerId);
    const listElement = document.getElementById(listItemId);

    if (markerElement) {
        markerElement.classList.add('dealer-selected');
        selectedMarker = markerId;
    }

    if (listElement) {
        listElement.classList.add('selected');
        selectedListItem = listItemId;
        // Scroll list item into view
        listElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function loadGooglePlacesAPIForGeocoding() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_SERVER_API_KEY}&loading=async&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Main initializingfunction, previously the callback when Google Maps JS got loaded
async function initMap() {
    console.log('DOM fully loaded and parsed');
    try {
        // 1. Show a loading overlay
        showLoading();
        console.log('\nReturned from showLoading | Loading Google Maps API...');

        // 2. Load Google Maps API for geocoding
        const googleMapsPlacesPromise = loadGooglePlacesAPIForGeocoding();

        // 3. Start fetching dealers BEFORE geocoding (parallel!)
        const dealersPromise = getDealerContacts();

        // 4. Initialize the base map (fast, doesn't need dealers yet)
        await initializeDealerMap();
        console.log(`<---- Returning from initializeDealerMap`);

        // 5. Wait for dealers to finish fetching
        allDealersCache = await dealersPromise;
        console.log(`<-*-*- Returning from getDealerContacts`);
        console.log(`Fetched ${allDealersCache.length} dealers from Odoo`);

        // 6. Setup event listeners
        setupEventListeners();

        // Wait for Google Maps Places API to load
        await googleMapsPlacesPromise;
        console.log(`<-*-*- Returning from loadGooglePlacesAPIForGeocoding`);

        // 7. Do the initial search (geocode + filter + display)
        await filterAndShowDealers();

        // 8. Hide loading AFTER markers are displayed
        hideLoading();

    } catch (error) {
        console.error('Error during initialization:', error);
        hideLoading();
    }
}

// Self-executing code, kinda the main() of this file
if (document.readyState === 'loading') {
    // Document still loading, wait for DOMContentLoaded then call initMap
    document.addEventListener('DOMContentLoaded', initMap);
} else {
    // Document already loaded, call initMap directly
    initMap();
}
