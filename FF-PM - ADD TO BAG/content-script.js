// content-script.js

console.log("[Auto-Clicker] content-script.js loaded");

(function() {
  // ---------------------------------------------
  // Pause for `ms` milliseconds.
  // ---------------------------------------------
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ---------------------------------------------
  // Wait for any element matching `selector` to appear under <body>.
  // If it already exists, resolve immediately; otherwise use a MutationObserver.
  // ---------------------------------------------
  function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const start = Date.now();

      // 1) If already in the DOM, return it at once
      const existing = document.querySelector(selector);
      if (existing) {
        return resolve(existing);
      }

      // 2) Otherwise, watch for new nodes under <body>
      const observer = new MutationObserver((_mutations, obs) => {
        const el = document.querySelector(selector);
        if (el) {
          obs.disconnect();
          return resolve(el);
        }
        if (Date.now() - start > timeout) {
          obs.disconnect();
          return reject(new Error(`Timeout: "${selector}" not found within ${timeout}ms`));
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

  // ---------------------------------------------
  // Original‐style “waitForCheckboxChecked”:
  //
  //   • labelSelector: CSS selector to the <label> wrapping the checkbox.
  //   • inputSelector: CSS selector to the actual <input type="checkbox"> element.
  //
  // Repeatedly:
  //   1) Query document for the label + input.
  //   2) If input exists and is unchecked, click the label once.
  //   3) If input is checked, return and let the flow continue.
  //
  // Polls every 10ms up to a default 10-second timeout.
  // ---------------------------------------------
  async function waitForCheckboxChecked(labelSelector, inputSelector, checkInterval = 10, timeout = 10000) {
    const start = Date.now();

    while (true) {
      const labelEl = document.querySelector(labelSelector);
      const inputEl = document.querySelector(inputSelector);

      if (inputEl) {
        // If it’s not yet checked, click the label to force‐check it.
        if (!inputEl.checked) {
          if (labelEl) {
            labelEl.click();
            console.log(`[Auto-Clicker] Clicked "${labelSelector}" to force-check`);
          } else {
            console.log(`[Auto-Clicker] Found input but no label for "${labelSelector}", skipping click`);
          }
        } else {
          // Already checked → return
          return inputEl;
        }
      }
      // Timeout?
      if (Date.now() - start > timeout) {
        throw new Error(`Timeout waiting for checkbox "${inputSelector}" to become checked`);
      }

      // Otherwise, pause briefly and retry
      await sleep(checkInterval);
    }
  }

  // ---------------------------------------------
  // Main flow:
  //   1) Wait for “Buy Multiple Boxes” → click it.
  //   2) Wait for “Select All” to become checked (using original logic).
  //   3) After that, wait a short moment and click “ADD TO BAG.”
  // ---------------------------------------------
  async function performHybridClick() {
    const url = window.location.href;
    console.log("[Auto-Clicker] current URL:", url);

    // Only run on the specific set page
    if (!url.startsWith("https://www.popmart.com/us/pop-now/set/")) {
      console.log("[Auto-Clicker] URL does not match → skipping");
      return;
    }
    console.log("[Auto-Clicker] URL matches → starting hybrid flow");

    try {
      // 1) “Buy Multiple Boxes”
      const BUY_SELECTOR = "button.ant-btn.ant-btn-ghost.index_chooseMulitityBtn__n0MoA";
      console.log(`[Auto-Clicker] Waiting for "${BUY_SELECTOR}" (Buy Multiple Boxes)…`);
      const buyBtn = await waitForElement(BUY_SELECTOR);
      buyBtn.click();
      console.log('[Auto-Clicker] Clicked "Buy Multiple Boxes"');

      // 2) “Select All” checkbox logic (original style loop)
      //
      //    We know the “Select All” label has class "index_selectAll__W_Obs"
      //    so:
      const SELECT_ALL_LABEL_SELECTOR = "label.ant-checkbox-wrapper.index_selectAll__W_Obs";
      const SELECT_ALL_INPUT_SELECTOR = `${SELECT_ALL_LABEL_SELECTOR} input.ant-checkbox-input`;
      console.log(`[Auto-Clicker] Waiting for checkbox input "${SELECT_ALL_INPUT_SELECTOR}" and looping until checked`);
      await waitForCheckboxChecked(SELECT_ALL_LABEL_SELECTOR, SELECT_ALL_INPUT_SELECTOR);
      console.log('[Auto-Clicker] "Select All" is now checked');

      // 3) Small pause to let React/Ant-Design re-render any UI if necessary
      await sleep(50);

      // 4) Finally, click “ADD TO BAG” (modal’s primary button).
      const ADD_TO_BAG_SELECTOR = "button.ant-btn.ant-btn-primary.index_btn__Y5dKo";
      console.log(`[Auto-Clicker] Waiting for "${ADD_TO_BAG_SELECTOR}" (Add to Bag) to appear…`);
      const addBtn = await waitForElement(ADD_TO_BAG_SELECTOR);

      // Even though “ADD TO BAG” is enabled immediately when the modal opens, 
      // we only click it now that the checkbox step is complete.
      addBtn.click();
      console.log('[Auto-Clicker] Clicked "ADD TO BAG"');
    }
    catch (err) {
      console.error("[Auto-Clicker] Error in hybrid flow:", err);
    }
  }

  // Start immediately
  performHybridClick();
})();
