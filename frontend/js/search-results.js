// frontend/js/search-results.js
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const searchParamsContainer = document.getElementById('search-params');
    const modifySearchButton = document.getElementById('modify-search-button');
    const loadingContainer = document.getElementById('loading-container');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    const retryButton = document.getElementById('retry-button');
    const resultsSection = document.getElementById('results-section');
    const resultsCount = document.getElementById('results-count');
    const comparisonActions = document.getElementById('comparison-actions');
    const compareButton = document.getElementById('compare-button');
    const clearSelectionButton = document.getElementById('clear-selection-button');
    const selectedCount = document.getElementById('selected-count');
    const carList = document.getElementById('car-list');
    const carCardTemplate = document.getElementById('car-card-template');

    // API endpoint base URL
    const API_BASE_URL = 'http://localhost:3000/api/search';


    // Get search parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchParams = {};

    // Extract and format the search parameters
    for (const [key, value] of urlParams.entries()) {
        if (value) {
            searchParams[key] = value;
        }
    }

    console.log('Search parameters from URL:', searchParams);

    // Display search parameters
    function displaySearchParams() {
        // Clear existing parameters
        searchParamsContainer.innerHTML = '';

        // Create formatted parameter labels
        const paramLabels = {
            brand: 'Brand',
            model: 'Model',
            year: 'Year',
            horsepower: 'Min HP',
            minPrice: 'Min Price',
            maxPrice: 'Max Price',
            seats: 'Min Seats',
            fuelType: 'Fuel Type',
            engineType: 'Engine Type'
        };

        // Format price values
        const formatPrice = (price) => {
            return `$${parseInt(price).toLocaleString()}`;
        };

        // Add each parameter as a tag
        Object.keys(searchParams).forEach(key => {
            let displayValue = searchParams[key];

            if (key === 'minPrice' || key === 'maxPrice') {
                displayValue = formatPrice(displayValue);
            }

            const paramSpan = document.createElement('span');
            paramSpan.className = 'search-param';
            paramSpan.textContent = `${paramLabels[key] || key}: ${displayValue}`;
            searchParamsContainer.appendChild(paramSpan);
        });
    }

    // Format car price
    function formatPrice(price) {
        return `$${parseFloat(price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }

    // Create a car card from template
    function createCarCard(car) {
        console.log('Creating card for car:', car);

        try {
            // Clone the template
            const cardNode = document.importNode(carCardTemplate.content, true);

            // Set match percentage and color
            const matchBadge = cardNode.querySelector('.match-badge');
            const matchValue = car.matchpercentage || car.matchPercentage || 100;
            matchBadge.textContent = `${matchValue}% Match`;

            // Set badge color based on match percentage
            if (matchValue > 80) {
                matchBadge.style.backgroundColor = '#4CAF50'; // Green
            } else if (matchValue > 60) {
                matchBadge.style.backgroundColor = '#FFC107'; // Yellow
            } else {
                matchBadge.style.backgroundColor = '#FF5722'; // Orange
            }

            // Set comparison checkbox
            const checkbox = cardNode.querySelector('.compare-checkbox');
            checkbox.id = `compare-${car.id}`;
            checkbox.dataset.carId = car.id;
            checkbox.addEventListener('change', handleCompareCheckbox);

            // Set image
            const img = cardNode.querySelector('.car-card-image img');
            img.src = car.image_url || 'images/car-placeholder.jpg';
            img.alt = `${car.brand} ${car.model}`;

            // Set basic info
            cardNode.querySelector('.car-card-title').textContent = `${car.brand} ${car.model}`;
            cardNode.querySelector('.car-card-year').textContent = car.year;

            // Set details
            cardNode.querySelector('.horsepower').textContent = car.horsepower;
            cardNode.querySelector('.seats').textContent = car.seats || 'N/A';
            cardNode.querySelector('.fuel-type').textContent = car.fuel_type || 'N/A';
            cardNode.querySelector('.engine-type').textContent = car.engine_type || 'N/A';

            // Set price
            cardNode.querySelector('.car-card-price').textContent = formatPrice(car.price);

            // Set details link
            const detailsLink = cardNode.querySelector('.details-button');
            detailsLink.href = `car-details.html?id=${car.id}`;

            // Set favorite button
            const favoriteButton = cardNode.querySelector('.favorite-button');
            favoriteButton.addEventListener('click', function(e) {
                e.preventDefault();
                // This would normally check if user is logged in and toggle favorite status
                alert('Please log in to save favorites');
            });

            return cardNode;
        } catch (error) {
            console.error('Error creating car card:', error);
            return document.createElement('div'); // Return empty div to avoid breaking the page
        }
    }

    // Handle compare checkbox changes
    function handleCompareCheckbox(e) {
        const selectedCheckboxes = document.querySelectorAll('.compare-checkbox:checked');
        const count = selectedCheckboxes.length;

        // Update the count display
        selectedCount.textContent = count;

        // Show/hide comparison actions
        if (count > 0) {
            comparisonActions.style.display = 'flex';

            // Disable unselected checkboxes if max is reached
            if (count >= 3) {
                document.querySelectorAll('.compare-checkbox:not(:checked)').forEach(cb => {
                    cb.disabled = true;
                });
            } else {
                document.querySelectorAll('.compare-checkbox').forEach(cb => {
                    cb.disabled = false;
                });
            }
        } else {
            comparisonActions.style.display = 'none';
        }
    }

    // Handle compare button click
    function handleCompareClick() {
        const selectedCheckboxes = document.querySelectorAll('.compare-checkbox:checked');

        if (selectedCheckboxes.length < 2) {
            alert('Please select at least 2 cars to compare');
            return;
        }

        const carIds = Array.from(selectedCheckboxes).map(cb => cb.dataset.carId);

        // Redirect to comparison page
        window.location.href = `car-comparison.html?cars=${carIds.join(',')}`;
    }

    // Handle clear selection
    function clearSelection() {
        document.querySelectorAll('.compare-checkbox:checked').forEach(cb => {
            cb.checked = false;
        });

        document.querySelectorAll('.compare-checkbox').forEach(cb => {
            cb.disabled = false;
        });

        comparisonActions.style.display = 'none';
        selectedCount.textContent = '0';
    }

    // Process and display car results
    function displayCarResults(cars) {
        // Hide loading state
        loadingContainer.style.display = 'none';

        // Display results
        resultsCount.textContent = `Found ${cars.length} cars matching your criteria`;

        // Clear existing results
        carList.innerHTML = '';

        if (cars.length === 0) {
            // Show a message when no results are found
            carList.innerHTML = `
                <div class="no-results">
                    <h3>No cars found matching your criteria</h3>
                    <p>Try adjusting your search parameters for better results.</p>
                </div>
            `;
        } else {
            // Add each car card
            cars.forEach(car => {
                const cardElement = createCarCard(car);
                carList.appendChild(cardElement);
            });
        }

        // Show results section
        resultsSection.style.display = 'block';
    }

    // Fetch car results from API
    async function fetchResults() {
        console.log('Starting fetchResults function');

        // Show loading state
        loadingContainer.style.display = 'flex';
        errorContainer.style.display = 'none';
        resultsSection.style.display = 'none';

        try {
            // Simple API URL construction
            let searchUrl = API_BASE_URL;
            if (Object.keys(searchParams).length > 0) {
                searchUrl += '?' + new URLSearchParams(searchParams).toString();
            }

            console.log('Fetching from API URL:', searchUrl);

            // Simplified fetch request
            const response = await fetch(searchUrl);

            if (!response.ok) {
                throw new Error(`API responded with status ${response.status}`);
            }

            const cars = await response.json();
            console.log(`Received ${cars.length} cars from API`);
            displayCarResults(cars);

        } catch (error) {
            console.error('Error fetching results:', error);

            // Fall back to mock data if API is unreachable
            console.log('Using mock data instead due to API error');
            displayCarResults(MOCK_DATA);

            // Show a warning to the user
            errorMessage.textContent = 'Using sample data - could not connect to server.';
            errorContainer.style.display = 'flex';
        }
    }

    // Initialize
    function init() {
        console.log('Initializing search results page');

        // Display search parameters
        displaySearchParams();

        // Set up event listeners
        modifySearchButton.addEventListener('click', () => {
            window.location.href = `index.html?${urlParams.toString()}`;
        });

        retryButton.addEventListener('click', fetchResults);
        compareButton.addEventListener('click', handleCompareClick);
        clearSelectionButton.addEventListener('click', clearSelection);

        // Fetch results
        fetchResults();
    }

    init();
});