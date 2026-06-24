/**
 * PropSpace Cameroon - Client-Side Interactive Logic
 * Vanilla JavaScript implementation for searching, calculations, and interactions.
 */

// Format numbers nicely in FCFA
function formatFCFA(value) {
    return new Intl.NumberFormat('fr-FR').format(value) + ' FCFA';
}

// Interactive Loan & Rent Fee Calculator
function calculateFees() {
    const amountInput = document.getElementById('calc-amount');
    const amount = parseFloat(amountInput.value) || 0;

    // Standard Cameroon agency fee is usually 10%
    const agencyFee = amount * 0.10;
    // Standard registration/fiscal tax estimate is 5%
    const taxFee = amount * 0.05;
    // Total sum
    const total = amount + agencyFee + taxFee;

    // Render results back to the interface
    document.getElementById('fee-agency').innerText = formatFCFA(agencyFee);
    document.getElementById('fee-tax').innerText = formatFCFA(taxFee);
    document.getElementById('fee-total').innerText = formatFCFA(total);
}

// Simulate Property Filtering
function simulateSearch() {
    const selectedCity = document.getElementById('search-location').value;
    const selectedType = document.getElementById('search-type').value;
    const maxPrice = parseFloat(document.getElementById('search-price').value) || Infinity;

    const cards = document.querySelectorAll('.listing-card');
    let visibleCount = 0;

    cards.forEach(card => {
        const city = card.getAttribute('data-city');
        const type = card.getAttribute('data-type');
        const price = parseFloat(card.getAttribute('data-price')) || 0;

        const matchesCity = !selectedCity || city === selectedCity;
        const matchesType = !selectedType || type === selectedType;
        const matchesPrice = price <= maxPrice;

        if (matchesCity && matchesType && matchesPrice) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    console.log(`Filtered properties. Showing ${visibleCount} of ${cards.length} matching your criteria.`);
}

// Handle Static Contact Form Submission
function handleContactSubmit(event) {
    event.preventDefault();
    
    const form = document.getElementById('static-contact-form');
    const successDiv = document.getElementById('contact-success');

    // Simulate database write or submission
    form.style.display = 'none';
    successDiv.style.display = 'block';

    console.log("Contact form submitted successfully in static-fallback mode.");
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    // Initial fee calculation based on default value
    calculateFees();
    console.log("PropSpace static preview engine initialized successfully.");
});
