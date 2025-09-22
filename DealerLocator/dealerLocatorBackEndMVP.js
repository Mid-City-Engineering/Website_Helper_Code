<meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dealer Locator</title>
    <style>
        .dealer-locator {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            font-family: Arial, sans-serif;
            border: 1px solid #ddd;
            border-radius: 8px;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        
        input[type="text"], select {
            width: 100%;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box;
        }
        
        .search-btn {
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        
        .search-btn:hover {
            background-color: #0056b3;
        }
        
        .search-btn:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
        
        .location-btn {
            background-color: #28a745;
            color: white;
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin-left: 10px;
        }
        
        .location-btn:hover {
            background-color: #218838;
        }
        
        .location-btn:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
        
        .show-all-btn {
            background-color: #6c757d;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            margin-left: 10px;
        }
        
        .show-all-btn:hover {
            background-color: #5a6268;
        }
        
        .show-all-btn:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
        
        .button-row {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .address-row {
            display: flex;
            align-items: flex-end;
            gap: 10px;
        }
        
        .address-input-group {
            flex: 1;
        }
        
        .results {
            margin-top: 20px;
            padding: 15px;
            border-radius: 4px;
        }
        
        .results.success {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }
        
        .results.error {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }
        
        .results.loading {
            background-color: #d1ecf1;
            border: 1px solid #bee5eb;
            color: #0c5460;
        }
        
        .dealer-list {
            margin-top: 15px;
            max-height: 300px;
            overflow-y: auto;
        }
        
        .dealer-item {
            padding: 8px;
            margin: 5px 0;
            background-color: #f8f9fa;
            border-left: 3px solid #007bff;
            border-radius: 3px;
        }
        
        .dealer-name {
            font-weight: bold;
        }
        
        .dealer-distance {
            color: #666;
            font-size: 0.9em;
        }
    </style>


    <div class="dealer-locator">
        <h3>Find Nearby Dealers</h3>
        
        <div class="form-group">
            <label for="address">Address or ZIP Code:</label>
            <div class="address-row">
                <div class="address-input-group">
                    <input type="text" id="address" placeholder="Enter your address or leave empty to show all dealers">
                </div>
                <button type="button" class="location-btn" onclick="useCurrentLocation()" id="locationBtn">
                    📍 Use Current Location
                </button>
            </div>
        </div>
        
        <div class="form-group">
            <label for="radius">Search Radius:</label>
            <select id="radius">
                <option value="all" selected="">Show All</option>
                <option value="1">1 mile</option>
                <option value="5">5 miles</option>
                <option value="10">10 miles</option>
                <option value="25">25 miles</option>
                <option value="50">50 miles</option>
                <option value="100">100 miles</option>
                <option value="250">250 miles</option>
            </select>
        </div>
        
        <div class="button-row">
            <button class="search-btn" onclick="findDealers()">Find Dealers</button>
            <button class="show-all-btn" onclick="showAllDealers()">Show All Dealers</button>
        </div>
        
        <div id="results"></div>
    </div>

    <script>
        // Haversine formula to calculate distance between two coordinates
        function calculateDistance(lat1, lon1, lat2, lon2) {
            const R = 3959; // Earth's radius in miles
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = 
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c; // Distance in miles
        }

        // Reverse geocode coordinates to get address
        async function reverseGeocode(lat, lon) {
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
                );
                const data = await response.json();
                
                if (data && data.display_name) {
                    // Try to create a clean address from components
                    const addr = data.address;
                    if (addr) {
                        const parts = [];
                        if (addr.house_number) parts.push(addr.house_number);
                        if (addr.road) parts.push(addr.road);
                        if (addr.city || addr.town || addr.village) {
                            parts.push(addr.city || addr.town || addr.village);
                        }
                        if (addr.state) parts.push(addr.state);
                        if (addr.postcode) parts.push(addr.postcode);
                        
                        return parts.length > 0 ? parts.join(', ') : data.display_name;
                    }
                    return data.display_name;
                } else {
                    throw new Error('Location not found');
                }
            } catch (error) {
                console.error('Reverse geocoding error:', error);
                throw new Error('Unable to determine address from location');
            }
        }

        // Show all dealers (sets radius to "all" and searches)
        function showAllDealers() {
            const radiusSelect = document.getElementById('radius');
            
            // Set radius to "Show All"
            radiusSelect.value = 'all';
            
            // Trigger the search (address field is preserved)
            findDealers();
        }
        async function useCurrentLocation() {
            const locationBtn = document.getElementById('locationBtn');
            const addressInput = document.getElementById('address');
            
            // Check if geolocation is supported
            if (!navigator.geolocation) {
                alert('Geolocation is not supported by this browser.');
                return;
            }
            
            try {
                locationBtn.disabled = true;
                locationBtn.textContent = '📍 Getting location...';
                
                // Get current position
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(
                        resolve,
                        reject,
                        {
                            enableHighAccuracy: true,
                            timeout: 10000,
                            maximumAge: 300000 // 5 minutes
                        }
                    );
                });
                
                const { latitude, longitude } = position.coords;
                console.log('Current location:', latitude, longitude);
                
                locationBtn.textContent = '📍 Finding address...';
                
                // Reverse geocode to get address
                const address = await reverseGeocode(latitude, longitude);
                
                // Populate the address field
                addressInput.value = address;
                
                locationBtn.textContent = '✅ Location found!';
                
                // Reset button text after a delay
                setTimeout(() => {
                    locationBtn.textContent = '📍 Use Current Location';
                }, 2000);
                
                console.log('Address populated:', address);
                
            } catch (error) {
                console.error('Location error:', error);
                
                let errorMessage = 'Unable to get your location. ';
                
                if (error.code === 1) {
                    errorMessage += 'Location access denied.';
                } else if (error.code === 2) {
                    errorMessage += 'Location unavailable.';
                } else if (error.code === 3) {
                    errorMessage += 'Location request timed out.';
                } else {
                    errorMessage += error.message || 'Please try again.';
                }
                
                alert(errorMessage);
                locationBtn.textContent = '📍 Use Current Location';
                
            } finally {
                locationBtn.disabled = false;
            }
        }
        async function geocodeAddress(address) {
            try {
                // Using OpenStreetMap's Nominatim service (free, no API key required)
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=us`
                );
                const data = await response.json();
                
                if (data && data.length > 0) {
                    return {
                        lat: parseFloat(data[0].lat),
                        lon: parseFloat(data[0].lon),
                        display_name: data[0].display_name
                    };
                } else {
                    throw new Error('Address not found');
                }
            } catch (error) {
                console.error('Geocoding error:', error);
                throw new Error('Unable to geocode address');
            }
        }

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

        // Filter dealers by distance
        function filterDealersByDistance(dealers, userLat, userLon, maxRadius) {
            const dealersWithDistance = [];
            
            dealers.forEach(dealer => {
                // Try different coordinate fields
                let lat = dealer.partner_latitude || dealer.x_latitude;
                let lon = dealer.partner_longitude || dealer.x_longitude;
                
                // Skip dealers without valid coordinates
                if (!lat || !lon || lat === 0 || lon === 0) {
                    return;
                }
                
                const distance = calculateDistance(userLat, userLon, lat, lon);
                
                if (distance <= maxRadius) {
                    dealersWithDistance.push({
                        ...dealer,
                        distance: distance
                    });
                }
            });
            
            // Sort by distance
            return dealersWithDistance.sort((a, b) => a.distance - b.distance);
        }

        // Display results
        function displayResults(dealers, searchAddress = null, radius = null) {
            const resultsDiv = document.getElementById('results');
            
            let html = `<div class="results success">`;
            
            if (searchAddress && radius !== 'all') {
                html += `<strong>Found ${dealers.length} dealer(s) within ${radius} miles of "${searchAddress}"</strong><br><br>`;
            } else if (searchAddress && radius === 'all') {
                html += `<strong>Showing all ${dealers.length} dealer(s) with valid coordinates</strong><br>`;
                html += `<em>Search location: ${searchAddress}</em><br><br>`;
            } else {
                html += `<strong>Showing all ${dealers.length} dealer(s) with valid coordinates</strong><br><br>`;
            }
            
            if (dealers.length > 0) {
                html += `<div class="dealer-list">`;
                dealers.forEach(dealer => {
                    const address = [dealer.street, dealer.city, dealer.state_id?.[1], dealer.zip]
                        .filter(part => part)
                        .join(', ');
                    
                    html += `
                        <div class="dealer-item">
                            <div class="dealer-name">${dealer.name}</div>
                            ${address ? `<div style="color: #666; font-size: 0.9em;">${address}</div>` : ''}
                            ${dealer.distance !== undefined ? 
                                `<div class="dealer-distance">${dealer.distance.toFixed(1)} miles away</div>` : 
                                ''
                            }
                        </div>
                    `;
                });
                html += `</div>`;
            } else if (searchAddress && radius !== 'all') {
                html += `<em>No dealers found within ${radius} miles of the specified location.</em>`;
            }
            
            html += `</div>`;
            resultsDiv.innerHTML = html;
        }

        // Show loading state
        function showLoading() {
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = '<div class="results loading">Searching for dealers...</div>';
        }

        // Show error
        function showError(message) {
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = `<div class="results error"><strong>Error:</strong> ${message}</div>`;
        }

        // Main function to find dealers
        async function findDealers() {
            const address = document.getElementById('address').value.trim();
            const radius = document.getElementById('radius').value;
            const searchBtn = document.querySelector('.search-btn');
            
            try {
                searchBtn.disabled = true;
                showLoading();
                
                // Get all dealers
                const dealers = await getDealerContacts();
                console.log(`Fetched ${dealers.length} dealers from Odoo`);
                
                // Filter dealers with valid coordinates
                const dealersWithCoords = dealers.filter(dealer => {
                    const lat = dealer.partner_latitude || dealer.x_latitude;
                    const lon = dealer.partner_longitude || dealer.x_longitude;
                    return lat && lon && lat !== 0 && lon !== 0;
                });
                
                console.log(`${dealersWithCoords.length} dealers have valid coordinates`);
                
                if (dealersWithCoords.length === 0) {
                    showError('No dealers found with valid coordinates in the database.');
                    return;
                }
                
                // If "Show All" is selected, display all dealers regardless of address
                if (radius === 'all') {
                    // If address is provided, still geocode for display purposes but don't filter
                    let searchLocation = null;
                    if (address) {
                        try {
                            const userLocation = await geocodeAddress(address);
                            searchLocation = userLocation.display_name;
                            console.log('User location (for display):', userLocation);
                        } catch (error) {
                            console.log('Address geocoding failed, but showing all dealers anyway');
                            searchLocation = address;
                        }
                    }
                    displayResults(dealersWithCoords, searchLocation, 'all');
                    return;
                }
                
                // For specific radius searches, address is required
                if (!address) {
                    showError('Please enter an address to search within a specific radius, or select "Show All" to see all dealers.');
                    return;
                }
                
                // Geocode the user's address
                const userLocation = await geocodeAddress(address);
                console.log('User location:', userLocation);
                
                // Filter dealers by distance
                const nearbyDealers = filterDealersByDistance(
                    dealersWithCoords, 
                    userLocation.lat, 
                    userLocation.lon, 
                    parseInt(radius)
                );
                
                displayResults(nearbyDealers, userLocation.display_name, radius);
                
            } catch (error) {
                console.error('Error finding dealers:', error);
                showError(error.message || 'An unexpected error occurred.');
            } finally {
                searchBtn.disabled = false;
            }
        }

        // Load all dealers on page load
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(findDealers, 1000);
        });

        // Also handle Enter key in address field
        document.getElementById('address').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                findDealers();
            }
        });
    </script>
