// frontend/js/favorites.js

/**
 * CarMatch Favorites Page Handler
 *
 * This script manages the favorites page functionality:
 * - Fetches user's favorite cars
 * - Displays favorite cars with details
 * - Handles removing individual cars from favorites
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
     */
    function formatPrice(price) {
        return `$${parseFloat(price).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    }

    /**
     * Creates a favorite car card from template and car data
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

            // Set details link to redirect to Blocket search
            const detailsLink = cardNode.querySelector('.details-button');
            const searchQuery = `${car.brand} ${car.model}`.toLowerCase().replace(/\s+/g, '+');
            detailsLink.href = `https://www.blocket.se/bilar/sok?q=${searchQuery}`;
            detailsLink.target = '_blank';
            detailsLink.rel = 'noopener noreferrer';
            detailsLink.textContent = 'Find on Blocket';

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
     * Displays the favorite cars
     */
    function displayFavorites(favorites, cars) {
        // Hide loading and error states
        loadingContainer.style.display = 'none';
        errorContainer.style.display = 'none';

        if (favorites.length === 0) {
            // Hide favorites section and show no favorites message
            favoritesSection.style.display = 'none';
            noFavoritesContainer.style.display = 'block';
            return;
        }

        // Hide no favorites message and show favorites section
        noFavoritesContainer.style.display = 'none';
        favoritesSection.style.display = 'block';

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

        // Fetch and display favorites
        fetchFavorites();
    }

    // Start initialization
    init();
});