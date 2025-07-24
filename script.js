const map = L.map('map').setView([51.5074, -0.1278], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
 attribution: '© OpenStreetMap contributors'
}).addTo(map);
map.on('click', function(e) {
 const lat = e.latlng.lat.toFixed(5);
 const lng = e.latlng.lng.toFixed(5);
 const popupContent = `
<div style="font-family: 'Georgia', serif; max-width: 250px;">
<strong>Memory at this place:</strong><br>
<textarea id="memory" rows="3" cols="28" placeholder="Write your memory..." style="margin-top: 5px;"></textarea><br>
<input type="text" id="songLink" placeholder="Paste Spotify or YouTube link" style="width: 95%; margin-top: 5px;"><br>
<button onclick="addMemory(${lat}, ${lng})" style="margin-top: 8px;">Add</button>
</div>
 `;
 L.popup()
   .setLatLng([lat, lng])
   .setContent(popupContent)
   .openOn(map);
});
// Add marker with embedded media
function addMemory(lat, lng) {
 const memory = document.getElementById("memory").value;
 const songLink = document.getElementById("songLink").value;
 let embedHTML = "";
 if (songLink.includes("youtube.com") || songLink.includes("youtu.be")) {
   const videoId = songLink.includes("youtu.be")
     ? songLink.split("youtu.be/")[1]
     : songLink.split("v=")[1]?.split("&")[0];
   if (videoId) {
     embedHTML = `<iframe width="230" height="130" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
   }
 } else if (songLink.includes("spotify.com")) {
   const match = songLink.match(/track\/([a-zA-Z0-9]+)/);
   if (match) {
     embedHTML = `<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/${match[1]}" width="230" height="80" frameborder="0" allow="encrypted-media"></iframe>`;
   }
 }
 const finalPopup = `
<div style="font-family: 'Georgia', serif; font-size: 14px; max-width: 250px;">
<p>${memory}</p>
     ${embedHTML}
</div>
 `;
 L.marker([lat, lng])
   .addTo(map)
   .bindPopup(finalPopup)
   .openPopup();
}
