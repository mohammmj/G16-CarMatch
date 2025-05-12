// frontend/js/register.js

/**
 * CarMatch Registration Handler
 *
 * This script manages the registration form:
 * - Validates user input
 * - Sends registration requests to the API
 * - Handles registration success/failure
 */
document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const registerForm = document.querySelector('.needs-validation');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('passwordConfirm');
    const agreeTermsCheckbox = document.getElementById('agreeTerms');
    const registerButton = document.querySelector('.btn-primary');

    // API endpoint
    const API_URL = 'http://localhost:3000/api/auth/register';

    /**
     * Validates that passwords match
     *
     * @returns {boolean} - True if passwords match, false otherwise
     */
    function validatePasswordMatch() {
        if (passwordInput.value !== passwordConfirmInput.value) {
            passwordConfirmInput.setCustomValidity('Passwords do not match');
            return false;
        } else {
            passwordConfirmInput.setCustomValidity('');
            return true;
        }
    }

    /**
     * Validates the entire registration form
     *
     * @returns {boolean} - True if form is valid, false otherwise
     */
    function validateForm() {
        let isValid = true;

        // Check username
        if (!usernameInput.value.trim()) {
            usernameInput.setCustomValidity('Username is required');
            isValid = false;
        } else if (usernameInput.value.trim().length < 3) {
            usernameInput.setCustomValidity('Username must be at least 3 characters long');
            isValid = false;
        } else {
            usernameInput.setCustomValidity('');
        }

        // Check password
        if (!passwordInput.value) {
            passwordInput.setCustomValidity('Password is required');
            isValid = false;
        } else if (passwordInput.value.length < 6) {
            passwordInput.setCustomValidity('Password must be at least 6 characters long');
            isValid = false;
        } else {
            passwordInput.setCustomValidity('');
        }

        // Check password confirmation
        if (!validatePasswordMatch()) {
            isValid = false;
        }

        // Check terms agreement
        if (!agreeTermsCheckbox.checked) {
            agreeTermsCheckbox.setCustomValidity('You must agree to the terms');
            isValid = false;
        } else {
            agreeTermsCheckbox.setCustomValidity('');
        }

        return isValid;
    }

    /**
     * Handles the registration form submission
     *
     * @param {Event} event - The form submission event
     */
    async function handleRegister(event) {
        event.preventDefault();

        // Validate form
        if (!validateForm()) {
            // Show validation messages
            registerForm.classList.add('was-validated');
            return;
        }

        // Prepare form data
        const registerData = {
            username: usernameInput.value.trim(),
            password: passwordInput.value
        };

        try {
            // Send registration request
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registerData)
            });

            // Parse response
            const data = await response.json();

            if (response.ok) {
                // Registration successful
                console.log('Registration successful:', data);

                // Show success message
                alert('Registration successful! You can now log in.');

                // Redirect to login page
                window.location.href = 'log_in.html';
            } else {
                // Registration failed
                alert(data.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Error registering:', error);
            alert('An error occurred during registration. Please try again later.');
        }
    }

    /**
     * Initializes the registration form
     */
    function init() {
        // Check if user is already logged in
        const currentUser = localStorage.getItem('carMatchUser');
        if (currentUser) {
            // If already logged in, redirect to home page
            window.location.href = 'index.html';
            return;
        }

        // Set up event listeners
        passwordInput.addEventListener('input', validatePasswordMatch);
        passwordConfirmInput.addEventListener('input', validatePasswordMatch);
        registerButton.addEventListener('click', handleRegister);

        // Override default form submission
        registerForm.addEventListener('submit', handleRegister);
    }

    // Initialize the registration form
    init();
});