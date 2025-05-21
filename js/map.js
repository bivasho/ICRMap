let map = L.map('map').setView([-34.9285, 138.6007], 6);
let markers = [];
let originalIcon = L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png' });
let clickedIcon = L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-grey.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png' });

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Load data and setup map
fetch('data/properties.json')
  .then(res => res.json())
  .then(properties => {
    const states = new Set();
    const types = new Set();

    properties.forEach(prop => {
      states.add(prop.state);
      types.add(prop.propertyType);
    });

    populateFilter('stateFilter', [...states]);
    populateFilter('typeFilter', [...types]);

    displayMarkers(properties);

    // Filter event
    document.getElementById('stateFilter').addEventListener('change', () => filterMarkers(properties));
    document.getElementById('typeFilter').addEventListener('change', () => filterMarkers(properties));
  });

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
  properties.forEach(prop => {
    const marker = L.marker([prop.latitude, prop.longitude], { icon: originalIcon }).addTo(map);
    marker.bindPopup(`<strong>${prop.propertyName}</strong><br>${prop.propertyType}`);
    marker.on('click', () => {
      marker.setIcon(clickedIcon);
      map.setView([prop.latitude, prop.longitude], 15);
      showDetails(prop);
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
    (selectedState === "" || p.state === selectedState) &&
    (selectedType === "" || p.propertyType === selectedType)
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

