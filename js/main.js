(() => {
  /* ===========================
     Data (edit these!)
  =========================== */
  const ABOUT_TEXT = `
Hi — I'm Sig. 

This portfolio is a cyberpunk-styled Linux desktop UI built in vanilla JS.
It aims to stay WCAG-friendly: keyboard operable, clear focus, high contrast.

Focus areas:
- Vanilla JS fundamentals
- UI patterns that translate well to React
- GIS + visualization projects

- GitHub: https://github.com/mistersig
- LinkedIn: https://www.linkedin.com/in/sigfridogomez/ 

  `.trim();

//   const RESUME_TEXT = `
// Update me later
//   `.trim();

  const PROJECTS = [
    {
      id: "upp461",
      title: "UPP 461: Introduction to GIS",
      year: "2026",
      description: "Online support modules for upp-461",
      links: [
        { label: "Repo", href: "https://github.com/mistersig/upp-461-hub" },
        { label: "Live Demo", href: "https://mistersig.github.io/upp-461-hub/index.html" }
      ],
      tech: ["Vanilla JS", "DOM", "Events"]
    },
    {
      id: "proj-map",
      title: "Mini Map Explorer",
      year: "2026",
      description: "Small map/data explorer project (replace with your real one).",
      links: [{ label: "Repo", href: "https://github.com/your-username/mini-map-explorer" }],
      tech: ["JS", "Data", "Maps"]
    },
    {
      id: "proj-toolkit",
      title: "UI Toolkit Notes",
      year: "2026",
      description: "Reusable UI helpers: windows, dialogs, patterns — plain JS.",
      links: [{ label: "Repo", href: "https://github.com/your-username/ui-toolkit-notes" }],
      tech: ["Vanilla JS", "UI"]
    }
  ];

  /* ===========================
     Elements + State
  =========================== */
  const iconsEl = document.getElementById("icons");
  const windowLayer = document.getElementById("windowLayer");
  const clockEl = document.getElementById("clock");
  const panelButtons = Array.from(document.querySelectorAll(".panelbtn"));

  let topZ = 10;
  const openWindows = new Map(); // key -> element
  let lastFocusedBeforeOpen = null;

  if (!iconsEl || !windowLayer || !clockEl) return;

  /* ===========================
     Theme cycling (affects background + UI via CSS variables)
  =========================== */
  const THEMES = ["teal", "amber", "violet"];
  const themeKey = "desktopTheme";

  function setTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem(themeKey, t); } catch {}
  }

  function getTheme() {
    try { return localStorage.getItem(themeKey); } catch { return null; }
  }

  // Initialize theme
  const saved = getTheme();
  setTheme(THEMES.includes(saved) ? saved : "teal");

  function cycleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "teal";
    const idx = THEMES.indexOf(current);
    const next = THEMES[(idx + 1) % THEMES.length];
    setTheme(next);
  }

  /* ===========================
     Clock
  =========================== */
  function setClock() {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    clockEl.textContent = `${hh}:${mm}`;
  }
  setClock();
  setInterval(setClock, 10_000);

  /* ===========================
     Icons (CSS-only folder glyph)
  =========================== */
  function buildFolderGlyph() {
    const icon = document.createElement("span");
    icon.className = "folder-icon";
    icon.setAttribute("aria-hidden", "true");

    const back = document.createElement("span");
    back.className = "folder-back";
    const front = document.createElement("span");
    front.className = "folder-front";
    const tab = document.createElement("span");
    tab.className = "folder-tab";
    const lines = document.createElement("span");
    lines.className = "folder-lines";

    icon.appendChild(back);
    icon.appendChild(front);
    icon.appendChild(tab);
    icon.appendChild(lines);
    return icon;
  }

  function clearIconSelection() {
    iconsEl.querySelectorAll(".iconbtn[aria-selected='true']").forEach((b) => {
      b.setAttribute("aria-selected", "false");
    });
  }

  function renderIcons() {
    iconsEl.innerHTML = "";

    PROJECTS.forEach((p) => {
      const btn = document.createElement("button");
      btn.className = "iconbtn";
      btn.type = "button";
      btn.setAttribute("aria-label", `Open project folder: ${p.title}`);
      btn.setAttribute("aria-selected", "false");

      btn.appendChild(buildFolderGlyph());

      const label = document.createElement("div");
      label.className = "iconlabel";
      label.textContent = p.title;
      btn.appendChild(label);

      // selection state (not color-only; border/bg changes too)
      btn.addEventListener("focus", () => {
        clearIconSelection();
        btn.setAttribute("aria-selected", "true");
      });

      btn.addEventListener("click", () => openProjectWindow(p.id));
      iconsEl.appendChild(btn);
    });
  }
  renderIcons();

  // Clicking empty desktop clears selection
  document.getElementById("desktop")?.addEventListener("mousedown", (e) => {
    const target = e.target;
    if (target && target.closest && target.closest(".iconbtn")) return;
    clearIconSelection();
  });

  /* ===========================
     Window system
  =========================== */
  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function bringToFront(winEl) {
    topZ += 1;
    winEl.style.zIndex = String(topZ);
    document.querySelectorAll(".window").forEach((w) => w.classList.remove("is-focused"));
    winEl.classList.add("is-focused");
  }

  function centerWindow(winEl) {
    const rect = windowLayer.getBoundingClientRect();
    const w = winEl.offsetWidth;
    const h = winEl.offsetHeight;
    const left = Math.round((rect.width - w) / 2);
    const top = Math.round((rect.height - h) / 3);
    winEl.style.left = `${clamp(left, 8, rect.width - w - 8)}px`;
    winEl.style.top = `${clamp(top, 8, rect.height - h - 8)}px`;
  }

  function offsetWindow(winEl, i) {
    const rect = windowLayer.getBoundingClientRect();
    const w = winEl.offsetWidth;
    const h = winEl.offsetHeight;
    const left = clamp(28 + i * 22, 8, rect.width - w - 8);
    const top = clamp(28 + i * 18, 8, rect.height - h - 8);
    winEl.style.left = `${left}px`;
    winEl.style.top = `${top}px`;
  }

  function closeWindow(key) {
    const el = openWindows.get(key);
    if (!el) return;

    el.remove();
    openWindows.delete(key);

    if (lastFocusedBeforeOpen && typeof lastFocusedBeforeOpen.focus === "function") {
      lastFocusedBeforeOpen.focus();
      lastFocusedBeforeOpen = null;
    }
  }

  function focusFirstControl(winEl) {
    const focusable = winEl.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) focusable.focus();
  }

  function createWindow({ key, title, contentNode }) {
    if (openWindows.has(key)) {
      const existing = openWindows.get(key);
      bringToFront(existing);
      focusFirstControl(existing);
      return existing;
    }

    lastFocusedBeforeOpen = document.activeElement;

    const win = document.createElement("div");
    win.className = "window is-focused";
    win.setAttribute("role", "dialog");
    win.setAttribute("aria-label", title);

    bringToFront(win);

    const titlebar = document.createElement("div");
    titlebar.className = "titlebar";

    const titleEl = document.createElement("div");
    titleEl.className = "titlebar__title";
    titleEl.textContent = title;

    const buttons = document.createElement("div");
    buttons.className = "titlebar__buttons";

    const closeBtn = document.createElement("button");
    closeBtn.className = "winbtn";
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", `Close window: ${title}`);
    closeBtn.addEventListener("click", () => closeWindow(key));

    buttons.appendChild(closeBtn);
    titlebar.appendChild(titleEl);
    titlebar.appendChild(buttons);

    const content = document.createElement("div");
    content.className = "window__content";
    content.appendChild(contentNode);

    win.appendChild(titlebar);
    win.appendChild(content);

    win.addEventListener("mousedown", () => bringToFront(win));
    makeDraggable(win, titlebar);

    windowLayer.appendChild(win);

    const idx = openWindows.size;
    const isMobile = window.matchMedia("(max-width: 600px)").matches;
    if (isMobile) centerWindow(win);
    else offsetWindow(win, idx);

    openWindows.set(key, win);
    focusFirstControl(win);
    return win;
  }

  function makeDraggable(winEl, handleEl) {
    let dragging = false;
    let startX = 0, startY = 0;
    let startLeft = 0, startTop = 0;

    function onDown(e) {
      if (e.button !== 0) return;
      dragging = true;
      bringToFront(winEl);

      const rect = winEl.getBoundingClientRect();
      const layerRect = windowLayer.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      startLeft = rect.left - layerRect.left;
      startTop = rect.top - layerRect.top;

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    }

    function onMove(e) {
      if (!dragging) return;

      const layerRect = windowLayer.getBoundingClientRect();
      const w = winEl.offsetWidth;
      const h = winEl.offsetHeight;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      winEl.style.left = `${clamp(startLeft + dx, 0, layerRect.width - w)}px`;
      winEl.style.top = `${clamp(startTop + dy, 0, layerRect.height - h)}px`;
    }

    function onUp() {
      dragging = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    }

    handleEl.addEventListener("mousedown", onDown);
  }

  /* ===========================
     Content builders
  =========================== */
  function makeTextPanel(text, { linkify = false } = {}) {
    const wrap = document.createElement("div");
    const pre = document.createElement("pre");
    pre.style.whiteSpace = "pre-wrap";
    pre.style.margin = "0";
    const normalized = String(text).trim();

    if (!linkify) {
      pre.textContent = normalized;
    } else {
      const escaped = escapeHtml(normalized);
      const withLinks = escaped.replace(
        /https?:\/\/[^\s<]+/g,
        (url) => `<a href="${url}" target="_blank" rel="noreferrer">${url}</a>`
      );
      pre.innerHTML = withLinks;
    }

    wrap.appendChild(pre);
    return wrap;
  }

  function makeLinksPanel(links) {
    const wrap = document.createElement("div");
    const ul = document.createElement("ul");
    ul.style.margin = "0";
    ul.style.paddingLeft = "18px";

    links.forEach((l) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = l.href;
      a.target = "_blank";
      a.rel = "noreferrer";
      a.textContent = l.label;
      li.appendChild(a);
      ul.appendChild(li);
    });

    wrap.appendChild(ul);
    return wrap;
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function makeProjectList(project) {
    const wrap = document.createElement("div");

    const header = document.createElement("div");
    header.innerHTML = `
      <div style="font-weight:800;">${escapeHtml(project.title)}</div>
      <div style="font-size:12px; margin-top:6px; color: var(--muted);">${escapeHtml(project.description)}</div>
      <hr />
    `;
    wrap.appendChild(header);

    const list = document.createElement("div");
    list.className = "listbox";

    const rows = [
      {
        name: "README.txt",
        meta: project.year,
        makeNode: () =>
          makeTextPanel(
            `${project.title}\n\n${project.description}\n\nTech:\n- ${project.tech.join("\n- ")}`
          )
      },
      {
        name: "LINKS.txt",
        meta: `${project.links.length} items`,
        makeNode: () => makeLinksPanel(project.links)
      }
    ];

    rows.forEach((r) => {
      const row = document.createElement("div");
      row.className = "listrow";
      row.tabIndex = 0;
      row.setAttribute("role", "button");
      row.setAttribute("aria-label", `Open file ${r.name} in ${project.title}`);

      row.innerHTML = `
        <div class="listname">${escapeHtml(r.name)}</div>
        <div class="listmeta">${escapeHtml(r.meta)}</div>
      `;

      function openIt() {
        createWindow({
          key: `${project.id}:${r.name}`,
          title: `${project.title} — ${r.name}`,
          contentNode: r.makeNode()
        });
      }

      row.addEventListener("click", openIt);
      row.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openIt();
        }
      });

      list.appendChild(row);
    });

    wrap.appendChild(list);

    const hint = document.createElement("div");
    hint.style.marginTop = "10px";
    hint.style.fontSize = "12px";
    hint.style.color = "var(--muted)";
    hint.textContent = "Tip: Select a file row and press Enter (or click) to open it.";
    wrap.appendChild(hint);

    return wrap;
  }

  /* ===========================
     Open windows
  =========================== */
  function openAbout() {
    createWindow({
      key: "about",
      title: "About",
      contentNode: makeTextPanel(ABOUT_TEXT, { linkify: true })
    });
  }

  // function openResume() {
  //   createWindow({ key: "resume", title: "Resume", contentNode: makeTextPanel(RESUME_TEXT) });
  // }

  function openProjectWindow(projectId) {
    const project = PROJECTS.find((p) => p.id === projectId);
    if (!project) return;

    createWindow({ key: project.id, title: project.title, contentNode: makeProjectList(project) });
  }

  /* ===========================
     Panel buttons
  =========================== */
  panelButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action");
      if (action === "open-about") openAbout();
      // if (action === "open-resume") openResume();
      if (action === "cycle-theme") cycleTheme();
    });
  });

  function cycleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "teal";
    const idx = THEMES.indexOf(current);
    const next = THEMES[(idx + 1) % THEMES.length];
    setTheme(next);
  }

  /* ESC closes top-most window */
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;

    let topKey = null;
    let topZLocal = -Infinity;

    for (const [key, el] of openWindows.entries()) {
      const z = Number(el.style.zIndex || 0);
      if (z > topZLocal) {
        topZLocal = z;
        topKey = key;
      }
    }
    if (topKey) closeWindow(topKey);
  });

  /* Mobile: re-center windows on resize/orientation */
  window.addEventListener("resize", () => {
    const isMobile = window.matchMedia("(max-width: 600px)").matches;
    if (!isMobile) return;
    for (const [, win] of openWindows.entries()) centerWindow(win);
  });

  /* Start */
  openAbout();
})();
