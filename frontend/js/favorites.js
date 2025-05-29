// frontend/js/favorites.js

/**
 * CarMatch Favorites Page Handler
 *
 * This script manages the favorites page functionality:
 * - Fetches user's favorite cars
 * - Displays favorite cars with details
 * - Handles removing cars from favorites
 * - Manages favorite actions and UI updates
 */
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const loadingContainer = document.getElementById('loading-container');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    const retryButton = document.getElementById('retry-button');
    const noFavoritesContainer = document.getElementById('no-favorites-container');
    const favoritesSection = document.getElementById('favorites-section');
    const favoritesCount = document.getElementById('favorites-count');
    const favoritesList = document.getElementById('favorites-list');
    const clearAllButton = document.getElementById('clear-all-favorites');
    const favoriteCarTemplate = document.getElementById('favorite-car-template');

    // API endpoints
    const API_BASE_URL = 'http://localhost:3000/api';
    const FAVORITES_API_URL = `${API_BASE_URL}/favorites`;
    const SEARCH_API_URL = `${API_BASE_URL}/search`;

    // Current user data
    let currentUser = null;

    /**
     * Checks if user is logged in and redirects if not
     */
    function checkAuthentication() {
        const userData = localStorage.getItem('carMatchUser');

        if (!userData) {
            alert('Please log in to view your favorites');
            window.location.href = 'log_in.html';
            return false;
        }

        try {
            currentUser = JSON.parse(userData);
            return true;
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('carMatchUser');
            window.location.href = 'log_in.html';
            return false;
        }
    }

    /**
     * Formats a date string for display
     *
     * @param {string} dateString - ISO date string
     * @returns {string} - Formatted date
     */
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

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
     * Creates a favorite car card from template and car data
     *
     * @param {Object} car - The car data object
     * @param {string} dateAdded - When the car was added to favorites
     * @returns {HTMLElement} - The populated car card DOM element
     */
    function createFavoriteCarCard(car, dateAdded) {
        try {
            // Clone the template
            const cardNode = document.importNode(favoriteCarTemplate.content, true);

            // Set date added
            cardNode.querySelector('.date-added').textContent = formatDate(dateAdded);

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

            // Set remove favorite button
            const removeFavoriteButton = cardNode.querySelector('.remove-favorite-button');
            removeFavoriteButton.addEventListener('click', function(e) {
                e.preventDefault();
                removeFavorite(car.id, cardNode);
            });

            return cardNode;
        } catch (error) {
            console.error('Error creating favorite car card:', error);
            return document.createElement('div');
        }
    }

    /**
     * Removes a car from favorites
     *
     * @param {number} carId - The ID of the car to remove
     * @param {HTMLElement} cardElement - The card element to remove from DOM
     */
    async function removeFavorite(carId, cardElement) {
        if (!confirm('Are you sure you want to remove this car from your favorites?')) {
            return;
        }

        try {
            const response = await fetch(`${FAVORITES_API_URL}/${carId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${currentUser.id}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                // Remove the card from display
                const cardWrapper = cardElement.closest ? cardElement.closest('.car-card-wrapper') : cardElement.parentElement;
                if (cardWrapper) {
                    cardWrapper.remove();
                }

                // Update count
                const currentCount = parseInt(favoritesCount.textContent.match(/\d+/)[0]);
                const newCount = currentCount - 1;

                if (newCount === 0) {
                    // Show no favorites message
                    favoritesSection.style.display = 'none';
                    noFavoritesContainer.style.display = 'block';
                } else {
                    favoritesCount.textContent = `You have ${newCount} favorite car${newCount === 1 ? '' : 's'}`;
                }

                console.log('Car removed from favorites successfully');
            } else {
                alert(data.message || 'Failed to remove car from favorites');
            }
        } catch (error) {
            console.error('Error removing favorite:', error);
            alert('An error occurred while removing the car from favorites');
        }
    }

    /**
     * Clears all favorites after user confirmation
     */
    async function clearAllFavorites() {
        if (!confirm('Are you sure you want to remove ALL cars from your favorites? This action cannot be undone.')) {
            return;
        }

        try {
            // Get all favorite car IDs
            const favoriteCards = document.querySelectorAll('.remove-favorite-button');
            const removePromises = [];

            favoriteCards.forEach(button => {
                const cardWrapper = button.closest('.car-card-wrapper');
                const carId = button.getAttribute('data-car-id') ||
                    cardWrapper.querySelector('.details-button').href.split('id=')[1];

                if (carId) {
                    removePromises.push(
                        fetch(`${FAVORITES_API_URL}/${carId}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${currentUser.id}`,
                                'Content-Type': 'application/json'
                            }
                        })
                    );
                }
            });

            await Promise.all(removePromises);

            // Clear the display
            favoritesList.innerHTML = '';
            favoritesSection.style.display = 'none';
            noFavoritesContainer.style.display = 'block';

            alert('All favorites have been cleared');
        } catch (error) {
            console.error('Error clearing all favorites:', error);
            alert('An error occurred while clearing favorites');
        }
    }

    /**
     * Displays the favorite cars
     *
     * @param {Array} favorites - Array of favorite objects with car_id and created_at
     * @param {Array} cars - Array of all car objects
     */
    function displayFavorites(favorites, cars) {
        loadingContainer.style.display = 'none';

        if (favorites.length === 0) {
            noFavoritesContainer.style.display = 'block';
            return;
        }

        // Update count
        favoritesCount.textContent = `You have ${favorites.length} favorite car${favorites.length === 1 ? '' : 's'}`;

        // Clear existing results
        favoritesList.innerHTML = '';

        // Create car cards for each favorite
        favorites.forEach(favorite => {
            const car = cars.find(c => c.id.toString() === favorite.car_id.toString());
            if (car) {
                const cardElement = createFavoriteCarCard(car, favorite.created_at);
                favoritesList.appendChild(cardElement);
            } else {
                console.warn(`Car with ID ${favorite.car_id} not found in search results`);
            }
        });

        // Show favorites section
        favoritesSection.style.display = 'block';
    }

    /**
     * Fetches user's favorite cars and displays them
     */
    async function fetchFavorites() {
        console.log('Fetching user favorites');

        // Show loading state
        loadingContainer.style.display = 'flex';
        errorContainer.style.display = 'none';
        noFavoritesContainer.style.display = 'none';
        favoritesSection.style.display = 'none';

        try {
            // Fetch user's favorites
            const favoritesResponse = await fetch(FAVORITES_API_URL, {
                headers: {
                    'Authorization': `Bearer ${currentUser.id}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!favoritesResponse.ok) {
                throw new Error(`Failed to fetch favorites: ${favoritesResponse.status}`);
            }

            const favoritesData = await favoritesResponse.json();
            console.log('Favorites response:', favoritesData);

            if (favoritesData.favorites.length === 0) {
                loadingContainer.style.display = 'none';
                noFavoritesContainer.style.display = 'block';
                return;
            }

            // Fetch all cars to get details
            const carsResponse = await fetch(SEARCH_API_URL);

            if (!carsResponse.ok) {
                throw new Error(`Failed to fetch car details: ${carsResponse.status}`);
            }

            const allCars = await carsResponse.json();
            console.log(`Fetched ${allCars.length} cars for details`);

            // Display the favorites
            displayFavorites(favoritesData.favorites, allCars);

        } catch (error) {
            console.error('Error fetching favorites:', error);

            // Show error message
            errorMessage.textContent = `Unable to load your favorites: ${error.message}`;
            errorContainer.style.display = 'flex';
            loadingContainer.style.display = 'none';
        }
    }

    /**
     * Initializes the favorites page
     */
    function init() {
        console.log('Initializing favorites page');

        // Check authentication
        if (!checkAuthentication()) {
            return;
        }

        // Set up event listeners
        retryButton.addEventListener('click', fetchFavorites);
        clearAllButton.addEventListener('click', clearAllFavorites);

        // Fetch and display favorites
        fetchFavorites();
    }

    // Start initialization
    init();
});