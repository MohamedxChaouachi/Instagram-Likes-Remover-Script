/**
 * Instagram Bulk Unlike
 *
 * Copyright (c) 2026 Chidi
 * Copyright (c) 2026 MohamedXChaouachi
 * MIT License, see the LICENSE file.
 *
 * Usage: run in the browser console on
 * https://www.instagram.com/your_activity/interactions/likes
 * 
 * Stop: window.__STOP_IG_BULK_UNLIKE__ = true
 */

(async function instagramBulkUnlike() {
  window.__STOP_IG_BULK_UNLIKE__ = false;

  const MAX = 100;            // likes to remove per cycle
  const CYCLE_DELAY = 20000;
  const SELECT_DELAY = 1200;
  const ICON_DELAY = 700;
  const ACTION_DELAY = 1200;
  const MODAL_DELAY = 1000;
  const LOAD_DELAY = 2000;    // wait after each scroll for more likes to load
  const LOAD_ATTEMPTS = 5;    // scrolls in a row with nothing new before giving up

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // Simulate a real user click event
  function realClick(el) {
    el.scrollIntoView({ block: "center" });
    ["mousedown", "mouseup", "click"].forEach((t) =>
      el.dispatchEvent(
        new MouseEvent(t, {
          bubbles: true,
          cancelable: true,
          buttons: 1,
        }),
      ),
    );
  }

  // Get an element's own text (direct text nodes only), ignoring descendants
  const ownText = (el) =>
    [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join("");

  // Find the "Select" button to enter selection mode
  function findSelectButton() {
    return [...document.querySelectorAll("span, div")].find(
      (el) => ownText(el) === "Select",
    );
  }

  // Activate selection mode by clicking the "Select" button
  async function activateSelectMode() {
    const btn = findSelectButton();
    if (!btn) throw new Error("Select button not found");
    realClick(btn);
    await sleep(SELECT_DELAY);
  }

  // Get all selectable like icons in the current view
  function getSelectableIcons() {
    return document.querySelectorAll('[role="button"][aria-label="Toggle checkbox"]');
  }

  // Scroll the likes list (and the window) to the bottom so Instagram loads more
  function scrollToBottom() {
    const icons = getSelectableIcons();
    const last = icons[icons.length - 1];
    if (last) last.scrollIntoView({ block: "end" });
    window.scrollTo(0, document.body.scrollHeight);
    for (const el of document.querySelectorAll("div")) {
      if (el.scrollHeight > el.clientHeight + 50) {
        const overflow = getComputedStyle(el).overflowY;
        if (overflow === "auto" || overflow === "scroll") el.scrollTop = el.scrollHeight;
      }
    }
  }

  // Keep scrolling until at least `target` likes are loaded, or the list stops growing
  async function loadLikes(target) {
    let count = getSelectableIcons().length;
    let stalls = 0;
    while (count < target && stalls < LOAD_ATTEMPTS && !window.__STOP_IG_BULK_UNLIKE__) {
      scrollToBottom();
      await sleep(LOAD_DELAY);
      const newCount = getSelectableIcons().length;
      if (newCount > count) {
        count = newCount;
        stalls = 0;
      } else {
        stalls++;
      }
    }
    return count;
  }

  function getDiagnostics() {
    return {
      url: location.href,
      selectLabels: [...document.querySelectorAll("span, div")]
        .filter((el) => ownText(el) === "Select")
        .length,
      checkboxButtons: getSelectableIcons().length,
      unlikeSvgs: document.querySelectorAll('svg[aria-label="Unlike"]').length,
      unlikeTextButtons: [...document.querySelectorAll("button, span, div")]
        .filter((el) => ownText(el) === "Unlike" || el.innerText?.trim() === "Unlike")
        .length,
      loadingIndicators: document.querySelectorAll('[role="progressbar"]').length,
    };
  }

  // Select likes up to the specified maximum
  async function selectLikes(max) {
    const buttons = getSelectableIcons();
    let count = 0;

    for (const btn of buttons) {
      if (count >= max) break;

      realClick(btn);
      count++;
      await sleep(ICON_DELAY);
    }

    return count;
  }

  // Find the "Unlike" button in the UI
  function findUnlikeButton() {
    const span = [...document.querySelectorAll("span")]
      .find((el) => el.innerText?.trim() === "Unlike");
    return span?.closest("button, div");
  }

  // Click the "Unlike" button to initiate unliking
  async function clickUnlike() {
    await sleep(ACTION_DELAY);
    const btn = findUnlikeButton();
    if (!btn) throw new Error("Unlike action not found");
    realClick(btn);
  }

  // Find the confirmation button in the modal dialog
  function findModalConfirmButton() {
    return [...document.querySelectorAll("button")]
      .find((btn) => btn.innerText?.trim() === "Unlike");
  }

  // Confirm the unliking action in the modal dialog
  async function confirmModal() {
    await sleep(MODAL_DELAY);
    const confirmBtn = findModalConfirmButton();
    if (!confirmBtn) throw new Error("Modal confirmation not found");
    confirmBtn.focus();
    await sleep(100);
    confirmBtn.click();
  }

  let cycle = 1;
  let total = 0;

  // Main execution loop
  while (!window.__STOP_IG_BULK_UNLIKE__) {
    try {
      await activateSelectMode();

      // load more likes before selecting, instead of using only what's on screen
      const loaded = await loadLikes(MAX);
      if (window.__STOP_IG_BULK_UNLIKE__) break;

      const selected = await selectLikes(MAX);

      if (!selected) {
        console.log(`No likes remaining (scrolled ${LOAD_ATTEMPTS} times, nothing new loaded). Total unliked: ${total}`);
        break;
      }

      await clickUnlike();
      await confirmModal();

      total += selected;
      console.log(`Cycle ${cycle}: loaded ${loaded}, unliked ${selected} (total ${total})`);
      cycle++;

      await sleep(CYCLE_DELAY);
    } catch (e) {
      console.warn("Stopped:", e.message);
      console.table(getDiagnostics());
      break;
    }
  }

  if (window.__STOP_IG_BULK_UNLIKE__) console.log(`Stopped by you. Total unliked: ${total}`);
})();