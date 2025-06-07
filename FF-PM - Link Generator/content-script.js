// content-script.js
console.log("ContentScript ▶︎ loaded on", location.href);

;(async () => {
  // 1) URL must be /{region}/pop-now/set/{setIdRaw} without a dash
  const pm = location.pathname.match(/^\/([^/]+)\/pop-now\/set\/([^/]+)/);
  if (!pm) return;
  const [, region, setIdRaw] = pm;
  if (setIdRaw.includes("-")) return;

  // 2) Helper to grab the 14-digit box number
  const getBoxNumber = () => {
    const el = document.querySelector("div.index_boxNumber__7k_Uf");
    if (!el) return null;
    const m = el.textContent.trim().match(/No\.?(\d{14})/);
    return m && m[1];
  };

  // 3) Main work once we have the box number
  async function generateLinks(boxNumber) {
    console.log("Content ▶︎ box # →", boxNumber);

    // read your settings (defaults: increment=1, count=50)
    let { increment = 1, count = 50 } =
      await browser.storage.local.get({ increment: 1, count: 50 });
    increment = Math.max(1, Number(increment) || 1);
    count     = Math.max(1, Number(count)     || 50);

    // split into prefix
	const totalLen  = boxNumber.length;   // still 14
	const chunkLen  = 6;                  // ← now 6 digits
	const suffixLen = 5;                  // keep the last 5 digits as-is
	const prefixLen = totalLen - chunkLen - suffixLen; // 14 - 6 - 5 = 3

const prefix = boxNumber.slice(0, prefixLen);                    // "100"
const chunk  = boxNumber.slice(prefixLen, prefixLen + chunkLen); // "070343"
const suffix = boxNumber.slice(prefixLen + chunkLen);            // "00280"


    let base = parseInt(chunk, 10);
    if (isNaN(base)) {
      console.warn("Content ▶︎ bad chunk:", chunk);
      return;
    }

    // build links
    const links = [];
    for (let i = 1; i <= count; i++) {
      const next = base + increment * i;
      const nextStr = String(next).padStart(chunkLen, "0");
      const newBox = prefix + nextStr + suffix;
      links.push(`https://www.popmart.com/${region}/pop-now/set/${setIdRaw}-${newBox}`);
    }

    // send to background
    try {
      await browser.runtime.sendMessage({ type: "generateLinks", links });
      console.log("Content ▶︎ message sent.");
    } catch (err) {
      console.error("Content ▶︎ sendMessage failed:", err);
    }
  }

  // 4) either run immediately or wait for async injection
  let box = getBoxNumber();
  if (box) {
    generateLinks(box);
  } else {
    const obs = new MutationObserver((_, o) => {
      box = getBoxNumber();
      if (box) {
        o.disconnect();
        generateLinks(box);
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }
})();
