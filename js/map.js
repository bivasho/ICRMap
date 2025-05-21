var map = L.map('map').setView([-34.9285, 138.6007], 8);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

fetch('data/properties.json')
  .then(res => res.json())
  .then(properties => {
    properties.forEach(property => {
      const marker = L.marker([property.latitude, property.longitude]).addTo(map);
      
      marker.on('click', () => {
        marker.setOpacity(0.5); // Greyed out
        showDetails(property);
      });
    });
  });

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
