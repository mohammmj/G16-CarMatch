// frontend/js/nav-auth.js

/**
 * Navigation Bar Authentication Handler
 *
 * This script manages the navigation bar elements based on user authentication status:
 * - Shows login/register links for unauthenticated users
 * - Shows logout and user-specific links for authenticated users
 * - Handles profile page navigation
 */
document.addEventListener('DOMContentLoaded', function() {
    // Navigation elements
    const navList = document.querySelector('header nav ul');

    /**
     * Updates the navigation bar based on login status
     */
    function updateNavigation() {
        // Check if user is logged in
        const currentUser = localStorage.getItem('carMatchUser');

        if (currentUser) {
            // User is logged in
            const userObj = JSON.parse(currentUser);
            updateNavForLoggedInUser(userObj);
        } else {
            // User is not logged in, keep default navigation
            // Nothing to do as the default HTML already has login/register links
        }
    }

    /**
     * Updates navigation for logged in users
     *
     * @param {Object} user - The logged in user object
     */
    function updateNavForLoggedInUser(user) {
        // Replace login/register links with user menu and logout
        // First, save the Home link
        const homeLink = navList.querySelector('li:first-child');

        // Clear the navigation list
        navList.innerHTML = '';

        // Add back the Home link
        navList.appendChild(homeLink);

        // Add username display with profile link
        const usernameLi = document.createElement('li');
        const usernameLink = document.createElement('a');
        usernameLink.href = 'profile.html';
        usernameLink.textContent = `Welcome, ${user.username}`;
        usernameLink.title = 'View Profile';
        usernameLink.style.cursor = 'pointer';

        // Add click handler for profile navigation
        usernameLink.addEventListener('click', handleProfileClick);

        usernameLi.appendChild(usernameLink);
        navList.appendChild(usernameLi);

        // Add logout link
        const logoutLi = document.createElement('li');
        const logoutLink = document.createElement('a');
        logoutLink.href = '#';
        logoutLink.textContent = 'Logout';
        logoutLink.addEventListener('click', handleLogout);
        logoutLi.appendChild(logoutLink);
        navList.appendChild(logoutLi);
    }

    /**
     * Handles profile link click
     *
     * @param {Event} event - The click event
     */
    function handleProfileClick(event) {
        console.log('Profile link clicked');
        event.preventDefault();

        // Check if user is still logged in
        const currentUser = localStorage.getItem('carMatchUser');
        console.log('Current user data:', currentUser);

        if (!currentUser) {
            console.log('No user found, redirecting to login');
            alert('Please log in to access your profile');
            window.location.href = 'log_in.html';
            return;
        }

        console.log('Navigating to profile page');
        // Navigate to profile page
        window.location.href = 'profile.html';
    }

    /**
     * Handles user logout
     *
     * @param {Event} event - The click event
     */
    function handleLogout(event) {
        event.preventDefault();

        // Confirm logout
        if (confirm('Are you sure you want to log out?')) {
            // Clear user data from localStorage
            localStorage.removeItem('carMatchUser');

            // Show logout message
            alert('You have been logged out successfully');

            // Redirect to home page
            window.location.href = 'index.html';
        }
    }

    /**
     * Initializes the navigation authentication handler
     */
    function init() {
        updateNavigation();
    }

    // Initialize
    init();
});