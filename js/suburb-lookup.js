let suburbData = [];

fetch("data/suburbs.json")
  .then(res => res.json())
  .then(data => {
    suburbData = data;
    setupSuburbInput();
  });

function setupSuburbInput() {
  const input = document.getElementById('suburbInput');
  const suggestions = document.getElementById('suburbSuggestions');

  input.addEventListener('input', () => {
    const val = input.value.toLowerCase();
    suggestions.innerHTML = '';

    if (val.length < 3) return;

    const matches = suburbData.filter(s =>
      s.suburb.toLowerCase().startsWith(val)
    ).slice(0, 5);

    matches.forEach(match => {
      const li = document.createElement('li');
      li.textContent = `${match.suburb}, ${match.state}`;
      li.addEventListener('click', () => {
        input.value = match.suburb;
        map.setView([match.latitude, match.longitude], 13);
        suggestions.innerHTML = '';
      });
      suggestions.appendChild(li);
    });
  });

  document.addEventListener('click', (e) => {
    if (!suggestions.contains(e.target) && e.target !== input) {
      suggestions.innerHTML = '';
    }
  });
}
