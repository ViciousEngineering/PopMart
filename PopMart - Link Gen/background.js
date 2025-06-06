// background.js
console.log("Background ▶︎ loaded");

browser.runtime.onMessage.addListener(async (message) => {
  console.log("Background ▶︎ received message:", message);
  if (message.type !== "generateLinks" || !Array.isArray(message.links)) {
    return;
  }

  try {
    await browser.storage.local.set({ lastLinks: message.links });
    console.log("Background ▶︎ links saved");

    const pageUrl = browser.runtime.getURL("links.html");
    const tab = await browser.tabs.create({ url: pageUrl });
    console.log("Background ▶︎ opened links.html; tab id =", tab.id);
  } catch (err) {
    console.error("Background ▶︎ error saving/opening:", err);
  }
});
