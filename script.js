// Create the map and center it on London
const map = L.map('map').setView([51.5074, -0.1278], 12); // London coords
// Add the tile layer (map visuals)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
 attribution: '© OpenStreetMap contributors'
}).addTo(map);
// When a user clicks on the map, show a popup to collect memory + song
map.on('click', function (e) {
 const lat = e.latlng.lat.toFixed(5);
 const lng = e.latlng.lng.toFixed(5);
 const popupContent = `
<div style="font-family: sans-serif;">
<strong>Memory at this place:</strong><br>
<textarea rows="3" cols="30" placeholder="Write your memory..." style="margin-top: 5px;"></textarea><br>
<input type="text" placeholder="Song link (Spotify/YouTube)" style="width: 95%; margin-top: 5px;"><br>
<button onclick="alert('Saving not active yet — coming soon!')" style="margin-top: 5px;">Save</button>
</div>
 `;
 L.marker([lat, lng]).addTo(map)
   .bindPopup(popupContent)
   .openPopup();
});
