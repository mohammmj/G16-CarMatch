    console.log('Loading reviews inline...');

    const ReviewsAPI = {
    baseURL: 'http://localhost:3000/api/review',

    getToken() {
    const user = JSON.parse(localStorage.getItem('carMatchUser') || '{}');
    return user.id ? `Bearer ${user.id}` : null;
},

    // Skapa recensione
    async createReview(carId, rating, title, comment) {
    const token = this.getToken();
    if (!token) throw new Error('Du måste vara inloggad');

    const response = await fetch(this.baseURL, {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json',
    'Authorization': token
},
    body: JSON.stringify({ carId, rating, title, comment })
});

    return await response.json();
},

    // Hämta recensionerna
    async getReviews(carId) {
    const response = await fetch(`${this.baseURL}/car/${carId}`);
    console.log('Response status:', response.status);
    return await response.json();
}
};

    const ReviewsUI = {
    // Visa recensioner för en bil
    async showReviews(carId, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = 'Laddar...';

    try {
    const url = `${ReviewsAPI.baseURL}/car/${carId}`;
    console.log('Fetching reviews from:', url); // LÄGG TILL DENNA RAD

    const data = await ReviewsAPI.getReviews(carId);
    const reviews = data.reviews || []; // ÄNDRAT - hanterar om reviews är undefined

    let html = `<h3>Recensioner (${reviews.length})</h3>`; // ÄNDRAT

    // Visa formulär om inloggad
    const user = JSON.parse(localStorage.getItem('carMatchUser') || '{}');
    if (user.id) {
    html += this.createForm(carId);
}

    // Visa recensioner
    if (reviews.length === 0) {
    html += '<p>Inga recensioner än.</p>';
} else {
    reviews.forEach(review => {
    html += this.createReviewHTML(review);
});
}

    container.innerHTML = html;
} catch (error) {
    console.error('Error loading reviews:', error);
    container.innerHTML = `<p>Fel: ${error.message}</p>`;
}
},

    // Skapa formuläret
    createForm(carId) {
    return `
            <div style="background: #f8f9fa; padding: 15px; margin: 15px 0; border-radius: 5px;">
                <h4>Skriv recension</h4>
                <form onsubmit="ReviewsUI.submitReview(event, ${carId})">
                    <div>
                        <label>Betyg:</label>
                        <select name="rating" required>
                            <option value="">Välj betyg</option>
                            <option value="1">⭐ 1 stjärna</option>
                            <option value="2">⭐⭐ 2 stjärnor</option>
                            <option value="3">⭐⭐⭐ 3 stjärnor</option>
                            <option value="4">⭐⭐⭐⭐ 4 stjärnor</option>
                            <option value="5">⭐⭐⭐⭐⭐ 5 stjärnor</option>
                        </select>
                    </div>
                    <div style="margin: 10px 0;">
                        <label>Titel:</label>
                        <input type="text" name="title" required placeholder="T.ex. Bra bil!" style="width: 100%;">
                    </div>
                    <div style="margin: 10px 0;">
                        <label>Kommentar:</label>
                        <textarea name="comment" placeholder="Skriv din upplevelse..." style="width: 100%; height: 60px;"></textarea>
                    </div>
                    <button type="submit" style="background: #007bff; color: white; padding: 8px 15px; border: none; border-radius: 3px;">Skicka</button>
                </form>
            </div>
        `;
},

    // Skapa HTML för en recension
    createReviewHTML(review) {
    const stars = '⭐'.repeat(review.rating);
    const date = new Date(review.created_at).toLocaleDateString('sv-SE');

    return `
            <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px;">
                <div style="display: flex; justify-content: space-between;">
                    <strong>${review.username}</strong>
                    <span>${date}</span>
                </div>
                <div>${stars} ${review.rating}/5</div>
                <h5>${review.title}</h5>
                ${review.comment ? `<p>${review.comment}</p>` : ''}
            </div>
        `;
},

    // Skicka recensionen
    async submitReview(event, carId) {
    event.preventDefault();

    const form = event.target;
    const rating = form.rating.value;
    const title = form.title.value;
    const comment = form.comment.value;

    try {
    await ReviewsAPI.createReview(carId, rating, title, comment);
    alert('Recension skickad!');
    this.showReviews(carId, `reviews-container-${carId}`); // ÄNDRAT - använd rätt container ID
} catch (error) {
    alert('Fel: ' + error.message);
}
}
};

    console.log('ReviewsUI loaded:', window.ReviewsUI);

    window.ReviewsUI = ReviewsUI;
    console.log('ReviewsUI loaded:', window.ReviewsUI);
