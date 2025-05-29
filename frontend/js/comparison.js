// frontend/js/comparison.js

/**
 * CarMatch Car Comparison Handler
 *
 * This script manages the car comparison page functionality:
 * - Fetches car data for comparison from URL parameters
 * - Creates a side-by-side comparison table
 * - Handles loading states and error handling
 * - Manages favorite functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const loadingContainer = document.getElementById('loading-container');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    const retryButton = document.getElementById('retry-button');
    const comparisonSection = document.getElementById('comparison-section');
    const resultsCount = document.getElementById('results-count');
    const comparisonTable = document.getElementById('comparison-table');
    const tableHeader = document.getElementById('table-header');
    const tableBody = document.getElementById('table-body');

    // API endpoint
    const API_BASE_URL = 'http://localhost:3000/api/search';

    // Get car IDs from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const carIds = urlParams.get('cars') ? urlParams.get('cars').split(',') : [];

    console.log('Car IDs to compare:', carIds);

    /**
     * Formats a car price with proper currency formatting
     *
     * @param {number} price - The raw price value
     * @returns {string} - Formatted price with currency symbol and commas
     */
    function formatPrice(price) {
        return `$${parseFloat(price).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    }

    /**
     * Gets the match badge HTML based on match percentage
     *
     * @param {number} matchPercentage - The match percentage
     * @returns {string} - HTML string for the match badge
     */
    function getMatchBadge(matchPercentage) {
        let badgeClass = 'match-low';
        if (matchPercentage > 80) {
            badgeClass = 'match-high';
        } else if (matchPercentage > 60) {
            badgeClass = 'match-medium';
        }

        return `<span class="match-badge ${badgeClass}">${matchPercentage}% Match</span>`;
    }

    /**
     * Creates the comparison table with car data
     *
     * @param {Array} cars - Array of car objects to compare
     */
    function createComparisonTable(cars) {
        // Clear existing content
        tableHeader.innerHTML = '<th class="spec-header">Specification</th>';
        tableBody.innerHTML = '';

        // Add car headers
        cars.forEach((car, index) => {
            const th = document.createElement('th');
            th.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 1.1rem; margin-bottom: 5px;">
                        ${car.brand} ${car.model}
                    </div>
                    <div style="font-size: 0.9rem; opacity: 0.8;">
                        ${car.year}
                    </div>
                </div>
            `;
            tableHeader.appendChild(th);
        });

        // Define the specifications to compare
        const specifications = [
            {
                label: 'Match Percentage',
                key: 'matchpercentage',
                format: (value) => getMatchBadge(value || 100)
            },
            {
                label: 'Price',
                key: 'price',
                format: (value) => `<span class="price">${formatPrice(value)}</span>`
            },
            {
                label: 'Horsepower',
                key: 'horsepower',
                format: (value) => `${value} HP`
            },
            {
                label: 'Seats',
                key: 'seats',
                format: (value) => value || 'N/A'
            },
            {
                label: 'Fuel Type',
                key: 'fuel_type',
                format: (value) => value || 'N/A'
            },
            {
                label: 'Engine Type',
                key: 'engine_type',
                format: (value) => value || 'N/A'
            },
            {
                label: 'Favorite',
                key: 'favorite',
                format: (value, car) => `
                    <button class="favorite-btn" data-car-id="${car.id}" onclick="toggleFavorite(${car.id})">
                        <span class="favorite-icon">☆</span> Add to Favorites
                    </button>
                `
            }
        ];

        // Create table rows for each specification
        specifications.forEach(spec => {
            const row = document.createElement('tr');

            // Specification label cell
            const labelCell = document.createElement('td');
            labelCell.className = 'row-label';
            labelCell.textContent = spec.label;
            row.appendChild(labelCell);

            // Value cells for each car
            cars.forEach(car => {
                const valueCell = document.createElement('td');
                const rawValue = car[spec.key];

                if (spec.format) {
                    valueCell.innerHTML = spec.format(rawValue, car);
                } else {
                    valueCell.textContent = rawValue || 'N/A';
                }

                row.appendChild(valueCell);
            });

            tableBody.appendChild(row);
        });
    }

    /**
     * Toggles favorite status for a car
     * This is a global function that can be called from onclick handlers
     *
     * @param {number} carId - The ID of the car to toggle
     */
    window.toggleFavorite = function(carId) {
        const currentUser = localStorage.getItem('carMatchUser');

        if (!currentUser) {
            alert('Please log in to manage favorites');
            return;
        }

        const button = document.querySelector(`[data-car-id="${carId}"]`);
        const icon = button.querySelector('.favorite-icon');

        if (button.classList.contains('favorited')) {
            // Remove from favorites
            button.classList.remove('favorited');
            icon.textContent = '☆';
            button.innerHTML = '<span class="favorite-icon">☆</span> Add to Favorites';
            console.log(`Removed car ${carId} from favorites`);
        } else {
            // Add to favorites
            button.classList.add('favorited');
            icon.textContent = '★';
            button.innerHTML = '<span class="favorite-icon">★</span> Remove from Favorites';
            console.log(`Added car ${carId} to favorites`);
        }

        // Here you would normally make an API call to save the favorite status
        // For now, we'll just log it
    };

    /**
     * Displays the comparison results
     *
     * @param {Array} cars - Array of car objects to display
     */
    function displayComparison(cars) {
        // Hide loading state
        loadingContainer.style.display = 'none';

        if (cars.length === 0) {
            // Show error if no cars found
            errorMessage.textContent = 'No cars found for comparison. Please try again.';
            errorContainer.style.display = 'flex';
            return;
        }

        // Update results count
        resultsCount.textContent = `Comparing ${cars.length} selected vehicles`;

        // Create the comparison table
        createComparisonTable(cars);

        // Show comparison section
        comparisonSection.style.display = 'block';
    }

    /**
     * Displays the no cars selected message
     */
    function displayNoCarsMessage() {
        loadingContainer.style.display = 'none';

        const noCarsDiv = document.createElement('div');
        noCarsDiv.className = 'no-cars-message';
        noCarsDiv.innerHTML = `
            <h3>No Cars Selected for Comparison</h3>
            <p>Please go back to the search results and select cars to compare.</p>
            <div style="margin-top: 20px;">
                <a href="search_results.html" class="back-button">
                    ← Back to Search Results
                </a>
            </div>
        `;

        document.querySelector('.comparison-page').appendChild(noCarsDiv);
    }

    /**
     * Fetches car data from the API and filters by selected IDs
     */
    async function fetchCarsForComparison() {
        console.log('Starting fetchCarsForComparison');

        // Check if we have car IDs
        if (!carIds || carIds.length === 0) {
            console.log('No car IDs provided');
            displayNoCarsMessage();
            return;
        }

        // Show loading state
        loadingContainer.style.display = 'flex';
        errorContainer.style.display = 'none';
        comparisonSection.style.display = 'none';

        try {
            console.log('Fetching all cars from API');

            // Fetch all cars from the API
            const response = await fetch(API_BASE_URL);

            if (!response.ok) {
                throw new Error(`API responded with status ${response.status}`);
            }

            const allCars = await response.json();
            console.log(`Received ${allCars.length} cars from API`);

            // Filter cars by the selected IDs
            const selectedCars = allCars.filter(car =>
                carIds.includes(car.id.toString())
            );

            console.log(`Found ${selectedCars.length} cars matching selected IDs`);
            console.log('Selected cars:', selectedCars);

            if (selectedCars.length === 0) {
                throw new Error('No cars found matching the selected IDs');
            }

            // Display the comparison
            displayComparison(selectedCars);

        } catch (error) {
            console.error('Error fetching cars for comparison:', error);

            // Show error message
            errorMessage.textContent = `Unable to load car comparison: ${error.message}`;
            errorContainer.style.display = 'flex';
            loadingContainer.style.display = 'none';
        }
    }

    /**
     * Initializes the comparison page
     */
    function init() {
        console.log('Initializing car comparison page');
        console.log('URL parameters:', window.location.search);
        console.log('Car IDs from URL:', carIds);

        // Set up retry button
        retryButton.addEventListener('click', fetchCarsForComparison);

        // Fetch and display cars
        fetchCarsForComparison();
    }

    // Start initialization
    init();
});