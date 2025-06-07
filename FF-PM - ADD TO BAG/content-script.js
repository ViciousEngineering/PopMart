// content-script.js
console.log("[Auto-Clicker] content-script.js loaded on", location.href);

(async function() {
  // ————————————————————————————————
  // 1) Only run on any URL containing "/pop-now/set/"
  // ————————————————————————————————
  if (!/\/pop-now\/set\//.test(location.pathname)) {
    console.log("[Auto-Clicker] URL not in /pop-now/set/ → skipping");
    return;
  }
  console.log("[Auto-Clicker] URL matches /pop-now/set/, starting click flow");

  // ————————————————————————————————
  // 2) Helpers (unchanged)
  // ————————————————————————————————
  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const existing = document.querySelector(selector);
      if (existing) return resolve(existing);

      const obs = new MutationObserver(() => {
        const el = document.querySelector(selector);
        if (el) {
          obs.disconnect();
          resolve(el);
        }
        else if (Date.now() - start > timeout) {
          obs.disconnect();
          reject(new Error(`Timeout: "${selector}" not found within ${timeout}ms`));
        }
      });
      obs.observe(document.body, { childList: true, subtree: true });
    });
  }

  async function waitForCheckboxChecked(labelSel, inputSel, interval = 10, timeout = 10000) {
    const start = Date.now();
    while (true) {
      const input = document.querySelector(inputSel);
      if (input) {
        if (!input.checked) {
          const label = document.querySelector(labelSel);
          if (label) {
            label.click();
            console.log(`[Auto-Clicker] Clicked "${labelSel}" to force-check`);
          }
        } else {
          return input;
        }
      }
      if (Date.now() - start > timeout) {
        throw new Error(`Timeout waiting for checkbox "${inputSel}" to become checked`);
      }
      await sleep(interval);
    }
  }

  // ————————————————————————————————
  // 3) Hybrid flow (unchanged)
  // ————————————————————————————————
  async function performHybridClick() {
    try {
      // Buy Multiple Boxes
      const BUY = "button.ant-btn.ant-btn-ghost.index_chooseMulitityBtn__n0MoA";
      console.log(`[Auto-Clicker] Waiting for BUY selector ${BUY}`);
      const buyBtn = await waitForElement(BUY);
      buyBtn.click();
      console.log("[Auto-Clicker] Clicked Buy Multiple Boxes");

      // Select All
      const LABEL = "label.ant-checkbox-wrapper.index_selectAll__W_Obs";
      const INPUT = `${LABEL} input.ant-checkbox-input`;
      console.log(`[Auto-Clicker] Waiting for checkbox ${INPUT}`);
      await waitForCheckboxChecked(LABEL, INPUT);
      console.log("[Auto-Clicker] Select All is now checked");

      // Small pause
      await sleep(50);

      // Add to Bag
      const ADD = "button.ant-btn.ant-btn-primary.index_btn__Y5dKo";
      console.log(`[Auto-Clicker] Waiting for ADD selector ${ADD}`);
      const addBtn = await waitForElement(ADD);
      addBtn.click();
      console.log("[Auto-Clicker] Clicked Add to Bag");
    }
    catch (err) {
      console.error("[Auto-Clicker] Error in hybrid flow:", err);
    }
  }

  // ————————————————————————————————
  // 4) Kick it off
  // ————————————————————————————————
  performHybridClick();
})();
