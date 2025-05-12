// frontend/js/login.js

/**
 * CarMatch Login Handler
 *
 * This script manages the login form:
 * - Validates login credentials
 * - Sends login requests to the API
 * - Handles login success/failure
 * - Manages user session
 */
document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const loginForm = document.getElementById('form_login');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginButton = document.querySelector('#form_login .btn-success');

    // API endpoint
    const API_URL = 'http://localhost:3000/api/auth/login';

    /**
     * Validates the login form before submission
     *
     * @returns {boolean} True if form is valid, false otherwise
     */
    function validateForm() {
        let isValid = true;

        // Check username
        if (!usernameInput.value.trim()) {
            alert('Please enter your username');
            usernameInput.focus();
            isValid = false;
        }

        // Check password
        if (isValid && !passwordInput.value) {
            alert('Please enter your password');
            passwordInput.focus();
            isValid = false;
        }

        return isValid;
    }

    /**
     * Handles the login form submission
     *
     * @param {Event} event - The form submission event
     */
    async function handleLogin(event) {
        event.preventDefault();

        // Validate form
        if (!validateForm()) {
            return;
        }

        // Prepare form data
        const loginData = {
            username: usernameInput.value.trim(),
            password: passwordInput.value
        };

        try {
            // Send login request
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            // Parse response
            const data = await response.json();

            if (response.ok) {
                // Login successful
                console.log('Login successful:', data);

                // Save user data to localStorage
                localStorage.setItem('carMatchUser', JSON.stringify(data.user));

                // Redirect to home page
                window.location.href = 'index.html';
            } else {
                // Login failed
                alert(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Error logging in:', error);
            alert('An error occurred while logging in. Please try again later.');
        }
    }

    /**
     * Initializes the login form
     */
    function init() {
        // Check if user is already logged in
        const currentUser = localStorage.getItem('carMatchUser');
        if (currentUser) {
            // If already logged in, redirect to home page
            window.location.href = 'index.html';
            return;
        }

        // Set up event listener for login button
        loginButton.addEventListener('click', handleLogin);

        // Enable form submission with Enter key
        loginForm.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleLogin(e);
            }
        });
    }

    // Initialize the login form
    init();
});