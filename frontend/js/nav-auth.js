// frontend/js/nav-auth.js

/**
 * Navigation Bar Authentication Handler
 *
 * This script manages the navigation bar elements based on user authentication status:
 * - Shows login/register links for unauthenticated users
 * - Shows logout and user-specific links for authenticated users
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

        // Add username display
        const usernameLi = document.createElement('li');
        const usernameLink = document.createElement('a');
        usernameLink.href = '#';
        usernameLink.textContent = `Welcome, ${user.username}`;
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
     * Handles user logout
     *
     * @param {Event} event - The click event
     */
    function handleLogout(event) {
        event.preventDefault();

        // Clear user data from localStorage
        localStorage.removeItem('carMatchUser');

        // Redirect to home page
        window.location.href = 'index.html';
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