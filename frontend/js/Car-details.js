// frontend/js/car-details.js

document.addEventListener('DOMContentLoaded', function() {
    const loadingContainer = document.getElementById('loading-container');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    const carDetailsContent = document.getElementById('car-details-content');

    const API_BASE_URL = 'http://localhost:3000/api/cars';

    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('id');

    console.log('Car ID from URL:', carId);

    function formatPrice(price) {
        return `${parseFloat(price).toLocaleString('sv-SE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })} kr`;
    }

    function createFactItem(icon, label, value) {
        if (!value || value === 'N/A' || value === 'null' || value === null) {
            return '';
        }

        return `
            <div class="fact-item">
                <div class="fact-icon">${icon}</div>
                <div class="fact-content">
                    <span class="fact-label">${label}</span>
                    <span class="fact-value">${value}</span>
                </div>
            </div>
        `;
    }

    function displayCarDetails(car) {
        console.log('Displaying car details:', car);

        loadingContainer.style.display = 'none';
        carDetailsContent.style.display = 'block';

        document.getElementById('car-title').textContent = `${car.brand} ${car.model}`;
        document.getElementById('car-subtitle').textContent = `${car.year} • ${car.horsepower} hk`;

        document.getElementById('car-price').textContent = formatPrice(car.price);

        const carImage = document.getElementById('car-image');
        carImage.src = car.image_url || 'images/car-placeholder.jpg';
        carImage.alt = `${car.brand} ${car.model}`;

        const factsGrid = document.getElementById('facts-grid');
        let factsHTML = '';

        factsHTML += createFactItem('⛽', 'Bränsle', car.fuel_type_sv || car.fuel_type);
        factsHTML += createFactItem('🔀', 'Växellåda', car.transmission_sv || car.transmission);
        factsHTML += createFactItem('📅', 'Modellår', car.year);
        factsHTML += createFactItem('🚗', 'Biltyp', car.body_type_sv || car.body_type);
        factsHTML += createFactItem('🏎️', 'Drivning', car.drive_type_sv || car.drive_type);
        factsHTML += createFactItem('💪', 'Hästkrafter', `${car.horsepower} Hk`);

        if (car.engine_size) {
            factsHTML += createFactItem('⚙️', 'Motorstorlek', `${car.engine_size} cc`);
        }

        factsHTML += createFactItem('🏷️', 'Märke', car.brand);

        const modelShort = car.model.split(' ').pop() || car.model;
        factsHTML += createFactItem('📋', 'Modell', modelShort);

        factsHTML += createFactItem('👥', 'Säten', car.seats);
        factsHTML += createFactItem('🔧', 'Motor typ', car.engine_type);

        if (car.service_history) {
            factsHTML += createFactItem('🔨', 'Servicehistorik', car.service_history);
        }

        factsGrid.innerHTML = factsHTML;

        if (car.equipment && car.equipment.length > 0) {
            const equipmentList1 = document.getElementById('equipment-list-1');
            const equipmentList2 = document.getElementById('equipment-list-2');

            equipmentList1.innerHTML = '';
            equipmentList2.innerHTML = '';

            const midPoint = Math.ceil(car.equipment.length / 2);

            car.equipment.forEach((item, index) => {
                const li = document.createElement('li');
                li.textContent = item.name;

                if (index < midPoint) {
                    equipmentList1.appendChild(li);
                } else {
                    equipmentList2.appendChild(li);
                }
            });
        } else {
            document.querySelector('.car-equipment-section').style.display = 'none';
        }

        if (window.ReviewsUI) {
            ReviewsUI.showReviews(carId, 'reviews-container');
        }

        document.getElementById('contact-button').addEventListener('click', function() {
            const searchQuery = encodeURIComponent(`${car.brand} ${car.model}`);
            const blocketUrl = `https://www.blocket.se/bilar/sok?q=${searchQuery}`;
            window.open(blocketUrl, '_blank');
        });
    }

    async function fetchCarDetails() {
        if (!carId) {
            errorMessage.textContent = 'Inget bil-ID angivet';
            errorContainer.style.display = 'flex';
            loadingContainer.style.display = 'none';
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/${carId}`);

            if (!response.ok) {
                throw new Error(`API responded with status ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.car) {
                displayCarDetails(data.car);
            } else {
                throw new Error('Bilen hittades inte');
            }

        } catch (error) {
            console.error('Error fetching car details:', error);
            errorMessage.textContent = `Kunde inte ladda bildetaljer: ${error.message}`;
            errorContainer.style.display = 'flex';
            loadingContainer.style.display = 'none';
        }
    }

    fetchCarDetails();
});