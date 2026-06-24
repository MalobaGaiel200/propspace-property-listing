
function formatFCFA(value) {
    return new Intl.NumberFormat('fr-FR').format(value) + ' FCFA';
}


function calculateFees() {
    const amountInput = document.getElementById('calc-amount');
    const amount = parseFloat(amountInput.value) || 0;

   
    const agencyFee = amount * 0.10;
  
    const taxFee = amount * 0.05;
    // Total sum
    const total = amount + agencyFee + taxFee;

    // Render results back to the interface
    document.getElementById('fee-agency').innerText = formatFCFA(agencyFee);
    document.getElementById('fee-tax').innerText = formatFCFA(taxFee);
    document.getElementById('fee-total').innerText = formatFCFA(total);
}


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


function handleContactSubmit(event) {
    event.preventDefault();
    
    const form = document.getElementById('static-contact-form');
    const successDiv = document.getElementById('contact-success');

 
    form.style.display = 'none';
    successDiv.style.display = 'block';

    console.log("Contact form submitted successfully in static-fallback mode.");
}


window.addEventListener('DOMContentLoaded', () => {
    
    calculateFees();
    console.log("PropSpace static preview engine initialized successfully.");
});
