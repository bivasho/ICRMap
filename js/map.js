let map;
let markerClusterGroup;
let currentProperties = [];
let selectedProperties = [];
const MAX_MARKERS = 500;

const AU_BOUNDS = L.latLngBounds(
  L.latLng(-44.5, 112.0),
  L.latLng(-9.0, 154.0)
);

function initMap() {
  map = L.map('map', {
    center: [-25.2744, 133.7751],
    zoom: 5,
    maxBounds: AU_BOUNDS,
    maxBoundsViscosity: 1.0
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  markerClusterGroup = L.markerClusterGroup();
  map.addLayer(markerClusterGroup);

  loadProperties();
}

function loadProperties() {
  fetch('data/properties.json')
    .then(res => res.json())
    .then(data => {
      currentProperties = data;
      populateFilter('stateFilter', [...new Set(data.map(p => p.state))]);
      populateFilter('typeFilter', [...new Set(data.map(p => p.propertyType))]);
      renderMarkers();

      document.getElementById('stateFilter').addEventListener('change', renderMarkers);
      document.getElementById('typeFilter').addEventListener('change', renderMarkers);
      document.getElementById('searchInput').addEventListener('input', searchByNameOrAddress);
    });
}

function populateFilter(id, values) {
  const select = document.getElementById(id);
  select.innerHTML = '<option value="">All</option>';
  values.sort().forEach(value => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function renderMarkers() {
  const state = document.getElementById('stateFilter').value;
  const type = document.getElementById('typeFilter').value;
  const bounds = map.getBounds();

  let filtered = currentProperties.filter(p =>
    (!state || p.state === state) &&
    (!type || p.propertyType === type) &&
    bounds.contains([p.latitude, p.longitude])
  );

  if (filtered.length > MAX_MARKERS) filtered = filtered.slice(0, MAX_MARKERS);

  markerClusterGroup.clearLayers();

  filtered.forEach(p => {
    const marker = L.marker([p.latitude, p.longitude]);
    marker.bindTooltip(`${p.propertyName} | ${p.numOfBedrooms} BR`, { sticky: true });

    marker.on('click', () => {
      map.setView([p.latitude, p.longitude], 14);
      showDetails(p);
    });

    markerClusterGroup.addLayer(marker);
  });
}

function showDetails(p) {
  const detailHTML = `
    <h3>${p.propertyName}</h3>
    <p><strong>Property ID:</strong> ${p.id}</p>
    <p><strong>Type:</strong> ${p.propertyType}</p>
    <p><strong>Address:</strong> ${p.propertyAddress}</p>
    <p><strong>Suburb:</strong> ${p.propertySuburb}</p>
    <p><strong>State:</strong> ${p.state}</p>
    <p><strong>Bedrooms:</strong> ${p.numOfBedrooms}</p>
    <p><strong>Bathrooms:</strong> ${p.numOfBathrooms}</p>
    <p><strong>Carparks:</strong> ${p.numOfCarParks}</p>
    <p><strong>Accessible:</strong> ${p.isAccessible}</p>
    <p><strong>Preferred Property:</strong> ${p.preferredProperty}</p>
    <p><strong>Property Link:</strong> <a href="${p.propertyLink}" target="_blank">${p.propertyLink}</a></p>
    <p><strong>Booking Email:</strong> ${p.emailForBooking}</p>
    <p><strong>Contact:</strong> ${p.contactNumber}</p>
    <p>${p.propertyDescription}</p>
    <button onclick='addToPO(${JSON.stringify(p)})'>Select as an option</button>
  `;

  document.getElementById('propertyDetails').innerHTML = detailHTML;
}

function addToPO(p) {
  if (!selectedProperties.some(prop => prop.id === p.id)) {
    selectedProperties.push(p);
  }
  renderPO();
}

function removeFromPO(index) {
  selectedProperties.splice(index, 1);
  renderPO();
}

function renderPO() {
  const list = document.getElementById('poList');
  list.innerHTML = '';
  selectedProperties.forEach((p, i) => {
    const item = document.createElement('li');
    item.innerHTML = `PO ${i + 1}: ${p.id} | ${p.propertyName} | ${p.numOfBedrooms} BR | ${p.propertySuburb} 
      <button onclick='removeFromPO(${i})'>🗑️</button>`;
    list.appendChild(item);
  });
}

function searchByNameOrAddress() {
  const text = document.getElementById('searchInput').value.toLowerCase();
  const match = currentProperties.find(p =>
    p.propertyName.toLowerCase().includes(text) ||
    p.propertyAddress.toLowerCase().includes(text)
  );
  if (match) {
    map.setView([match.latitude, match.longitude], 14);
  }
}

window.onload = initMap;
