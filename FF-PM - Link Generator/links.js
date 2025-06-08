// links.js

// Inject CSS for clicked links
document.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.textContent = `
    #linksList a.clicked {
      color: #999999 !important;
    }
  `;
  document.head.appendChild(style);

  // Fetch stored links and clicked state
  chrome.storage.local.get(['lastLinks', 'clickedLinks'], function(data) {
    const lastLinks = data.lastLinks || [];
    const clickedLinks = data.clickedLinks || [];
    const ul = document.getElementById('linksList');

    lastLinks.forEach(url => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = url;
      a.textContent = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';

      // Mark as clicked if in clickedLinks
      if (clickedLinks.includes(url)) {
        a.classList.add('clicked');
      }

      // Handle click
      a.addEventListener('click', () => {
        // Persist clicked state
        if (!clickedLinks.includes(url)) {
          clickedLinks.push(url);
          chrome.storage.local.set({ clickedLinks });
        }
        // Apply clicked style
        a.classList.add('clicked');
      });

      li.appendChild(a);
      ul.appendChild(li);
    });
  });
});
