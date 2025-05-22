let map;
let markerClusterGroup;
let currentProperties = [];
let moveTimeout;
const MAX_MARKERS = 500; // Limit for wide zooms

// Marker Icons
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

// Initialize the map
function initMap() {
  if (map) return;

  map = L.map('map', {
    center: [-25.2744, 133.7751], // Centered on Australia
    zoom: 5,
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

  markerClusterGroup = L.markerClusterGroup();
  map.addLayer(markerClusterGroup);

  loadProperties();
}

// Load and process all property data
function loadProperties() {
  fetch('data/properties.json')
    .then(res => res.json())
    .then(properties => {
      currentProperties = properties;

      const states = new Set();
      const types = new Set();

      properties.forEach(p => {
        states.add(p.state);
        types.add(p.propertyType);
      });

      populateFilter('stateFilter', [...states]);
      populateFilter('typeFilter', [...types]);

      filterMarkers(); // initial render

      // Events
      document.getElementById('stateFilter').addEventListener('change', filterMarkers);
      document.getElementById('typeFilter').addEventListener('change', filterMarkers);
      map.on('moveend', () => {
        clearTimeout(moveTimeout);
        moveTimeout = setTimeout(filterMarkers, 100);
      });

      enableSearch(properties);
      enableSuburbPan(properties);
    });
}

// Populate filter dropdowns
function populateFilter(selectId, options) {
  const select = document.getElementById(selectId);
  select.innerHTML = '<option value="">All</option>';
  options.sort().forEach(opt => {
    const option = document.createElement('option');
    option.value = opt;
    option.text = opt;
    select.appendChild(option);
  });
}

// Filter and show only markers in view & matching filters
function filterMarkers() {
  const selectedState = document.getElementById('stateFilter').value;
  const selectedType = document.getElementById('typeFilter').value;
  const bounds = map.getBounds();

  let filtered = currentProperties.filter(p =>
    (!selectedState || p.state === selectedState) &&
    (!selectedType || p.propertyType === selectedType) &&
    bounds.contains([p.latitude, p.longitude])
  );

  if (filtered.length > MAX_MARKERS) {
    filtered = filtered.slice(0, MAX_MARKERS);
  }

  displayMarkers(filtered);
}

// Render markers on map
function displayMarkers(properties) {
  markerClusterGroup.clearLayers();

  properties.forEach(p => {
    const marker = L.marker([p.latitude, p.longitude], { icon: greenIcon });

    marker.bindPopup(`<strong>${p.propertyName}</strong><br>${p.propertyType}`);

    marker.on('click', () => {
      marker.setIcon(greyIcon);
      map.setView([p.latitude, p.longitude], 15, { animate: true });
      showDetails(p);
    });

    markerClusterGroup.addLayer(marker);
  });
}

// Display sidebar details
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

// Search by property name or address
function enableSearch(properties) {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;

  searchInput.addEventListener('input', () => {
    const text = searchInput.value.toLowerCase();
    const match = properties.find(p =>
      p.propertyName.toLowerCase().includes(text) ||
      p.propertyAddress.toLowerCase().includes(text)
    );
    if (match) {
      map.setView([match.latitude, match.longitude], 15);
    }
  });
}

// Suburb dropdown pan (not filtering)
function enableSuburbPan(properties) {
  const suburbInput = document.getElementById('suburbInput');
  const datalist = document.getElementById('suburbList');
  if (!suburbInput || !datalist) return;

  const suburbs = [...new Set(properties.map(p => p.propertySuburb).filter(Boolean))];
  datalist.innerHTML = suburbs.sort().map(s => `<option value="${s}">`).join('');

  suburbInput.addEventListener('change', () => {
    const val = suburbInput.value.toLowerCase();
    const match = properties.find(p => p.propertySuburb.toLowerCase() === val);
    if (match) {
      map.setView([match.latitude, match.longitude], 14);
    }
  });
}
