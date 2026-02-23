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

// Greater London boundary
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

// star icon
const customIcon = L.icon({
iconUrl: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png',
iconSize: [30, 30],
iconAnchor: [15, 30],
popupAnchor: [0, -30]
});
// --- normalise spotify ---
function normaliseSongLink(link) {
 if (!link) return "";
 // Fix Spotify regional / share variations
 link = link.replace("open.spotify.com/intl-en/", "open.spotify.com/");
 link = link.replace("open.spotify.com/", "https://open.spotify.com/");
 // Fix Apple Music embed prefix
 if (link.includes("music.apple.com") && !link.includes("embed.music.apple.com")) {
   link = link.replace("music.apple.com", "embed.music.apple.com");
 }
 // default to uk 
 if (link.includes("embed.music.apple.com/") && !/embed\.music\.apple\.com\/[a-z]{2}\//.test(link)) {
   link = link.replace("embed.music.apple.com/", "embed.music.apple.com/gb/");
 }
 return link;
}
// embed
function getEmbedHTML(songLink) {
if (!songLink) return "";

songLink = normaliseSongLink(songLink);
  
let embedHTML = "";

// YouTube
if (songLink.includes("youtube.com") || songLink.includes("youtu.be")) {
const videoId = songLink.includes("youtu.be")
? songLink.split("youtu.be/")[1].split("?")[0]
: new URL(songLink).searchParams.get("v");
embedHTML = `<iframe width="230" height="130" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;

// Spotify
} else if (songLink.includes("spotify.com")) {
   const match = songLink.match(/track\/([a-zA-Z0-9]+)/);
   if (match) {
       embedHTML = `<iframe
           src="https://open.spotify.com/embed/track/${match[1]}"
           width="100%" height="80" style="border-radius:12px; max-width:230px; overflow:hidden;"
           frameborder="0"
           allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture">
</iframe>`;
   }

// SoundCloud
} else if (songLink.includes("soundcloud.com")) {
embedHTML = `<iframe width="100%" height="166" scrolling="no" frameborder="no"
src="https://w.soundcloud.com/player/?url=${encodeURIComponent(songLink)}&color=%230066cc&inverse=false&auto_play=false&show_user=true"></iframe>`;

// Apple Music
} else if (songLink.includes("music.apple.com")) {
const parts = songLink.split("/id");
const songId = parts[1]?.split("?")[0];
if (songId) {
embedHTML = `<iframe allow="autoplay *; encrypted-media *;" frameborder="0" height="150" style="width:100%;max-width:660px;overflow:hidden;background:transparent;"
sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
src="https://embed.music.apple.com/us/song/${songId}"></iframe>`;
}
}

return embedHTML;
}

// load existing markers
db.collection("memories").get().then(snapshot => {
snapshot.forEach(doc => {
const data = doc.data();
createMarker(data.lat, data.lng, data.memory, data.songLink);
});
});

// map click
map.on('click', function (e) {
const lat = e.latlng.lat;
const lng = e.latlng.lng;

if (greaterLondonBounds.getBounds().contains([lat, lng])) {
const popupContent = `
<div style="width: 260px; max-width: 90vw; font-family: 'Courier New', monospace; font-size: 14px;">
<strong>Memory at this place:</strong><br>
<textarea id="memory" rows="4" cols="30" placeholder="write your memory..." style="width: 100%; margin-top: 6px; padding: 4px;"></textarea>
<input type="text" id="songLink" placeholder="Paste YouTube, Spotify, SoundCloud or Apple Music link" style="width: 100%; margin-top: 6px; padding: 4px;">

<br><br>
<button onclick="addMemory(${lat}, ${lng})" style="margin-top: 6px; background: #fff; border: 1px dotted #000; padding: 6px 12px; font-family: 'Courier New';">Add</button>
</div>
`;
L.popup().setLatLng([lat, lng]).setContent(popupContent).openOn(map);
} else {
alert("Sorry, this map only accepts locations within Greater London.");
}
});

// memory
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

// styled marker and player embedding
function createMarker(lat, lng, memory, songLink) {
const embedHTML = getEmbedHTML(songLink);

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

// Shuffle button 
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
setTimeout(() => map.removeLayer(tempMarker), 5000);
});
});
