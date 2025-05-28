// frontend/js/profile.js

/**
 * CarMatch Profile Page Handler
 *
 * This script manages the user profile page functionality:
 * - Loads current user data
 * - Handles profile updates
 * - Validates form input
 * - Manages password changes
 */
document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const profileForm = document.querySelector('.needs-validation');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('passwordConfirm');
    const saveButton = document.getElementById('save-profile-btn'); // Fixed selector

    // API endpoints
    const API_BASE_URL = 'http://localhost:3000/api';
    const PROFILE_API_URL = `${API_BASE_URL}/auth/profile`;
    const UPDATE_API_URL = `${API_BASE_URL}/auth/update-profile`;

    // Current user data
    let currentUser = null;

    /**
     * Checks if user is logged in and redirects if not
     */
    function checkAuthentication() {
        console.log('Checking authentication...');

        const userData = localStorage.getItem('carMatchUser');
        console.log('User data from localStorage:', userData);

        if (!userData) {
            console.log('No user data found, redirecting to login');
            alert('Please log in to access your profile');
            window.location.href = 'log_in.html';
            return false;
        }

        try {
            currentUser = JSON.parse(userData);
            console.log('Successfully parsed user data:', currentUser);
            return true;
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('carMatchUser');
            window.location.href = 'log_in.html';
            return false;
        }
    }

    /**
     * Loads user profile data into the form
     */
    function loadProfileData() {
        if (currentUser) {
            usernameInput.value = currentUser.username;
            // Don't pre-fill password fields for security
            passwordInput.value = '';
            passwordConfirmInput.value = '';
        }
    }

    /**
     * Validates that passwords match
     *
     * @returns {boolean} - True if passwords match, false otherwise
     */
    function validatePasswordMatch() {
        if (passwordInput.value !== passwordConfirmInput.value) {
            passwordConfirmInput.setCustomValidity('Passwords do not match');
            document.getElementById('passwordConfirmFeedback').textContent = 'Lösenorden matchar inte.';
            return false;
        } else {
            passwordConfirmInput.setCustomValidity('');
            return true;
        }
    }

    /**
     * Validates the entire profile form
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

        // Check password (only if provided)
        if (passwordInput.value) {
            if (passwordInput.value.length < 6) { // Fixed: was missing .length
                passwordInput.setCustomValidity('Password must be at least 6 characters long');
                isValid = false;
            } else {
                passwordInput.setCustomValidity('');
            }

            // Check password confirmation
            if (!validatePasswordMatch()) {
                isValid = false;
            }
        } else {
            // If no password provided, clear any validation errors
            passwordInput.setCustomValidity('');
            passwordConfirmInput.setCustomValidity('');
        }

        return isValid;
    }

    /**
     * Handles the profile form submission
     *
     * @param {Event} event - The form submission event
     */
    async function handleProfileUpdate(event) {
        event.preventDefault();

        // Validate form
        if (!validateForm()) {
            profileForm.classList.add('was-validated');
            return;
        }

        // Prepare update data
        const updateData = {
            username: usernameInput.value.trim()
        };

        // Only include password if it's being changed
        if (passwordInput.value) {
            updateData.password = passwordInput.value;
        }

        try {
            // Send update request
            const response = await fetch(UPDATE_API_URL, {
                method: 'PUT', // Fixed: was POST, should be PUT
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.id}`
                },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            if (response.ok) {
                // Update successful
                console.log('Profile updated successfully:', data);

                // Update stored user data
                const updatedUser = {
                    ...currentUser,
                    username: updateData.username
                };
                localStorage.setItem('carMatchUser', JSON.stringify(updatedUser));
                currentUser = updatedUser;

                // Show success message
                alert('Profile updated successfully!');

                // Clear password fields for security
                passwordInput.value = '';
                passwordConfirmInput.value = '';

                // Remove validation classes
                profileForm.classList.remove('was-validated');

            } else {
                // Update failed
                alert(data.message || 'Failed to update profile. Please try again.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('An error occurred while updating your profile. Please try again later.');
        }
    }

    /**
     * Initializes the profile page
     */
    function init() {
        // Check authentication first
        if (!checkAuthentication()) {
            return;
        }

        // Load profile data
        loadProfileData();

        // Set up event listeners
        passwordInput.addEventListener('input', validatePasswordMatch);
        passwordConfirmInput.addEventListener('input', validatePasswordMatch);

        // Handle save button click
        if (saveButton) {
            saveButton.addEventListener('click', function(e) {
                e.preventDefault();
                handleProfileUpdate(e);
            });
        } else {
            console.error('Save button not found!');
        }

        // Override form submission
        profileForm.addEventListener('submit', handleProfileUpdate);

        console.log('Profile page initialized for user:', currentUser.username);
    }

    // Initialize the profile page
    init();
});