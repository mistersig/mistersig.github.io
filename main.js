/* ===========================
   DATA (edit these!)
=========================== */

const ABOUT_TEXT = `
Hi — I'm Sig G.

I build web + GIS tooling and I like clean UI, strong fundamentals, and shipping.
This portfolio is styled like an early 90s black-and-white Mac desktop — because why not.

What I'm currently focusing on:
- Vanilla JS fundamentals
- Front-end patterns that translate well to React
- GIS + visualization projects

Contact:
- Email: your.email@example.com
- GitHub: https://github.com/your-username
`;

const RESUME_TEXT = `
SIG G
City, State • your.email@example.com • github.com/your-username

SUMMARY
Developer with a GIS / data background building user-facing tooling and web apps.

SKILLS
JavaScript, HTML, CSS, Python, Git, APIs, (add ESRI/ArcGIS items here)

EXPERIENCE
Role — Company (Year–Year)
- Impact bullet
- Impact bullet

EDUCATION
Degree — School
`;

/* Desktop “folders” (portfolio projects) */
const PROJECTS = [
    {
        id: "proj-vibes",
        title: "Vibe Quotes App",
        year: "2026",
        description:
            "Random quote generator with DOM rendering, event handling, and clean architecture.",
        links: [
            { label: "Repo", href: "https://github.com/your-username/webdev-workbench" },
            { label: "Live Demo", href: "https://your-username.github.io/webdev-workbench/" }
        ],
        tech: ["Vanilla JS", "DOM", "Events"]
    },
    {
        id: "proj-map",
        title: "Mini Map Explorer",
        year: "2026",
        description:
            "A small map/data explorer project (replace this with your actual project).",
        links: [{ label: "Repo", href: "https://github.com/your-username/mini-map-explorer" }],
        tech: ["JS", "Data", "Maps"]
    },
    {
        id: "proj-toolkit",
        title: "UI Toolkit Notes",
        year: "2026",
        description:
            "Reusable UI helpers: modals, toasts, drag-and-drop — all in plain JS.",
        links: [{ label: "Repo", href: "https://github.com/your-username/ui-toolkit-notes" }],
        tech: ["Vanilla JS", "UI"]
    }
];

/* ===========================
   WINDOW SYSTEM
=========================== */

const icons = document.getElementById("icons");
const windowLayer = document.getElementById("windowLayer");
const clockEl = document.getElementById("clock");

let topZ = 10;
let openWindows = new Map(); // key -> element

function setClock() {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    clockEl.textContent = `${hh}:${mm}`;
}
setClock();
setInterval(setClock, 10_000);

/* Create desktop icons */
function renderIcons() {
    icons.innerHTML = "";

    PROJECTS.forEach((p) => {
        const btn = document.createElement("button");
        btn.className = "icon";
        btn.type = "button";
        btn.setAttribute("data-action", "open-project");
        btn.setAttribute("data-project-id", p.id);
        btn.title = p.title;

        // folder glyph
        const glyph = document.createElement("span");
        glyph.className = "icon__glyph folder";
        glyph.setAttribute("aria-hidden", "true");

        const label = document.createElement("div");
        label.className = "icon__label";
        label.textContent = p.title;

        btn.appendChild(glyph);
        btn.appendChild(label);

        // Finder-ish behavior:
        // - single click = focus
        // - double click = open
        btn.addEventListener("click", () => btn.focus());
        btn.addEventListener("dblclick", () => openProjectWindow(p.id));

        icons.appendChild(btn);
    });
}
renderIcons();

/* Helpers */
function bringToFront(winEl) {
    topZ += 1;
    winEl.style.zIndex = String(topZ);

    document.querySelectorAll(".window").forEach((w) => w.classList.remove("is-focused"));
    winEl.classList.add("is-focused");
}

function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}

function centerWindow(winEl) {
    const rect = windowLayer.getBoundingClientRect();
    const w = winEl.offsetWidth;
    const h = winEl.offsetHeight;
    const left = Math.round((rect.width - w) / 2);
    const top = Math.round((rect.height - h) / 3);
    winEl.style.left = `${clamp(left, 10, rect.width - w - 10)}px`;
    winEl.style.top = `${clamp(top, 10, rect.height - h - 10)}px`;
}

function offsetWindow(winEl, i) {
    const rect = windowLayer.getBoundingClientRect();
    const w = winEl.offsetWidth;
    const h = winEl.offsetHeight;
    const left = clamp(30 + i * 22, 10, rect.width - w - 10);
    const top = clamp(30 + i * 18, 10, rect.height - h - 10);
    winEl.style.left = `${left}px`;
    winEl.style.top = `${top}px`;
}

function closeWindow(key) {
    const el = openWindows.get(key);
    if (!el) return;
    el.remove();
    openWindows.delete(key);
}

