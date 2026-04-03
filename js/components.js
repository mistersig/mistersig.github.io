/**
 * components.js — Pure functions that create DOM elements from data.
 *
 * Rules:
 *  - Every function takes data, returns a DOM Node.
 *  - No direct querySelector/getElementById calls.
 *  - No mutations of shared state.
 *  - Side effects (event listeners) are isolated inside the function that
 *    owns the element they act on.
 */

/* ── Utility: element factory ─────────────────────────────────────────────
 *
 * el(tag, attrs, ...children)
 *   - attrs: plain object; `className` sets .className, others set attributes.
 *   - children: Nodes or strings (nested arrays are flattened).
 */
const el = (tag, attrs = {}, ...children) => {
  const node = document.createElement(tag);

  Object.entries(attrs).forEach(([key, val]) => {
    if (val === null || val === undefined) return;
    if (key === "className") {
      node.className = val;
    } else {
      node.setAttribute(key, val);
    }
  });

  children.flat(Infinity).forEach((child) => {
    if (child == null) return;
    node.append(
      typeof child === "string" ? document.createTextNode(child) : child,
    );
  });

  return node;
};

/** Returns the current page ID from body[data-page]. */
const getCurrentPage = () => document.body.dataset.page ?? "";

/** Returns whether a URL is external. */
const isExternal = (href) => /^https?:\/\//.test(href);

/** Adds target/rel to external links. */
const externalAttrs = (href) =>
  isExternal(href) ? { target: "_blank", rel: "noopener noreferrer" } : {};

/* ── Navigation ───────────────────────────────────────────────────────────
 *
 * buildNav(navLinks, currentPage) → <nav>
 */
const buildNav = (navLinks, currentPage) => {
  const logo = el(
    "a",
    {
      href: "index.html",
      className: "nav__logo",
      "aria-label": "MisterSig — home",
    },
    el("span", { className: "nav__logo-prefix", "aria-hidden": "true" }, "// "),
    "MisterSig",
  );

  const linkItems = navLinks.map((link) => {
    const isActive = link.id === currentPage;
    return el(
      "li",
      { className: "nav__item" },
      el(
        "a",
        {
          href: link.href,
          className: `nav__link${isActive ? " nav__link--active" : ""}`,
          ...(isActive ? { "aria-current": "page" } : {}),
        },
        link.label,
      ),
    );
  });

  const linkList = el(
    "ul",
    { className: "nav__list", role: "list" },
    ...linkItems,
  );
  const menu = el("div", { className: "nav__menu", id: "nav-menu" }, linkList);

  const toggleBtn = el(
    "button",
    {
      className: "nav__toggle",
      "aria-label": "Open navigation menu",
      "aria-expanded": "false",
      "aria-controls": "nav-menu",
    },
    el("span", { className: "nav__toggle-bar", "aria-hidden": "true" }),
    el("span", { className: "nav__toggle-bar", "aria-hidden": "true" }),
    el("span", { className: "nav__toggle-bar", "aria-hidden": "true" }),
  );

  toggleBtn.addEventListener("click", () => {
    const open = menu.classList.toggle("nav__menu--open");
    toggleBtn.setAttribute("aria-expanded", String(open));
    toggleBtn.setAttribute(
      "aria-label",
      open ? "Close navigation menu" : "Open navigation menu",
    );
  });

  const inner = el(
    "div",
    { className: "nav__inner container" },
    logo,
    menu,
    toggleBtn,
  );

  return el(
    "nav",
    { className: "site-nav", "aria-label": "Main navigation" },
    inner,
  );
};

/* ── Footer ───────────────────────────────────────────────────────────────
 *
 * buildFooter(handle, socialLinks) → <div>
 */
