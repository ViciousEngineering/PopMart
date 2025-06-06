// links.js
document.addEventListener("DOMContentLoaded", async () => {
  const ul = document.getElementById("linksList");
  if (!ul) return console.error("Links page ▶︎ <ul id='linksList'> not found");

  try {
    const { lastLinks } = await browser.storage.local.get("lastLinks");
    if (!Array.isArray(lastLinks)) {
      ul.innerHTML = "<li><em>No links found.</em></li>";
      return;
    }
    for (const url of lastLinks) {
      const li = document.createElement("li");
      const a  = document.createElement("a");
      a.href        = url;
      a.textContent = url;
      a.target      = "_blank";
      li.appendChild(a);
      ul.appendChild(li);
    }
  } catch (err) {
    console.error("Links page ▶︎ storage.local.get error:", err);
    ul.innerHTML = "<li><em>Error loading links.</em></li>";
  }
});
