// frontend/js/search-results.js

/**
 * CarMatch Search Results Handler
 *
 * This script manages the search results page functionality:
 * - Displays search parameters
 * - Fetches search results from API (with fallback)
 * - Creates and manages car cards from search results
 * - Handles car comparison selection
 * - Manages favorites functionality
 */
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

    // API endpoint base URLs
    const API_BASE_URL = 'http://localhost:3000/api/search';
    const FAVORITES_API_URL = 'http://localhost:3000/api/favorites';

    // Current user data and search results
    let currentUser = null;
    let searchResultsData = []; // Store the search results with match percentages

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

    /**
     * Check if user is logged in
     */
    function checkUserLogin() {
        const userData = localStorage.getItem('carMatchUser');
        if (userData) {
            try {
                currentUser = JSON.parse(userData);
                return true;
            } catch (error) {
                console.error('Error parsing user data:', error);
                return false;
            }
        }
        return false;
    }

    /**
     * Displays the search parameters in the header
     */
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

    /**
     * Formats a car price with proper currency formatting
     */
    function formatPrice(price) {
        return `$${parseFloat(price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }

    /**
     * Toggles favorite status for a car
     */
    async function toggleFavorite(carId, favoriteButton) {
        if (!currentUser) {
            alert('Please log in to manage favorites');
            window.location.href = 'log_in.html';
            return;
        }

        const icon = favoriteButton.querySelector('.favorite-icon');
        const isFavorited = favoriteButton.classList.contains('favorited');

        try {
            let response;

            if (isFavorited) {
                // Remove from favorites
                response = await fetch(`${FAVORITES_API_URL}/${carId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${currentUser.id}`,
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                // Add to favorites
                response = await fetch(FAVORITES_API_URL, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${currentUser.id}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ carId: carId })
                });
            }

            const data = await response.json();

            if (response.ok) {
                // Update UI
                if (isFavorited) {
                    favoriteButton.classList.remove('favorited');
                    icon.textContent = '☆';
                    favoriteButton.title = 'Add to favorites';
                } else {
                    favoriteButton.classList.add('favorited');
                    icon.textContent = '★';
                    favoriteButton.title = 'Remove from favorites';
                }
                console.log(data.message);
            } else {
                alert(data.message || 'Failed to update favorites');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            alert('An error occurred while updating favorites');
        }
    }

    /**
     * Checks if cars are favorited and updates UI accordingly
     */
    async function checkFavoritedCars(carIds) {
        if (!currentUser || carIds.length === 0) {
            return;
        }

        try {
            // Get user's favorites
            const response = await fetch(FAVORITES_API_URL, {
                headers: {
                    'Authorization': `Bearer ${currentUser.id}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const favoritedCarIds = data.favorites.map(fav => fav.car_id.toString());

                // Update favorite buttons
                carIds.forEach(carId => {
                    if (favoritedCarIds.includes(carId.toString())) {
                        const favoriteButton = document.querySelector(`[data-car-id="${carId}"] .favorite-button`);
                        if (favoriteButton) {
                            favoriteButton.classList.add('favorited');
                            const icon = favoriteButton.querySelector('.favorite-icon');
                            if (icon) {
                                icon.textContent = '★';
                                favoriteButton.title = 'Remove from favorites';
                            }
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Error checking favorited cars:', error);
        }
    }

    /**
     * Creates a car card from the HTML template and car data
     */
    function createCarCard(car) {
        console.log('Creating card for car:', car);

        try {
            // Clone the template
            const cardNode = document.importNode(carCardTemplate.content, true);

            // Set match percentage and color
            const matchBadge = cardNode.querySelector('.match-badge');
            const matchValue = car.matchPercentage || 0;
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

            // Blocket link
            const detailsLink = cardNode.querySelector('.details-button');
            const searchQuery = `${car.brand} ${car.model}`.toLowerCase().replace(/\s+/g, '+');
            detailsLink.href = `https://www.blocket.se/bilar/sok?q=${searchQuery}`;
            detailsLink.target = '_blank';
            detailsLink.rel = 'noopener noreferrer';
            detailsLink.textContent = 'Find on Blocket';

            // View Details button
            const carCardActions = cardNode.querySelector('.car-card-actions');

            // View Details button
            const viewDetailsButton = document.createElement('a');
            viewDetailsButton.href = `car_details.html?id=${car.id}`;
            viewDetailsButton.className = 'details-button view-details-btn';
            viewDetailsButton.textContent = 'View Details';
            viewDetailsButton.style.backgroundColor = '#007bff';
            viewDetailsButton.style.marginLeft = '10px';

            viewDetailsButton.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = `car_details.html?id=${car.id}`;
            });

            // Blocket button
            carCardActions.appendChild(viewDetailsButton);

            // favorite button with car ID data attribute
            const favoriteButton = cardNode.querySelector('.favorite-button');
            const cardWrapper = cardNode.querySelector('.car-card-wrapper');
            cardWrapper.dataset.carId = car.id;

            favoriteButton.addEventListener('click', function(e) {
                e.preventDefault();
                toggleFavorite(car.id, favoriteButton);
            });

            if (window.ReviewsUI) {
                // Container for each car
                const reviewsContainer = cardNode.querySelector('.reviews-content');
                reviewsContainer.id = `reviews-container-${car.id}`;

                // click action toggle button
                const toggleBtn = cardNode.querySelector('.toggle-reviews-btn');
                toggleBtn.addEventListener('click', async () => {
                    if (reviewsContainer.style.display === 'none') {
                        reviewsContainer.style.display = 'block';
                        toggleBtn.textContent = 'Hide Reviews';
                        await ReviewsUI.showReviews(car.id, `reviews-container-${car.id}`);
                    } else {
                        reviewsContainer.style.display = 'none';
                        toggleBtn.textContent = 'Show Reviews';
                    }
                });
            }
            console.log('About to check ReviewsUI:', window.ReviewsUI);

            return cardNode;
        } catch (error) {
            console.error('Error creating car card:', error);
            return document.createElement('div');
        }
    }

    /**
     * Handles car comparison checkbox changes
     */
    function handleCompareCheckbox(e) {
        const selectedCheckboxes = document.querySelectorAll('.compare-checkbox:checked');
        const count = selectedCheckboxes.length;

        console.log('Checkbox changed. Selected count:', count);
        console.log('Selected car IDs:', Array.from(selectedCheckboxes).map(cb => cb.dataset.carId));

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

    /**
     * Handles the compare button click event
     */
    function handleCompareClick(e) {
        e.preventDefault();
        e.stopPropagation();

        console.log('Compare button clicked');

        const selectedCheckboxes = document.querySelectorAll('.compare-checkbox:checked');
        console.log('Selected checkboxes:', selectedCheckboxes.length);

        if (selectedCheckboxes.length < 2) {
            alert('Please select at least 2 cars to compare');
            return;
        }

        const carIds = Array.from(selectedCheckboxes).map(cb => cb.dataset.carId);
        console.log('Car IDs to compare:', carIds);

        // Store the current search results data with match percentages for comparison page
        const selectedCarsData = searchResultsData.filter(car =>
            carIds.includes(car.id.toString())
        );

        console.log('Selected cars data with match percentages:', selectedCarsData);

        // Store in sessionStorage so comparison page can access it
        sessionStorage.setItem('comparisonCarsData', JSON.stringify(selectedCarsData));

        // Also store the original search parameters so we can return to the same search
        sessionStorage.setItem('originalSearchParams', JSON.stringify(searchParams));

        // Redirect to comparison page
        const comparisonUrl = `comp.html?cars=${carIds.join(',')}`;
        console.log('Redirecting to:', comparisonUrl);
        window.location.href = comparisonUrl;
    }

    /**
     * Clears all selected comparison checkboxes
     */
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

    /**
     * Displays car search results on the page
     */
    function displayCarResults(cars) {
        // Store the search results data for later use in comparison
        searchResultsData = cars;

        // Hide loading state
        loadingContainer.style.display = 'none';

        // Display results
        resultsCount.textContent = `Found ${cars.length} cars matching your criteria`;

        // Clear existing results
        carList.innerHTML = '';

        if (cars.length === 0) {
            // Message when no results are found
            carList.innerHTML = `
                <div class="no-results">
                    <h3>No cars found matching your criteria</h3>
                    <p>Try adjusting your search parameters for better results.</p>
                </div>
            `;
        } else {
            // each car card
            cars.forEach(car => {
                const cardElement = createCarCard(car);
                carList.appendChild(cardElement);
            });

            // Check which cars are favorited (if user is logged in)
            if (currentUser) {
                const carIds = cars.map(car => car.id);
                checkFavoritedCars(carIds);
            }
        }

        // Show results section
        resultsSection.style.display = 'block';
    }

    /**
     * Fetches car results from the API
     */
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

            // Show error message to user
            errorMessage.textContent = 'Unable to connect to server. Please try again later.';
            errorContainer.style.display = 'flex';

            // Display empty results
            displayCarResults([]);
        }
    }

    /**
     * Initializes the search results page
     */
    function init() {
        console.log('Initializing search results page');

        // Check if user is logged in
        checkUserLogin();

        // Display search parameters
        displaySearchParams();

        // Set up event listeners
        modifySearchButton.addEventListener('click', () => {
            window.location.href = `index.html?${urlParams.toString()}`;
        });

        retryButton.addEventListener('click', fetchResults);

        // Handle compare button
        compareButton.addEventListener('click', handleCompareClick);

        // handle the link inside the compare button
        const compareLink = compareButton.querySelector('a');
        if (compareLink) {
            compareLink.addEventListener('click', handleCompareClick);
        }

        clearSelectionButton.addEventListener('click', clearSelection);

        // Fetch results
        fetchResults();
    }

    // Start initialization
    init();
});