const buildFooter = (handle, socialLinks) => {
  const year = new Date().getFullYear();

  const socialEls = socialLinks.map((link) =>
    el(
      "li",
      {},
      el(
        "a",
        {
          href: link.href,
          className: "footer__social-link",
          ...externalAttrs(link.href),
        },
        link.label,
      ),
    ),
  );

  return el(
    "div",
    { className: "footer__inner" },
    el(
      "p",
      { className: "footer__copy" },
      `© ${year} ${handle}. All rights reserved.`,
    ),
    el("ul", { className: "footer__social", role: "list" }, ...socialEls),
  );
};

/* ── Project Card ─────────────────────────────────────────────────────────
 *
 * buildProjectCard(project) → <article>
 */
const buildProjectCard = (project) => {
  const tagEls = project.tags.map((tag) => el("li", { className: "tag" }, tag));

  const linkEls = project.links.map((link) =>
    el(
      "a",
      {
        href: link.href,
        className: `btn ${link.primary ? "btn--primary" : "btn--ghost"}`,
        ...externalAttrs(link.href),
      },
      link.label,
    ),
  );

  // status string → CSS modifier key: 'In Progress' → 'in-progress'
  const statusKey = project.status.toLowerCase().replace(/\s+/g, "-");

  return el(
    "article",
    { className: "project-card", id: project.id },

    el(
      "header",
      { className: "project-card__header" },
      el(
        "span",
        { className: "project-card__number", "aria-hidden": "true" },
        project.number,
      ),
      el(
        "div",
        { className: "project-card__meta" },
        el("h3", { className: "project-card__title" }, project.title),
        el(
          "div",
          { className: "project-card__badges" },
          el(
            "span",
            { className: "badge badge--year" },
            el("span", { className: "sr-only" }, "Year: "),
            project.year,
          ),
          el(
            "span",
            { className: `badge badge--status badge--${statusKey}` },
            el("span", { className: "sr-only" }, "Status: "),
            project.status,
          ),
        ),
      ),
    ),

    el(
      "ul",
      {
        className: "project-card__tags",
        role: "list",
        "aria-label": "Technologies",
      },
      ...tagEls,
    ),
    el("p", { className: "project-card__desc" }, project.description),
    el("footer", { className: "project-card__footer" }, ...linkEls),
  );
};

/* ── About: bio paragraphs ────────────────────────────────────────────────
 *
 * buildBio(paragraphs) → DocumentFragment
 */
const buildBio = (paragraphs) => {
  const frag = document.createDocumentFragment();
  paragraphs.forEach((text) => frag.append(el("p", {}, text)));
  return frag;
};

/* ── About: timeline ──────────────────────────────────────────────────────
 *
 * buildTimelineEntry(entry) → <li>
 */
const buildTimelineEntry = (entry) =>
  el(
    "li",
    { className: "timeline__item" },
    el("span", { className: "timeline__year" }, entry.year),
    el("span", { className: "timeline__event" }, entry.event),
  );

/* ── Contact: social info panel ───────────────────────────────────────────
 *
 * buildContactInfo(socialLinks) → <div>
 */
const buildContactInfo = (socialLinks) => {
  const linkEls = socialLinks.map((link) =>
    el(
      "a",
      {
        href: link.href,
        className: "contact-social__link",
        ...externalAttrs(link.href),
      },
      link.label,
    ),
  );

  return el(
    "div",
    { className: "contact-info" },
    el(
      "div",
      { className: "contact-social-group" },
      el("p", { className: "contact-social__title" }, "Connect"),
      ...linkEls,
    ),
    el(
      "div",
      { className: "contact-social-group" },
      el("p", { className: "contact-social__title" }, "Note"),
      el(
        "p",
        { className: "contact-note" },
        "Form powered by ",
        el(
          "a",
          {
            href: "https://formspree.io",
            className: "contact-note__link",
            target: "_blank",
            rel: "noopener noreferrer",
          },
          "Formspree",
        ),
      ),
    ),
  );
};

/* ── Contact: form field ──────────────────────────────────────────────────
 *
 * buildFormField({ id, label, type, required, rows }) → <div>
 */
