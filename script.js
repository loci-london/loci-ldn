const map = L.map('map').setView([51.5074, -0.1278], 12);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
 attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>, OpenStreetMap contributors',
 subdomains: 'abcd',
 maxZoom: 19
}).addTo(map);
// Custom blue marker
const customIcon = L.icon({
 iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
 shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
 iconSize: [25, 41],
 iconAnchor: [12, 41],
 popupAnchor: [1, -34],
 shadowSize: [41, 41]
});
map.on('click', function (e) {
 const lat = e.latlng.lat.toFixed(5);
 const lng = e.latlng.lng.toFixed(5);
 const popupContent = `
<div>
<strong>Memory at this place:</strong><br>
<textarea id="memory" rows="3" cols="28" placeholder="Write your memory..."></textarea><br>
<input type="text" id="songLink" placeholder="Paste Spotify or YouTube link"><br>
<button onclick="addMemory(${lat}, ${lng})">Add</button>
</div>`;
 L.popup()
   .setLatLng([lat, lng])
   .setContent(popupContent)
   .openOn(map);
});
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
<div style="font-family: 'Georgia', serif; font-size: 14px;">
<p>${memory}</p>
     ${embedHTML}
</div>`;
 L.marker([lat, lng], { icon: customIcon })
   .addTo(map)
   .bindPopup(finalPopup)
   .openPopup();
}
