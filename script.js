// Initialize Firebase
const firebaseConfig = {
 apiKey: "AIzaSyANy4eUYrkCg-WIKd8aYbDehoxLXeWo8w",
 authDomain: "loci-ldn.firebaseapp.com",
 projectId: "loci-ldn",
 storageBucket: "loci-ldn.appspot.com",
 messagingSenderId: "41724768309",
 appId: "1:41724768309:web:44be011f074d75041cc17c",
 measurementId: "G-KZ3H3L6K2Y"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
// Map setup
const map = L.map('map').setView([51.5074, -0.1278], 12);
// Greater London boundary (rough polygon)
const greaterLondonBounds = L.polygon([
 [51.7342, -0.5103],
 [51.6747, 0.2156],
 [51.3827, 0.1753],
 [51.2871, -0.1911],
 [51.3820, -0.4417],
 [51.6472, -0.4727]
]);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
 attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>, OpenStreetMap contributors',
 subdomains: 'abcd',
 maxZoom: 19
}).addTo(map);
// Custom star icon
const customIcon = L.icon({
 iconUrl: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png',
 iconSize: [30, 30],
 iconAnchor: [15, 30],
 popupAnchor: [0, -30]
});
function getEmbedHTML(songLink) {
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
 return embedHTML;
}
// Load existing markers
db.collection("memories").get().then(snapshot => {
 snapshot.forEach(doc => {
   const data = doc.data();
   createMarker(data.lat, data.lng, data.memory, data.songLink);
 });
});
// Map click
map.on('click', function (e) {
 const lat = e.latlng.lat;
 const lng = e.latlng.lng;
 if (greaterLondonBounds.getBounds().contains([lat, lng])) {
   const popupContent = `
<div style="width: 260px; max-width: 90vw; font-family: 'Courier New', monospace; font-size: 14px;">
<strong>Memory at this place:</strong><br>
<textarea id="memory" rows="4" cols="30" placeholder="write your memory..." style="width: 100%; margin-top: 6px; padding: 4px;"></textarea>
<input type="text" id="songLink" placeholder="Paste Spotify or YouTube link" style="width: 100%; margin-top: 6px; padding: 4px;">
<br><br>
<button onclick="addMemory(${lat}, ${lng})" style="margin-top: 6px; background: #fff; border: 1px dotted #000; padding: 6px 12px; font-family: 'Courier New';">Add</button>
</div>
   `;
   L.popup().setLatLng([lat, lng]).setContent(popupContent).openOn(map);
 } else {
   alert("Sorry, this map only accepts locations within Greater London.");
 }
});
// Add memory
function addMemory(lat, lng) {
 const memory = document.getElementById('memory').value;
 const songLink = document.getElementById('songLink').value;
 if (!memory) {
   alert("Please write a memory before submitting.");
   return;
 }
 db.collection("memories").add({ lat, lng, memory, songLink }).then(() => {
   createMarker(lat, lng, memory, songLink);
   map.closePopup();
   const confirmation = L.popup({ closeButton: false, autoClose: true })
     .setLatLng([lat, lng])
     .setContent("<strong>✓ Added!</strong>")
     .openOn(map);
   setTimeout(() => {
     map.closePopup();
   }, 1500);
 }).catch((error) => {
   console.error("Error adding document: ", error);
 });
}
// Create styled marker and embed player
function createMarker(lat, lng, memory, songLink) {
 let embedHTML = "";
 if (songLink.includes("youtube.com") || songLink.includes("youtu.be")) {
   const videoId = songLink.includes("youtu.be")
     ? songLink.split("youtu.be/")[1]
     : songLink.split("v=")[1]?.split("&")[0];
   if (videoId) {
     embedHTML = `
<div style="border: 1px dotted #222; padding: 6px; background: #fff; margin-top: 6px;">
<iframe width="230" height="130" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
</div>`;
   }
 } else if (songLink.includes("spotify.com")) {
   const match = songLink.match(/track\/([a-zA-Z0-9]+)/);
   if (match) {
     embedHTML = `
<div style="border: 1px dotted #222; padding: 6px; background: #fff; margin-top: 6px;">
<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/${match[1]}" width="230" height="80" frameborder="0" allow="encrypted-media"></iframe>
</div>`;
   }
 }
 const finalPopup = `
<div style="font-family: 'Courier New', monospace; font-size: 14px; max-width: 250px;">
<p>${memory}</p>
     ${embedHTML}
</div>`;
 L.marker([lat, lng], { icon: customIcon })
   .addTo(map)
   .bindPopup(finalPopup);
}
// Help box toggle
document.addEventListener("DOMContentLoaded", function () {
 const helpButton = document.getElementById("help-button");
 const helpBox = document.getElementById("help-box");
 helpButton.addEventListener("click", function (e) {
   e.stopPropagation();
   helpBox.style.display = helpBox.style.display === "block" ? "none" : "block";
 });
 document.addEventListener("click", function (e) {
   if (!helpBox.contains(e.target) && e.target !== helpButton) {
     helpBox.style.display = "none";
   }
 });
});
// Dismiss intro overlay
document.addEventListener('click', () => {
 const overlay = document.getElementById('introOverlay');
 if (overlay) overlay.style.display = 'none';
}, { once: true });
document.getElementById('shuffleBtn').addEventListener('click', () => {
 db.collection("memories").get().then(snapshot => {
   const allDocs = snapshot.docs;
   if (allDocs.length === 0) {
     alert("no memories to shuffle yet!");
     return;
   }
   const randomDoc = allDocs[Math.floor(Math.random() * allDocs.length)];
   const data = randomDoc.data();
   map.setView([data.lat, data.lng], 14);
   const tempMarker = L.marker([data.lat, data.lng], { icon: customIcon })
     .addTo(map)
     .bindPopup(`<div style="font-family: 'Courier New'; font-size: 14px; max-width: 250px;">
<p>${data.memory}</p>
       ${getEmbedHTML(data.songLink)}
</div>`)
     .openPopup();
   // Remove the marker after a few seconds so it doesn’t clutter
   setTimeout(() => map.removeLayer(tempMarker), 5000);
 });
});