const buildFormField = ({
  id,
  label,
  type = "text",
  required = false,
  rows,
}) => {
  const labelEl = el(
    "label",
    { className: "form__label", for: id },
    label,
    required
      ? el(
          "span",
          { className: "form__required", "aria-label": "(required)" },
          " *",
        )
      : null,
  );

  const inputAttrs = {
    id,
    name: id,
    className: rows ? "form__input form__textarea" : "form__input",
    ...(required ? { required: "", "aria-required": "true" } : {}),
    "aria-describedby": `${id}-error`,
  };

  const inputEl = rows
    ? el("textarea", { ...inputAttrs, rows: String(rows) })
    : el("input", { ...inputAttrs, type });

  const errorEl = el("span", {
    id: `${id}-error`,
    className: "form__error",
    role: "alert",
    "aria-live": "assertive",
  });

  return el("div", { className: "form__field" }, labelEl, inputEl, errorEl);
};

/* ── Contact: full form ───────────────────────────────────────────────────
 *
 * buildContactForm(contactData) → <form>
 */
const buildContactForm = (contactData) => {
  const fields = [
    buildFormField({ id: "name", label: "Name", type: "text", required: true }),
    buildFormField({
      id: "email",
      label: "Email",
      type: "email",
      required: true,
    }),
    buildFormField({ id: "subject", label: "Subject", type: "text" }),
    buildFormField({
      id: "message",
      label: "Message",
      rows: 6,
      required: true,
    }),
  ];

  const statusEl = el("div", {
    id: "form-status",
    className: "form__status",
    role: "status",
    "aria-live": "polite",
    "aria-atomic": "true",
  });

  const submitBtn = el(
    "button",
    { type: "submit", className: "btn btn--primary btn--wide" },
    "Send Message",
  );

  const form = el(
    "form",
    {
      className: "contact-form",
      action: contactData.formAction,
      method: "POST",
      novalidate: "",
    },
    ...fields,
    submitBtn,
    statusEl,
  );

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    statusEl.textContent = "";
    statusEl.className = "form__status";

    try {
      const res = await fetch(contactData.formAction, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        form.reset();
        statusEl.textContent = "Message sent. I'll get back to you soon.";
        statusEl.classList.add("form__status--success");
      } else {
        throw new Error("non-ok response");
      }
    } catch {
      statusEl.textContent =
        "Something went wrong. Please try again or email me directly.";
      statusEl.classList.add("form__status--error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send Message";
    }
  });

  return form;
};

/* ── Form validation ──────────────────────────────────────────────────────
 *
 * validateForm(form) → boolean
 * Pure-ish: only writes to elements owned by the form argument.
 */
const validateForm = (form) => {
  const clearError = (id) => {
    const errEl = form.querySelector(`#${id}-error`);
    const inputEl = form.querySelector(`#${id}`);
    if (errEl) errEl.textContent = "";
    if (inputEl) inputEl.removeAttribute("aria-invalid");
  };

  const setError = (id, msg) => {
    const errEl = form.querySelector(`#${id}-error`);
    const inputEl = form.querySelector(`#${id}`);
    if (errEl) errEl.textContent = msg;
    if (inputEl) inputEl.setAttribute("aria-invalid", "true");
  };

  ["name", "email", "message"].forEach(clearError);

  const name = form.querySelector("#name")?.value.trim() ?? "";
  const email = form.querySelector("#email")?.value.trim() ?? "";
  const message = form.querySelector("#message")?.value.trim() ?? "";

  let valid = true;

  if (!name) {
    setError("name", "Please enter your name.");
    valid = false;
  }
  if (!email) {
    setError("email", "Please enter your email address.");
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setError("email", "Please enter a valid email address.");
    valid = false;
  }
  if (!message) {
    setError("message", "Please enter a message.");
    valid = false;
  }

  // Move focus to first error field
  if (!valid) {
    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    firstInvalid?.focus();
  }

  return valid;
};
