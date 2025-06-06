// content-script.js
;(async () => {
  // 1) Exit if URL has “-” after the set number
  const pathMatch = location.pathname.match(/\/set\/([^/]+)/);
  if (!pathMatch) return;

  const setId = pathMatch[1];
  if (setId.includes("-")) return;

  // 2) Helper: read settings and generate / send links
  async function generateLinks(boxNumber) {
    console.log("Content ▶︎ found box number →", boxNumber);

    // pull {increment, count} from storage (defaults to 1 and 50)
    const { increment = 1, count = 50 } = await browser.storage.local.get({
      increment: 1,
      count: 50,
    });

    const prefix = boxNumber.slice(0, 5);
    const chunk  = boxNumber.slice(5, 9);
    const suffix = boxNumber.slice(9);

    let chunkNum = parseInt(chunk, 10);
    if (isNaN(chunkNum)) {
      console.warn("Content ▶︎ invalid chunk:", chunk);
      return;
    }

    const links = [];
    for (let i = 1; i <= count; i++) {
      const newChunkNum  = chunkNum + increment * i;
      const newChunkStr  = String(newChunkNum).padStart(4, "0");
      const newBoxNumber = prefix + newChunkStr + suffix;
      links.push(`https://www.popmart.com/us/pop-now/set/${setId}-${newBoxNumber}`);
    }

    try {
      await browser.runtime.sendMessage({ type: "generateLinks", links });
      console.log("Content ▶︎ sendMessage succeeded");
    } catch (err) {
      console.error("Content ▶︎ sendMessage failed:", err);
    }
  }

  // 3) Try to extract box-number now (or wait via MutationObserver)
  function extractOnce() {
    const el = document.querySelector("div.index_boxNumber__7k_Uf");
    if (!el) return false;

    const match = el.textContent.trim().match(/No\.?(\d{14})/);
    if (!match) {
      console.log("Content ▶︎ no 14-digit number in:", el.textContent.trim());
      return true; // stop observing if element exists but malformed
    }
    generateLinks(match[1]);
    return true;
  }

  if (!extractOnce()) {
    const observer = new MutationObserver((_, obs) => {
      if (extractOnce()) obs.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