function createWindow({ key, title, contentNode }) {
    // If already open, focus it
    if (openWindows.has(key)) {
        const existing = openWindows.get(key);
        bringToFront(existing);
        return existing;
    }

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
    closeBtn.setAttribute("aria-label", "Close window");
    closeBtn.addEventListener("click", () => closeWindow(key));

    buttons.appendChild(closeBtn);
    titlebar.appendChild(titleEl);
    titlebar.appendChild(buttons);

    const content = document.createElement("div");
    content.className = "window__content";
    content.appendChild(contentNode);

    win.appendChild(titlebar);
    win.appendChild(content);

    // click to focus
    win.addEventListener("mousedown", () => bringToFront(win));

    // drag
    makeDraggable(win, titlebar);

    windowLayer.appendChild(win);

    // place window (desktop cascade, mobile center)
    const idx = openWindows.size;
    const isMobile = window.matchMedia("(max-width: 600px)").matches;

    if (isMobile) {
        centerWindow(win);
    } else {
        offsetWindow(win, idx);
    }

    openWindows.set(key, win);
    return win;
}

function makeDraggable(winEl, handleEl) {
    let dragging = false;
    let startX = 0, startY = 0;
    let startLeft = 0, startTop = 0;

    function onDown(e) {
        // only left mouse drag
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

        const left = clamp(startLeft + dx, 0, layerRect.width - w);
        const top = clamp(startTop + dy, 0, layerRect.height - h);

        winEl.style.left = `${left}px`;
        winEl.style.top = `${top}px`;
    }

    function onUp() {
        dragging = false;
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
    }

    handleEl.addEventListener("mousedown", onDown);
}

/* ===========================
   CONTENT BUILDERS
=========================== */

function makeTextPanel(text) {
    const wrapper = document.createElement("div");

    const pre = document.createElement("pre");
    pre.style.whiteSpace = "pre-wrap";
    pre.style.margin = "0";
    pre.textContent = text.trim();

    wrapper.appendChild(pre);
    return wrapper;
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

function makeFinderList(project) {
    const wrap = document.createElement("div");

    const header = document.createElement("div");
    header.innerHTML = `
    <div style="font-weight:700;">${escapeHtml(project.title)}</div>
    <div style="font-size:12px; margin-top:6px;">${escapeHtml(project.description)}</div>
    <hr />
  `;
    wrap.appendChild(header);

    const list = document.createElement("div");
    list.className = "finder-list";

    // “files” inside folder: README + LINKS
    const rows = [
        {
            name: "README.txt",
            meta: project.year,
            node: makeTextPanel(
                `${project.title}\n\n${project.description}\n\nTech:\n- ${project.tech.join("\n- ")}`
            )
        },
        {
            name: "LINKS.txt",
            meta: `${project.links.length} items`,
            node: makeLinksPanel(project.links)
        }
    ];

    rows.forEach((r) => {
        const row = document.createElement("div");
        row.className = "finder-list__row";
        row.innerHTML = `
      <div class="finder-name">${escapeHtml(r.name)}</div>
      <div class="finder-meta">${escapeHtml(r.meta)}</div>
    `;

        row.tabIndex = 0;
        row.addEventListener("dblclick", () => {
            createWindow({
                key: `${project.id}:${r.name}`,
                title: `${project.title} — ${r.name}`,
                contentNode: r.node
            });
        });

        list.appendChild(row);
    });

    wrap.appendChild(list);

    const hint = document.createElement("div");
    hint.style.marginTop = "10px";
    hint.style.fontSize = "12px";
    hint.textContent = "Tip: double-click a file row to open it.";
    wrap.appendChild(hint);

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

/* ===========================
   OPEN WINDOWS
=========================== */

function openAbout() {
    createWindow({
        key: "about",
        title: "About Me",
        contentNode: makeTextPanel(ABOUT_TEXT)
    });
}

function openResume() {
    createWindow({
        key: "resume",
        title: "Resume",
        contentNode: makeTextPanel(RESUME_TEXT)
    });
}

function openProjectWindow(projectId) {
    const project = PROJECTS.find((p) => p.id === projectId);
    if (!project) return;

    createWindow({
        key: project.id,
        title: project.title,
        contentNode: makeFinderList(project)
    });
}

/* ===========================
   MENU EVENTS
=========================== */

document.querySelectorAll(".menuitem").forEach((btn) => {
    btn.addEventListener("click", () => {
        const action = btn.getAttribute("data-action");
        if (action === "open-about") openAbout();
        if (action === "open-resume") openResume();
    });
});

/* Keyboard: Esc closes top-most window */
document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;

    const wins = Array.from(openWindows.entries());
    if (wins.length === 0) return;

    let top = null;
    let topZLocal = -Infinity;

    for (const [key, el] of wins) {
        const z = Number(el.style.zIndex || 0);
        if (z > topZLocal) {
            topZLocal = z;
            top = { key, el };
        }
    }

    if (top) closeWindow(top.key);
});

/* Mobile: re-center windows on resize/orientation change */
window.addEventListener("resize", () => {
    const isMobile = window.matchMedia("(max-width: 600px)").matches;
    if (!isMobile) return;

    for (const [, win] of openWindows.entries()) {
        centerWindow(win);
    }
});

/* Nice: open About on first load */
openAbout();
