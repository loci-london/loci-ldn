// Firebase config
const firebaseConfig = {
 apiKey: "AIzaSyANy4eUYrkCg-WIKd8aYbDehoxLXeWo8w",
 authDomain: "loci-ldn.firebaseapp.com",
 projectId: "loci-ldn",
 storageBucket: "loci-ldn.appspot.com",
 messagingSenderId: "41724768309",
 appId: "1:41724768309:web:44be011f074d75041cc17c",
 measurementId: "G-KZ3H3L6K2Y"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
// Map setup
const map = L.map('map').setView([51.5074, -0.1278], 12);
db.collection("memories").get().then(snapshot => {
 snapshot.forEach(doc => {
   const data = doc.data();
   createMarker(data.lat, data.lng, data.memory, data.songLink);
 });
});
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
 attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>, OpenStreetMap contributors',
 subdomains: 'abcd',
 maxZoom: 19
}).addTo(map);
// Starburst-style black icon
const customIcon = L.icon({
 iconUrl: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png',
 iconSize: [30, 30],
 iconAnchor: [15, 30],
 popupAnchor: [0, -30]
});
map.on('click', function (e) {
 const lat = e.latlng.lat.toFixed(5);
 const lng = e.latlng.lng.toFixed(5);
 const popupContent = `
<div style="width: 260px; max-width: 90vw; font-family: 'Courier New', monospace; font-size: 14px;">
<strong>Memory at this place:</strong><br>
<textarea id="memory" rows="4" cols="30" placeholder="Write your memory..." style="width: 100%; margin-top: 6px; padding: 4px;"></textarea><br>
<input type="text" id="songLink" placeholder="Paste Spotify or YouTube link" style="width: 100%; margin-top: 6px; padding: 4px;"><br>
<button onclick="addMemory(${lat}, ${lng})" style="margin-top: 8px;">Add</button>
</div>
`;
 L.popup()
   .setLatLng([lat, lng])
   .setContent(popupContent)
   .openOn(map);
});
function addMemory(lat, lng) {
 const memory = document.getElementById("memory").value;
 const songLink = document.getElementById("songLink").value;
 db.collection("memories").add({
   lat,
   lng,
   memory,
   songLink
 });
 createMarker(lat, lng, memory, songLink);
}
function createMarker(lat, lng, memory, songLink) {
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
<div style="font-family: 'Courier New', monospace; font-size: 14px; max-width: 250px;">
<p>${memory}</p>
     ${embedHTML}
</div>
 `;
 L.marker([lat, lng], { icon: customIcon })
   .addTo(map)
   .bindPopup(finalPopup);
}
