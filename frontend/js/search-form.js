// frontend/js/search-form.js

/**
 * CarMatch Search Form Handler
 *
 * This Script manages the car search form.
 * It handles form field population, validation, and submission to the search results page.
 */
document.addEventListener('DOMContentLoaded', function() {
    // Form elements from different forms
    const brandSelect = document.getElementById('brand');
    const modelSelect = document.getElementById('model');
    const modelHelp = document.getElementById('model-help');
    const yearSelect = document.getElementById('year');
    const horsepowerInput = document.getElementById('horsepower');
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    const seatsInput = document.getElementById('seats');
    const fuelTypeSelect = document.getElementById('fuelType');
    const engineTypeSelect = document.getElementById('engineType');
    const formError = document.getElementById('form-error');

    // Buttons
    const resetButton = document.querySelector('#btn .btn-danger');
    const searchButton = document.querySelector('#btn .btn-success');

    // Alla bilmärken och modeller från din SQL-data
    const brands = [
        'BMW', 'Audi', 'Mercedes-Benz', 'Volvo', 'Volkswagen',
        'Porsche', 'Tesla', 'Toyota'
    ];

    const modelsByBrand = {
        'BMW': [
            '3 Series 330i', '5 Series 540i', 'X5 xDrive40i', 'i4 M50', 'M3 Competition',
            'X3 xDrive30i', '7 Series 750i', 'iX xDrive50', 'Z4 sDrive30i', 'X7 xDrive40i'
        ],
        'Audi': [
            'A4 Quattro', 'Q7 55 TFSI', 'e-tron GT', 'A6 Allroad', 'Q5 Sportback'
        ],
        'Mercedes-Benz': [
            'C300 4MATIC', 'GLE 450', 'EQS 580', 'S580 4MATIC', 'AMG GT 63 S'
        ],
        'Volvo': [
            'XC90 T6', 'XC40 Recharge', 'S90 T6', 'XC60 T8', 'V90 Cross Country'
        ],
        'Volkswagen': [
            'Golf GTI', 'ID.4 Pro', 'Arteon R-Line', 'Atlas Cross Sport', 'Tiguan SEL'
        ],
        'Porsche': [
            '911 Carrera', 'Taycan 4S', 'Cayenne Turbo', 'Panamera 4S', 'Macan GTS'
        ],
        'Tesla': [
            'Model 3 Long Range', 'Model Y Performance', 'Model S Plaid', 'Model X Long Range', 'Cybertruck'
        ],
        'Toyota': [
            'Prius Prime', 'Camry TRD', 'Highlander Hybrid', 'RAV4 Prime', 'Supra 3.0'
        ]
    };

    const years = [2023, 2022, 2021, 2020, 2019,2018,2017,2016,2015,2014];

    /**
     * Populates the brand dropdown with available car brands
     */
    function populateBrands() {
        // Sortera märkena alfabetiskt
        const sortedBrands = [...brands].sort();

        sortedBrands.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            brandSelect.appendChild(option);
        });
    }

    /**
     * Populates the year dropdown with available model years
     */
    function populateYears() {
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });
    }

    /**
     * Populates the model dropdown based on the selected brand
     *
     * @param {string} brand - The selected car brand
     */
    function populateModels(brand) {
        // Clear current options except the first one
        modelSelect.innerHTML = '<option value="">Select Model</option>';

        if (!brand) {
            modelSelect.disabled = true;
            modelHelp.style.display = 'block';
            return;
        }

        const models = modelsByBrand[brand] || [];

        // Sortera modellerna alfabetiskt
        const sortedModels = [...models].sort();

        sortedModels.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
        });

        modelSelect.disabled = false;
        modelHelp.style.display = 'none';
    }

    /**
     * Validates a form field
     *
     * @param {HTMLElement} field - The input element to validate
     * @returns {boolean} - True if field is valid, false otherwise
     */
    function validateField(field) {
        let isValid = true;

        switch (field.id) {
            case 'horsepower':
                if (field.value && (isNaN(field.value) || parseInt(field.value) < 0)) {
                    document.getElementById('horsepower-error').textContent = 'Horsepower must be a positive number';
                    isValid = false;
                } else {
                    document.getElementById('horsepower-error').textContent = '';
                }
                break;

            case 'minPrice':
                if (field.value && (isNaN(field.value) || parseFloat(field.value) < 0)) {
                    document.getElementById('minPrice-error').textContent = 'Minimum price must be a positive number';
                    isValid = false;
                } else if (maxPriceInput.value && parseFloat(field.value) > parseFloat(maxPriceInput.value)) {
                    document.getElementById('minPrice-error').textContent = 'Minimum price cannot be greater than maximum price';
                    isValid = false;
                } else {
                    document.getElementById('minPrice-error').textContent = '';
                }
                break;

            case 'maxPrice':
                if (field.value && (isNaN(field.value) || parseFloat(field.value) < 0)) {
                    document.getElementById('maxPrice-error').textContent = 'Maximum price must be a positive number';
                    isValid = false;
                } else if (minPriceInput.value && parseFloat(field.value) < parseFloat(minPriceInput.value)) {
                    document.getElementById('maxPrice-error').textContent = 'Maximum price cannot be less than minimum price';
                    isValid = false;
                } else {
                    document.getElementById('maxPrice-error').textContent = '';
                }
                break;

            case 'seats':
                if (field.value && (isNaN(field.value) || parseInt(field.value) < 1 || parseInt(field.value) > 10)) {
                    document.getElementById('seats-error').textContent = 'Seats must be between 1 and 10';
                    isValid = false;
                } else {
                    document.getElementById('seats-error').textContent = '';
                }
                break;
        }

        return isValid;
    }

    /**
     * Validates the entire form before submission
     *
     * @returns {boolean} - True if form is valid, false otherwise
     */
    function validateForm() {
        let isValid = true;

        // Check individual fields
        if (!validateField(horsepowerInput)) isValid = false;
        if (!validateField(minPriceInput)) isValid = false;
        if (!validateField(maxPriceInput)) isValid = false;
        if (!validateField(seatsInput)) isValid = false;

        // Check if at least one search criteria is provided
        if (!brandSelect.value && !modelSelect.value && !yearSelect.value &&
            !horsepowerInput.value && !minPriceInput.value && !maxPriceInput.value &&
            !seatsInput.value && !fuelTypeSelect.value && !engineTypeSelect.value) {
            formError.textContent = 'Please provide at least one search criteria';
            isValid = false;
        } else {
            formError.textContent = '';
        }

        return isValid;
    }

    /**
     * Handles the search form submission
     *
     * @param {Event} event - The form submission event
     */
    function handleSubmit(event) {
        if (event) event.preventDefault();

        if (!validateForm()) {
            alert('Please correct the errors in the form');
            return;
        }

        // Build form data object
        const formData = {
            brand: brandSelect.value,
            model: modelSelect.value,
            year: yearSelect.value,
            horsepower: horsepowerInput.value,
            minPrice: minPriceInput.value,
            maxPrice: maxPriceInput.value,
            seats: seatsInput.value,
            fuelType: fuelTypeSelect.value,
            engineType: engineTypeSelect.value
        };

        // Filter out empty values
        const searchParams = {};
        Object.entries(formData).forEach(([key, value]) => {
            if (value) {
                searchParams[key] = value;
            }
        });

        // Redirect to results page with search params
        const urlParams = new URLSearchParams();
        Object.entries(searchParams).forEach(([key, value]) => {
            urlParams.append(key, value);
        });

        window.location.href = `search_results.html?${urlParams.toString()}`;
    }

    /**
     * Resets all form fields to their default state
     */
    function resetForm() {
        // Reset all form fields manually
        brandSelect.value = '';
        modelSelect.value = '';
        yearSelect.value = '';
        horsepowerInput.value = '';
        minPriceInput.value = '';
        maxPriceInput.value = '';
        seatsInput.value = '';
        fuelTypeSelect.value = '';
        engineTypeSelect.value = '';

        // Clear all error messages
        document.getElementById('horsepower-error').textContent = '';
        document.getElementById('minPrice-error').textContent = '';
        document.getElementById('maxPrice-error').textContent = '';
        document.getElementById('seats-error').textContent = '';
        formError.textContent = '';

        // Reset model dropdown
        modelSelect.innerHTML = '<option value="">Select Model</option>';
        modelSelect.disabled = true;
        modelHelp.style.display = 'block';
    }

    /**
     * Initializes the form when the page loads
     */
    function init() {
        populateBrands();
        populateYears();

        // Set up event listeners
        brandSelect.addEventListener('change', () => populateModels(brandSelect.value));

        // Set up validation on input
        horsepowerInput.addEventListener('input', () => validateField(horsepowerInput));
        minPriceInput.addEventListener('input', () => {
            validateField(minPriceInput);
            if (maxPriceInput.value) validateField(maxPriceInput);
        });
        maxPriceInput.addEventListener('input', () => {
            validateField(maxPriceInput);
            if (minPriceInput.value) validateField(minPriceInput);
        });
        seatsInput.addEventListener('input', () => validateField(seatsInput));

        // Form submission and reset
        resetButton.addEventListener('click', resetForm);

        // Fix the search button to use our handler instead of just following the href
        searchButton.addEventListener('click', handleSubmit);
        searchButton.querySelector('a').addEventListener('click', function(e) {
            e.preventDefault(); // Prevent the default link behavior
        });

        // Check for URL parameters (for when returning from results page)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.toString()) {
            // Populate form with URL parameters
            if (urlParams.has('brand')) {
                brandSelect.value = urlParams.get('brand');
                populateModels(urlParams.get('brand'));

                if (urlParams.has('model')) {
                    modelSelect.value = urlParams.get('model');
                }
            }

            if (urlParams.has('year')) yearSelect.value = urlParams.get('year');
            if (urlParams.has('horsepower')) horsepowerInput.value = urlParams.get('horsepower');
            if (urlParams.has('minPrice')) minPriceInput.value = urlParams.get('minPrice');
            if (urlParams.has('maxPrice')) maxPriceInput.value = urlParams.get('maxPrice');
            if (urlParams.has('seats')) seatsInput.value = urlParams.get('seats');
            if (urlParams.has('fuelType')) fuelTypeSelect.value = urlParams.get('fuelType');
            if (urlParams.has('engineType')) engineTypeSelect.value = urlParams.get('engineType');
        }
    }

    // Start initialization when page loads
    init();
});