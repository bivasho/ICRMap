let map;
let markers = [];

const greenIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const greyIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function initMap() {
  map = L.map('map', {
    center: [-34.9285, 138.6007],
    zoom: 7,
    zoomAnimation: true,
    fadeAnimation: true,
    doubleClickZoom: true,
    zoomControl: true,
    inertia: true,
    markerZoomAnimation: true
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  loadProperties(); // Load and show markers
}

function loadProperties() {
  fetch('data/properties.json')
    .then(res => res.json())
    .then(properties => {
      const states = new Set();
      const types = new Set();

      properties.forEach(p => {
        states.add(p.state);
        types.add(p.propertyType);
      });

      populateFilter('stateFilter', [...states]);
      populateFilter('typeFilter', [...types]);

      displayMarkers(properties);

      document.getElementById('stateFilter').addEventListener('change', () => filterMarkers(properties));
      document.getElementById('typeFilter').addEventListener('change', () => filterMarkers(properties));
    });
}

function populateFilter(selectId, options) {
  const select = document.getElementById(selectId);
  options.sort().forEach(opt => {
    const option = document.createElement('option');
    option.value = opt;
    option.text = opt;
    select.appendChild(option);
  });
}

function displayMarkers(properties) {
  clearMarkers();
  properties.forEach(p => {
    const marker = L.marker([p.latitude, p.longitude], { icon: greenIcon }).addTo(map);

    marker.bindPopup(`<strong>${p.propertyName}</strong><br>${p.propertyType}`);

    marker.on('click', () => {
      marker.setIcon(greyIcon);
      map.setView([p.latitude, p.longitude], 15, { animate: true });
      showDetails(p);
    });

    markers.push(marker);
  });
}

function clearMarkers() {
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];
}

function filterMarkers(properties) {
  const selectedState = document.getElementById('stateFilter').value;
  const selectedType = document.getElementById('typeFilter').value;

  const filtered = properties.filter(p =>
    (!selectedState || p.state === selectedState) &&
    (!selectedType || p.propertyType === selectedType)
  );

  displayMarkers(filtered);
}

function showDetails(p) {
  const html = `
    <h3>${p.propertyName}</h3>
    <p><strong>Type:</strong> ${p.propertyType}</p>
    <p><strong>Address:</strong> ${p.propertyAddress}, ${p.propertySuburb}, ${p.state} ${p.propertyPostCode}</p>
    <p><strong>Booking Email:</strong> ${p.emailForBooking}</p>
    <p><strong>Contact:</strong> ${p.contactNumber}</p>
    <p>${p.propertyDescription}</p>
    ${p.propertyLink ? `<p><a href="${p.propertyLink}" target="_blank">More Info</a></p>` : ''}
    ${p.propertyImageIds && p.propertyImageIds.length > 0 ? `<img src="images/${p.propertyImageIds[0]}" alt="Property Image">` : ''}
  `;
  document.getElementById('propertyDetails').innerHTML = html;
}
