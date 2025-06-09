// background.js
console.log("Background ▶︎ loaded");

/**
 * Listen for messages to generate links and open the links page next to the originating tab.
 */
browser.runtime.onMessage.addListener(async (message, sender) => {
  console.log("Background ▶︎ received message:", message, sender);
  if (message.type !== "generateLinks" || !Array.isArray(message.links)) {
    return;
  }

  try {
    // Save generated links so links.html can render them
    await browser.storage.local.set({ lastLinks: message.links });
    console.log("Background ▶︎ links saved");

    // Build the URL for our extension's links page
    const pageUrl = browser.runtime.getURL("links.html");

    // If we know the source tab, open the new tab in the same window next to it
    if (sender.tab && typeof sender.tab.windowId === "number" && typeof sender.tab.index === "number") {
      await browser.tabs.create({
        windowId: sender.tab.windowId,
        index: sender.tab.index + 1,
        url: pageUrl
      });
      console.log(
        `Background ▶︎ opened links.html in window ${sender.tab.windowId} at index ${
          sender.tab.index + 1
        }`
      );
    } else {
      // Fallback: open in the active window
      const tab = await browser.tabs.create({ url: pageUrl });
      console.log("Background ▶︎ opened links.html; tab id =", tab.id);
    }
  } catch (err) {
    console.error("Background ▶︎ error saving/opening:", err);
  }
});
