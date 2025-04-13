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
        return `$${parseInt(price).toLocaleString()}`;
    }

    // Create a car card from template
    function createCarCard(car) {
        console.log('Creating card for car:', car);

        // Clone the template
        const cardNode = document.importNode(carCardTemplate.content, true);

        // Set match percentage and color
        const matchBadge = cardNode.querySelector('.match-badge');
        matchBadge.textContent = `${car.matchPercentage}% Match`;

        // Set badge color based on match percentage
        if (car.matchPercentage > 80) {
            matchBadge.style.backgroundColor = '#4CAF50'; // Green
        } else if (car.matchPercentage > 60) {
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

    // Hardcoded car data
    const hardcodedCars = [
        {
            id: 1,
            brand: 'BMW',
            model: '3 Series 330i',
            year: 2021,
            horsepower: 255,
            price: 41999.99,
            seats: 5,
            fuel_type: 'Petrol',
            engine_type: '2.0L I4 Turbo',
            image_url: 'https://example.com/bmw330i.jpg',
            matchPercentage: 95
        },
        {
            id: 2,
            brand: 'BMW',
            model: '5 Series 540i',
            year: 2022,
            horsepower: 335,
            price: 58999.00,
            seats: 5,
            fuel_type: 'Petrol',
            engine_type: '3.0L I6 Turbo',
            image_url: 'https://example.com/bmw540i.jpg',
            matchPercentage: 87
        },
        {
            id: 3,
            brand: 'BMW',
            model: 'X5 xDrive40i',
            year: 2023,
            horsepower: 375,
            price: 65995.00,
            seats: 5,
            fuel_type: 'Petrol',
            engine_type: '3.0L I6 Turbo',
            image_url: 'https://example.com/bmwx5.jpg',
            matchPercentage: 82
        },
        {
            id: 4,
            brand: 'BMW',
            model: 'i4 M50',
            year: 2022,
            horsepower: 536,
            price: 64900.00,
            seats: 5,
            fuel_type: 'Electric',
            engine_type: 'Dual Electric Motor',
            image_url: 'https://example.com/bmwi4m50.jpg',
            matchPercentage: 75
        },
        {
            id: 5,
            brand: 'BMW',
            model: 'M3 Competition',
            year: 2023,
            horsepower: 503,
            price: 74995.00,
            seats: 5,
            fuel_type: 'Petrol',
            engine_type: '3.0L I6 Twin Turbo',
            image_url: 'https://example.com/bmwm3.jpg',
            matchPercentage: 68
        }
    ];


    // Filter cars based on search parameters
    function filterCars(cars, params) {
        return cars.filter(car => {
            // Brand filter
            if (params.brand && car.brand !== params.brand) {
                return false;
            }

            // Model filter
            if (params.model && !car.model.includes(params.model)) {
                return false;
            }

            // Year filter
            if (params.year && car.year !== parseInt(params.year)) {
                return false;
            }

            // Horsepower filter
            if (params.horsepower && car.horsepower < parseInt(params.horsepower)) {
                return false;
            }

            // Price range filter
            if (params.minPrice && car.price < parseInt(params.minPrice)) {
                return false;
            }
            if (params.maxPrice && car.price > parseInt(params.maxPrice)) {
                return false;
            }

            // Seats filter
            if (params.seats && car.seats < parseInt(params.seats)) {
                return false;
            }

            // Fuel type filter
            if (params.fuelType && car.fuel_type !== params.fuelType) {
                return false;
            }

            // Engine type filter
            if (params.engineType && !car.engine_type.includes(params.engineType)) {
                return false;
            }

            return true;
        });
    }

    // Fetch car results (now using hardcoded data)
    async function fetchResults() {
        console.log('Starting fetchResults function with hardcoded data');

        // Show loading state
        loadingContainer.style.display = 'flex';
        errorContainer.style.display = 'none';
        resultsSection.style.display = 'none';

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));

            // Filter cars based on search parameters
            const filteredCars = Object.keys(searchParams).length > 0
                ? filterCars(hardcodedCars, searchParams)
                : hardcodedCars;

            console.log(`Filtered to ${filteredCars.length} cars`);

            // Hide loading state
            loadingContainer.style.display = 'none';

            // Display results
            resultsCount.textContent = `Found ${filteredCars.length} cars matching your criteria`;

            // Clear existing results
            carList.innerHTML = '';

            if (filteredCars.length === 0) {
                // Show a message when no results are found
                carList.innerHTML = `
                    <div class="no-results">
                        <h3>No cars found matching your criteria</h3>
                        <p>Try adjusting your search parameters for better results.</p>
                    </div>
                `;
            } else {
                // Add each car card
                filteredCars.forEach(car => {
                    const cardElement = createCarCard(car);
                    carList.appendChild(cardElement);
                });
            }

            // Show results section
            resultsSection.style.display = 'block';

        } catch (error) {
            console.error('Error processing results:', error);

            // Show error state
            loadingContainer.style.display = 'none';
            errorContainer.style.display = 'flex';
            errorMessage.textContent = 'Failed to load search results. Please try again.';
        }
    }

    // Initialize
    function init() {
        console.log('Initializing search results page with hardcoded data');

        // Display search parameters
        displaySearchParams();

        // Set up event listeners
        modifySearchButton.addEventListener('click', () => {
            window.location.href = `search-form.html?${urlParams.toString()}`;
        });

        retryButton.addEventListener('click', fetchResults);
        compareButton.addEventListener('click', handleCompareClick);
        clearSelectionButton.addEventListener('click', clearSelection);

        // Fetch results
        fetchResults();
    }

    init();
});