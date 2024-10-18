const map = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

const favorites = JSON.parse(localStorage.getItem('favorites')) || []; // Load favorites from localStorage

function saveFavoritesToLocalStorage() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

document.getElementById('save-favorite').addEventListener('click', () => {
    const center = map.getCenter();
    const locationName = prompt("Enter a name for this favorite:");
    if (locationName) {
        favorites.push({
            name: locationName,
            lat: center.lat,
            lng: center.lng
        });
        saveFavoritesToLocalStorage();
        alert('Location saved as favorite!');
    }
});

function renderFavorites() {
    const favoritesList = document.getElementById('favorites-list');
    favoritesList.innerHTML = ''; // Clear previous list
    favorites.forEach((fav, index) => {
        const favoriteItem = document.createElement('div');
        favoriteItem.className = 'favorite-item';
        favoriteItem.textContent = fav.name;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-button';
        deleteButton.onclick = (e) => {
            e.stopPropagation(); // Prevent triggering the item click
            favorites.splice(index, 1); // Remove favorite from array
            saveFavoritesToLocalStorage(); // Update localStorage
            favoritesList.removeChild(favoriteItem); // Remove item from the DOM
        };

        favoriteItem.appendChild(deleteButton);
        favoriteItem.addEventListener('click', () => {
            map.setView([fav.lat, fav.lng], 13);
            L.marker([fav.lat, fav.lng]).addTo(map)
                .bindPopup(fav.name)
                .openPopup();
        });

        favoritesList.appendChild(favoriteItem);
    });
    favoritesList.style.display = favoritesList.style.display === 'block' ? 'none' : 'block';
}

document.getElementById('favorites-button').addEventListener('click', renderFavorites);

document.getElementById('search-button').addEventListener('click', async () => {
    const query = document.getElementById('search-input').value;
    if (!query) return;

    document.getElementById('results-container').innerHTML = ''; // Clear previous results

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const results = await response.json();

        results.forEach(result => {
            const resultDiv = document.createElement('div');
            resultDiv.textContent = result.display_name;
            resultDiv.className = 'result-item';

            resultDiv.addEventListener('click', () => {
                const { lat, lon } = result;
                map.setView([lat, lon], 13);
                L.marker([lat, lon]).addTo(map)
                    .bindPopup(result.display_name)
                    .openPopup();
                document.getElementById('results-container').innerHTML = ''; // Clear results after selection
            });

            document.getElementById('results-container').appendChild(resultDiv);
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('An error occurred while searching.');
    }
});

// Load favorites on page load
if (favorites.length > 0) {
    renderFavorites();
}
