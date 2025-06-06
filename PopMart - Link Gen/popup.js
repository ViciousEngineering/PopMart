// popup.js
document.addEventListener("DOMContentLoaded", async () => {
  const incrInput = document.getElementById("increment");
  const cntInput  = document.getElementById("count");
  const statusDiv = document.getElementById("status");

  try {
    const { increment = 1, count = 50 } = await browser.storage.local.get({
      increment: 1,
      count: 50,
    });
    incrInput.value = increment;
    cntInput.value  = count;
  } catch {
    incrInput.value = 1;
    cntInput.value  = 50;
  }

  document.getElementById("settingsForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    let newIncr = parseInt(incrInput.value, 10);
    let newCnt  = parseInt(cntInput.value, 10);

    if (isNaN(newIncr) || newIncr < 1) newIncr = 1;
    if (isNaN(newCnt)  || newCnt  < 1) newCnt  = 50;

    try {
      await browser.storage.local.set({ increment: newIncr, count: newCnt });
      statusDiv.style.display = "block";
      setTimeout(() => (statusDiv.style.display = "none"), 1200);
    } catch (err) {
      console.error("Popup ▶︎ storage.local.set error:", err);
    }
  });
});
