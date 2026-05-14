(function () {
  const DATA = window.DATA || {};

  const SECTIONS = [
    { id: "health",        label: "Health",            render: renderHealth },
    { id: "recent",        label: "Recent",            render: renderRecent },
    { id: "notifications", label: "Notifications",     render: renderNotifications },
    { id: "missing",       label: "Missing documents", render: renderMissing },
    { id: "suggested",     label: "Suggested",         render: renderSuggested },
    { id: "parties",       label: "Parties",           render: renderParties },
    { id: "categories",    label: "Categories",        render: renderCategories }
  ];

  const TONE_DOT = {
    success: "var(--accent-green)",
    warning: "var(--accent-amber)",
    danger:  "var(--accent-red)",
    neutral: "var(--text-tertiary)"
  };
  const TONE_FILL = { success: "", warning: "amber", danger: "red", neutral: "" };

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function pluralize(n, singular, plural) {
    return `${n} ${n === 1 ? singular : (plural || singular + "s")}`;
  }

  // ── Renderers ────────────────────────────────────────────────────────────

  function renderGreeting() {
    const greeting = DATA.meta?.greeting;
    if (!greeting) return "";
    return `<div class="page-greeting">${escapeHtml(greeting)}</div>`;
  }

  function renderCustomizePanel(visibleSections) {
    return `
      <div class="customize-panel" id="customize-panel">
        <div class="customize-header">
          <div>
            <div class="title">Customize sections</div>
            <div class="desc">Drag to reorder · toggle to show or hide</div>
          </div>
          <button id="reset-btn">Reset</button>
        </div>
        <div id="customize-toggles">
          ${visibleSections.map(s => `
            <div class="toggle-row" draggable="true">
              <div class="left">
                <span class="handle"><i class="ti ti-grip-vertical"></i></span>
                <span class="label">${escapeHtml(s.label)}</span>
              </div>
              <div class="toggle on" data-toggle="${s.id}"></div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  function renderHealth(d) {
    const dot  = TONE_DOT[d.tone]  || TONE_DOT.neutral;
    const fill = TONE_FILL[d.tone] || "";
    return `
      <div class="health-grid">
        <div class="health-l">
          <span class="eyebrow">Health</span>
          <div class="tier">
            <span class="tier-dot" style="background: ${dot};"></span>
            <span class="tier-text">${escapeHtml(d.tier)}</span>
          </div>
          <div class="why">${escapeHtml(d.why)}</div>
        </div>
        <div class="health-r">
          <div class="cov-head">
            <span class="eyebrow" style="margin-bottom: 0;">Coverage</span>
            <span class="cov-pct">${d.coverage}%</span>
          </div>
          <div class="progress"><div class="progress-fill ${fill}" style="width: ${d.coverage}%;"></div></div>
          <div class="why">${escapeHtml(d.coverageWhy)}</div>
          <a class="cov-cta" data-scroll-to="missing" href="#missing">View missing documents <i class="ti ti-arrow-narrow-down"></i></a>
        </div>
      </div>
    `;
  }

  function renderRecent(items) {
    return `
      <div class="section-head">
        <div class="section-title"><i class="ti ti-clock"></i>Recent</div>
        <button class="seeall">See all <i class="ti ti-arrow-right"></i></button>
      </div>
      <div class="items">
        ${items.map(i => `
          <div class="item${i.id ? " item-clickable" : ""}"${i.id ? ` data-file-id="${escapeHtml(i.id)}"` : ""}>
            <div class="item-left">
              <span class="item-text">${escapeHtml(i.name)}</span>
              ${i.status ? `<span class="badge badge-${escapeHtml(i.statusColor || "grey")}">${escapeHtml(i.status)}</span>` : ""}
            </div>
            <span class="muted">${escapeHtml(i.when)}</span>
          </div>
        `).join("")}
      </div>
    `;
  }

  function renderNotifications(d) {
    const items = d.items || [];
    const count = items.length;
    // Build a basename → file id lookup so notifications can open the
    // file panel for their related document on click.
    const fileLookup = {};
    (DATA.files || []).forEach(f => { if (f.file) fileLookup[f.file] = f.id; });
    return `
      <div class="section-head">
        <div class="section-title">
          <i class="ti ti-bell"></i>Notifications
          ${count > 0 ? `<span class="badge badge-red" style="margin-left: 4px;">${count}</span>` : ""}
        </div>
        <button class="seeall">See all <i class="ti ti-arrow-right"></i></button>
      </div>
      <div class="items">
        ${items.map(i => {
          const right = i.urgency === "amber"
            ? `<span style="font-size: 11px; color: var(--accent-amber);">${escapeHtml(i.when)}</span>`
            : i.urgency === "red"
            ? `<span style="font-size: 11px; color: var(--accent-red);">${escapeHtml(i.when)}</span>`
            : `<span class="muted">${escapeHtml(i.when)}</span>`;
          const fileId = i.relatedDocument && fileLookup[i.relatedDocument];
          const attrs = fileId
            ? ` class="item item-clickable" data-file-id="${escapeHtml(fileId)}"`
            : ` class="item"`;
          return `
            <div${attrs}>
              <div class="item-left"><span class="item-text">${escapeHtml(i.name)}</span></div>
              ${right}
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function dismissBtn() {
    return `<button class="icon-only ghost dismiss" title="Ignore"><i class="ti ti-x"></i></button>`;
  }

  function renderMissing(d) {
    const items = d.items || [];
    // Build basename → file id lookup so missing rows can open the panel
    // for their first related file.
    const fileLookup = {};
    (DATA.files || []).forEach(f => { if (f.file) fileLookup[f.file] = f.id; });
    return `
      <div class="section-head">
        <div class="section-title"><i class="ti ti-file-off"></i>Missing documents</div>
        <span class="muted">${pluralize(items.length, "item")}</span>
      </div>
      <div class="items">
        ${items.map((i, idx) => `
          <div class="item item-clickable" data-handoff="missing" data-handoff-index="${idx}">
            <div class="item-left">
              ${i.sub
                ? `<div><div class="item-text">${escapeHtml(i.name)}</div><div class="item-sub">${escapeHtml(i.sub)}</div></div>`
                : `<span class="item-text">${escapeHtml(i.name)}</span>`}
            </div>
            <div class="btn-group">
              <button class="icon-only ghost" title="Upload"><i class="ti ti-upload"></i></button>
              <button class="btn-chat-action" data-handoff="missing" data-handoff-index="${idx}"><i class="ti ti-message-circle"></i> Create</button>
              ${dismissBtn()}
            </div>
          </div>`).join("")}
      </div>
    `;
  }

  function renderSuggested(d) {
    const items = d.items || [];
    const fileLookup = {};
    (DATA.files || []).forEach(f => { if (f.file) fileLookup[f.file] = f.id; });
    return `
      <div class="section-head">
        <div class="section-title"><i class="ti ti-sparkles"></i>Suggested</div>
        <span class="muted">${pluralize(items.length, "item")}</span>
      </div>
      <div class="items">
        ${items.map((i, idx) => {
          const subBlock = i.sub
            ? `<div><div class="item-text">${escapeHtml(i.name)}</div><div class="item-sub">${escapeHtml(i.sub)}</div></div>`
            : `<span class="item-text">${escapeHtml(i.name)}</span>`;
          const tagBadge = i.tag
            ? `<span class="badge badge-${escapeHtml(i.tagColor || "grey")}">${escapeHtml(i.tag)}</span>`
            : "";
          const uploadBtn = i.upload
            ? `<button class="icon-only ghost" title="Upload"><i class="ti ti-upload"></i></button>`
            : "";
          const firstFile = (i.files || []).find(f => fileLookup[f]);
          const fileId = firstFile && fileLookup[firstFile];
          const attrs = fileId
            ? ` class="item item-clickable" data-file-id="${escapeHtml(fileId)}"`
            : ` class="item item-clickable" data-handoff="suggested" data-handoff-index="${idx}"`;
          return `
            <div${attrs}>
              <div class="item-left">
                ${subBlock}
                ${tagBadge}
              </div>
              <div class="btn-group">
                ${uploadBtn}
                <button class="btn-chat-action" data-handoff="suggested" data-handoff-index="${idx}"><i class="ti ti-message-circle"></i> ${escapeHtml(i.action || "Open")}</button>
                ${dismissBtn()}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderParties(d) {
    const items = d.items || [];
    return `
      <div class="section-head">
        <div>
          <div class="section-title"><i class="ti ti-users"></i>Parties</div>
          ${d.summary ? `<div class="muted" style="margin-top: 2px;">${escapeHtml(d.summary)}</div>` : ""}
        </div>
        <a class="seeall" href="parties.html">See all <i class="ti ti-arrow-right"></i></a>
      </div>
      <div class="g3">
        ${items.map(p => {
          const slug = String(p.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
          return `
          <a class="pcard" href="contact.html#${escapeHtml(slug)}" style="text-decoration:none;color:inherit;display:block;">
            <div class="pcard-h">
              <div class="pcard-i" style="background: ${escapeHtml(p.avatarBg)}; color: ${escapeHtml(p.avatarColor)};">${escapeHtml(p.initials)}</div>
              <div class="pcard-n">${escapeHtml(p.name)}</div>
            </div>
            ${p.tag ? `<div class="pcard-pills"><span class="badge badge-${escapeHtml(p.tagColor || "grey")}">${escapeHtml(p.tag)}</span></div>` : ""}
            ${(p.docs || []).map(doc => `<div class="pcard-doc"><span class="pcard-doc-n">${escapeHtml(doc)}</span></div>`).join("")}
          </a>`;
        }).join("")}
      </div>
    `;
  }

  function renderCategories(d) {
    const items = d.items || [];
    return `
      <div class="section-head">
        <div>
          <div class="section-title"><i class="ti ti-category-2"></i>Categories</div>
          ${d.summary ? `<div class="muted" style="margin-top: 2px;">${escapeHtml(d.summary)}</div>` : ""}
        </div>
        <a class="seeall" href="categories.html">See all <i class="ti ti-arrow-right"></i></a>
      </div>
      <div class="g3">
        ${items.map(c => {
          const slug = c.id || String(c.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
          return `
          <a class="cat" href="category.html#${escapeHtml(slug)}" style="text-decoration:none;color:inherit;">
            <div class="cat-i"><i class="ti ${escapeHtml(c.icon || "ti-folder")}"></i></div>
            <div class="cat-t">
              <div class="cat-n">${escapeHtml(c.name)}</div>
              <div class="cat-c">${pluralize(c.count, "contract")}</div>
            </div>
          </a>`;
        }).join("")}
      </div>
    `;
  }

  // ── Boot ─────────────────────────────────────────────────────────────────

  // Loading-state machinery — drives the Overview while file import runs.
  // Sections reveal progressively; each one transitions from skeleton to
  // its real content after a staggered delay.
  let overviewLoading = false;
  let loadedSectionIds = new Set();
  let justResolvedIds = new Set();
  let progressiveTimers = [];
  const LOADING_SECTIONS = [
    { id: "action",     title: "Action needed",            sub: "Contracts that need your attention will show up here" },
    { id: "missing",    title: "Missing documents",        sub: "Identifying missing contracts from your records" },
    { id: "stale",      title: "Stale documents",          sub: "Detecting contracts inactive for too long" },
    { id: "parties",    title: "Parties",                  sub: "Matching parties across your contract corpus" },
    { id: "flagged",    title: "Flagged for review",       sub: "Surfacing risks we've identified" },
    { id: "recent",     title: "Recent files",             sub: "Indexing your most recent contracts" },
    { id: "categories", title: "Your contract categories", sub: "Grouping contracts by category" }
  ];

  function setOverviewLoading(state) {
    overviewLoading = !!state;
    progressiveTimers.forEach(t => clearTimeout(t));
    progressiveTimers = [];
    loadedSectionIds = new Set();
    justResolvedIds = new Set();

    if (overviewLoading) {
      // Stagger section completions so they resolve in order during the
      // ~15-second import window. ~1.7s gap between each (last one ~13s).
      LOADING_SECTIONS.forEach((s, idx) => {
        const t = setTimeout(() => {
          if (!overviewLoading) return;
          loadedSectionIds.add(s.id);
          justResolvedIds.add(s.id);
          renderApp();
          // Clear the just-resolved flag after the tick animation completes
          // so future renders don't replay it.
          const clearT = setTimeout(() => { justResolvedIds.delete(s.id); }, 1400);
          progressiveTimers.push(clearT);
        }, 1500 + idx * 1700);
        progressiveTimers.push(t);
      });
    }

    renderApp();
  }

  function renderApp() {
    const root = document.getElementById("root");
    if (!root) return;

    if (overviewLoading) {
      root.innerHTML = renderLoadingState();
      wirePersistent();
      return;
    }

    const visibleSections = SECTIONS.filter(s => DATA[s.id] !== undefined);

    const BOXED = new Set(["health"]);
    const sectionHtml = visibleSections.map(s =>
      `<div class="section${BOXED.has(s.id) ? " boxed" : ""}" data-section="${s.id}">${s.render(DATA[s.id])}</div>`
    ).join("");

    root.innerHTML =
      renderGreeting() +
      renderCustomizePanel(visibleSections) +
      sectionHtml;

    wireEvents();
  }

  // ── Loading skeletons (rendered while file import is in progress) ──
  function renderLoadingState() {
    const doneCount = loadedSectionIds.size;
    const totalCount = LOADING_SECTIONS.length;
    const allDone = doneCount === totalCount;

    const banner = `
      <div class="import-status ${allDone ? "import-status-done" : ""}">
        <span class="import-status-icon">
          ${allDone ? `<i class="ti ti-circle-check"></i>` : `<i class="ti ti-loader-2 up-spinning"></i>`}
        </span>
        <div class="import-status-text">
          <div class="import-status-title">
            ${allDone ? "Import complete" : "Importing your contracts"}
          </div>
          <div class="import-status-sub">
            ${allDone
              ? `All ${totalCount} sections ready — filling the overview in below.`
              : `Filling in the overview as documents are processed · ${doneCount}/${totalCount} sections ready`}
          </div>
        </div>
      </div>`;

    const sectionHtml = LOADING_SECTIONS.map(s => {
      const isDone = loadedSectionIds.has(s.id);
      if (isDone) return renderResolvedSection(s);
      return renderSkeletonSection(s);
    });

    // First two pairs go in a 2-col grid (Missing + Stale)
    // For simplicity keep them stacked — readable on any width.
    return banner + sectionHtml.join("");
  }

  function renderSkeletonSection(s) {
    const head = `
      <div class="ld-head">
        <span class="ld-spinner"><i class="ti ti-loader-2"></i></span>
        <div>
          <div class="ld-title">${escapeHtml(s.title)}</div>
          <div class="ld-sub">${escapeHtml(s.sub)}</div>
        </div>
      </div>`;
    let body;
    if (s.id === "parties") {
      const pcard = `
        <div class="ld-pcard">
          <div class="ld-pcard-head"><span class="skel-block"></span><span class="skel-line skel-line-name"></span></div>
          <div class="ld-pcard-body">
            <span class="skel-line skel-line-thin"></span>
            <span class="skel-line skel-line-thin"></span>
            <span class="skel-line skel-line-thin"></span>
          </div>
        </div>`;
      body = `<div class="g3">${pcard}${pcard}${pcard}</div>`;
    } else {
      body = `<div class="ld-row"><span class="skel-block"></span><span class="skel-line"></span></div>`;
    }
    return `<div class="section ld-section">${head}${body}</div>`;
  }

  function renderResolvedSection(s) {
    // Render the real section content directly — no extra "done" header.
    // The single source of truth for the section header is the section's
    // own renderer. Newly-resolved sections get a brief tick-flash overlay
    // via the .section-just-resolved class.
    let body = "";
    switch (s.id) {
      case "missing":    body = DATA.missing    ? renderMissing(DATA.missing)       : completeEmpty("No missing documents detected"); break;
      case "parties":    body = DATA.parties    ? renderParties(DATA.parties)       : completeEmpty("No parties extracted"); break;
      case "flagged":    body = DATA.suggested  ? renderSuggested(DATA.suggested)   : completeEmpty("No items flagged"); break;
      case "recent":     body = DATA.recent     ? renderRecent(DATA.recent)         : completeEmpty("No recent files"); break;
      case "categories": body = DATA.categories ? renderCategories(DATA.categories) : completeEmpty("No categories"); break;
      case "action":     body = DATA.notifications ? renderNotifications(DATA.notifications) : completeEmpty("No urgent actions"); break;
      case "stale":      body = completeEmpty("No stale documents detected"); break;
      default:           body = completeEmpty("Ready");
    }
    const flash = justResolvedIds.has(s.id) ? " section-just-resolved" : "";
    return `<div class="section${flash}" data-section="${s.id}">${body}</div>`;
  }

  function completeEmpty(msg) {
    return `<div class="ld-complete-empty"><i class="ti ti-check"></i>${escapeHtml(msg)}</div>`;
  }

  // Persistent event handlers — modals + upload progress live in static
  // markup that doesn't get re-rendered, so they only need to wire once.
  let persistentWired = false;
  function wirePersistent() {
    if (persistentWired) return;
    persistentWired = true;
    wireHandoffModal();
    wireOnboardingModal();
    wireUploadProgress();
  }

  function wireEvents() {
    const customizeBtn = document.getElementById("customize-btn");
    const customizePanel = document.getElementById("customize-panel");
    const togglesContainer = document.getElementById("customize-toggles");

    customizeBtn.addEventListener("click", () => customizePanel.classList.toggle("open"));

    document.querySelectorAll("[data-toggle]").forEach(el => {
      el.addEventListener("click", () => {
        const section = el.dataset.toggle;
        const target = document.querySelector(`[data-section="${section}"]`);
        el.classList.toggle("on");
        if (target) target.classList.toggle("hidden");
      });
    });

    const originalOrder = [...togglesContainer.querySelectorAll(".toggle-row")].map(r => {
      const t = r.querySelector("[data-toggle]");
      return t ? t.dataset.toggle : null;
    }).filter(Boolean);

    function syncSectionOrder() {
      const order = [...togglesContainer.querySelectorAll(".toggle-row")].map(r => {
        const t = r.querySelector("[data-toggle]");
        return t ? t.dataset.toggle : null;
      }).filter(Boolean);
      const sections = order.map(s => document.querySelector(`[data-section="${s}"]`)).filter(Boolean);
      if (!sections.length) return;
      const parent = sections[0].parentNode;
      sections.forEach(s => parent.appendChild(s));
    }

    document.getElementById("reset-btn").addEventListener("click", () => {
      document.querySelectorAll("[data-toggle]").forEach(el => {
        el.classList.add("on");
        const section = el.dataset.toggle;
        const target = document.querySelector(`[data-section="${section}"]`);
        if (target) target.classList.remove("hidden");
      });
      originalOrder.forEach(name => {
        const toggleEl = togglesContainer.querySelector(`[data-toggle="${name}"]`);
        const row = toggleEl ? toggleEl.closest(".toggle-row") : null;
        if (row) togglesContainer.appendChild(row);
      });
      syncSectionOrder();
    });

    document.querySelectorAll("button.dismiss").forEach(btn => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".item");
        if (!item) return;
        item.classList.add("dismissing");
        setTimeout(() => item.remove(), 200);
      });
    });

    let dragging = null;
    document.querySelectorAll(".toggle-row").forEach(row => {
      row.addEventListener("dragstart", e => {
        dragging = row;
        row.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
      });
      row.addEventListener("dragend", () => {
        row.classList.remove("dragging");
        dragging = null;
        syncSectionOrder();
      });
    });

    // Smooth-scroll links from coverage → missing documents section
    document.querySelectorAll("[data-scroll-to]").forEach(el => {
      el.addEventListener("click", e => {
        e.preventDefault();
        const id = el.dataset.scrollTo;
        const target = document.querySelector(`[data-section="${id}"]`);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    togglesContainer.addEventListener("dragover", e => {
      e.preventDefault();
      if (!dragging) return;
      const rows = [...togglesContainer.querySelectorAll(".toggle-row:not(.dragging)")];
      const after = rows.find(r => {
        const box = r.getBoundingClientRect();
        return e.clientY < box.top + box.height / 2;
      });
      if (after) togglesContainer.insertBefore(dragging, after);
      else togglesContainer.appendChild(dragging);
    });

    wirePersistent();
  }

  // ── Upload progress simulation (live-fill UX) ──────────────────────
  // Three stages, mirroring the real memory-extraction pipeline:
  //   1) Per-document summaries (23 contracts)
  //   2) Memory promotion (contacts, playbooks, reminders)
  //   3) Cross-corpus analysis (health, coverage, conflicts)
  // Auto-hides after 15s in any state.
  function wireUploadProgress() {
    const panel    = document.getElementById("upload-progress");
    const list     = document.getElementById("upload-progress-list");
    const title    = document.getElementById("upload-progress-title");
    const count    = document.getElementById("upload-progress-count");
    const collapse = document.getElementById("upload-progress-collapse");
    const expand   = document.getElementById("upload-progress-expand");
    const uploadBtn = document.querySelector(".onb-upload");
    const onboardingBackdrop = document.getElementById("onboarding-backdrop");
    if (!panel || !uploadBtn) return;

    // The 23 contracts in the corpus (cleaned filenames).
    const CONTRACTS = [
      "Allrecipes Contract — FINAL 2014",
      "Whisk × BBC Good Food publisher",
      "Milica Stojic consultancy agreement",
      "Claire Powell option agreement (v2)",
      "Foodient org chart (May 2014)",
      "Mutual NDA — Great British Chefs",
      "Mutual NDA — Recip.ly / Foodity",
      "Claire Powell employment contract",
      "Whisk × McCormick collaboration",
      "EU Trade Mark — \"Whisk\"",
      "Oliver Mason employment contract",
      "Loan Note Certificate",
      "Matthew Hines employment contract",
      "Mutual NDA — Dr Jenny Kabir",
      "Anthony Herron option agreement",
      "UK Trade Mark — \"Whisk\"",
      "Foodient certificate of incorporation",
      "Foodient memorandum of association",
      "UK Trade Mark scan",
      "Mutual NDA — Callcredit Information Group",
      "EALP Quasi-Equity (Jan 2013)",
      "Foodient Articles of Association (2013)",
      "Whisk Subscription Agreement (12 Jun 2012)"
    ];

    // Stage 2: memory promotion sub-steps
    const STAGE_2_ITEMS = [
      "Identifying counterparties (24 contacts)",
      "Building per-category playbooks (9 categories)",
      "Writing general posture playbook",
      "Computing renewal reminders & action dates"
    ];

    // Stage 3: cross-corpus analysis sub-steps
    const STAGE_3_ITEMS = [
      "Detecting missing foundational documents",
      "Reconciling cross-file conflicts",
      "Calculating corpus coverage",
      "Surfacing flagged risks & suggestions"
    ];

    let running = false;
    let hideTimer = null;
    let items = [];

    const show = (el) => { el.hidden = false; el.style.display = ""; };
    const hide = (el) => { el.hidden = true;  el.style.display = "none"; };

    const renderList = () => {
      list.innerHTML = items.map((f, i) => {
        let iconHtml = "";
        let cls = "up-queued";
        if (f.status === "processing") {
          iconHtml = `<i class="ti ti-loader-2 up-spinning"></i>`;
          cls = "up-processing";
        } else if (f.status === "done") {
          iconHtml = `<i class="ti ti-check"></i>`;
          cls = "up-done";
        }
        return `
          <div class="up-file ${cls}" data-up-idx="${i}">
            <span class="up-file-name">${escapeHtml(f.name)}</span>
            <span class="up-file-status">${iconHtml}</span>
          </div>`;
      }).join("");
      // Keep the active row in view as the pipeline progresses
      const active = list.querySelector(".up-file.up-processing");
      if (active && typeof active.scrollIntoView === "function") {
        active.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    };

    // Advance a single item from queued → processing → done after the given
    // delay, then resolve. Used to chain stages sequentially.
    const advance = (idx, perItemMs) => new Promise(resolve => {
      items[idx].status = "processing";
      renderList();
      setTimeout(() => {
        items[idx].status = "done";
        renderList();
        resolve();
      }, perItemMs);
    });

    const startProgress = async () => {
      if (running) { show(panel); hide(expand); return; }
      running = true;

      // Flip the overview to skeleton/loading sections while extraction runs.
      setOverviewLoading(true);

      // ── Stage 1 — Document summaries (23 contracts) ──
      title.textContent = "Reading contracts";
      items = CONTRACTS.map(name => ({ name, status: "queued", stage: 1 }));
      count.textContent = `0/${CONTRACTS.length}`;
      show(panel); hide(expand);
      renderList();

      // Schedule the 15-second auto-hide right at the start
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        hide(panel); hide(expand);
        running = false;
        setOverviewLoading(false);
      }, 15000);

      const stage1Per = 320; // ms — 23 × 320 ≈ 7.4s
      for (let i = 0; i < items.length; i++) {
        await advance(i, stage1Per);
        count.textContent = `${items.filter(x => x.status === "done").length}/${CONTRACTS.length}`;
      }

      // ── Stage 2 — Memory promotion ──
      title.textContent = "Building your legal memory";
      const stage1End = items.length;
      STAGE_2_ITEMS.forEach(name => items.push({ name, status: "queued", stage: 2 }));
      count.textContent = "";
      renderList();
      const stage2Per = 600; // ms — 4 × 600 ≈ 2.4s
      for (let i = stage1End; i < items.length; i++) {
        await advance(i, stage2Per);
      }

      // ── Stage 3 — Cross-corpus analysis ──
      title.textContent = "Reviewing your corpus";
      const stage2End = items.length;
      STAGE_3_ITEMS.forEach(name => items.push({ name, status: "queued", stage: 3 }));
      renderList();
      const stage3Per = 500; // ms — 4 × 500 ≈ 2s
      for (let i = stage2End; i < items.length; i++) {
        await advance(i, stage3Per);
      }

      // ── Done ──
      title.textContent = `Added ${CONTRACTS.length} contracts to memory`;
      count.textContent = "";
      renderList();
    };

    uploadBtn.addEventListener("click", () => {
      if (onboardingBackdrop) {
        onboardingBackdrop.hidden = true;
        onboardingBackdrop.style.display = "none";
      }
      startProgress();
    });

    collapse.addEventListener("click", () => { hide(panel); show(expand); });
    expand.addEventListener("click", () => { show(panel); hide(expand); });
  }

  // ── Onboarding modal (Figma node 2570:34623) ───────────────────────
  function wireOnboardingModal() {
    const btn      = document.getElementById("onboarding-btn");
    const backdrop = document.getElementById("onboarding-backdrop");
    const close    = document.getElementById("onboarding-close");
    const skip     = document.getElementById("onboarding-skip");
    if (!btn || !backdrop) return;

    const open  = () => { backdrop.hidden = false; backdrop.style.display = ""; };
    const shut  = () => { backdrop.hidden = true;  backdrop.style.display = "none"; };

    btn.addEventListener("click", open);
    close && close.addEventListener("click", shut);
    skip  && skip.addEventListener("click", shut);
    backdrop.addEventListener("click", e => { if (e.target === backdrop) shut(); });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && !backdrop.hidden) shut();
    });

    // Third-party Connect buttons: surface a "rolling out gradually" state
    // with a Notify me opt-in. Click Notify me → confirmation pill.
    backdrop.querySelectorAll(".onb-connect").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const card = btn.closest(".onb-source");
        if (!card) return;
        const name = (card.querySelector(".onb-source-name") || {}).textContent || "This integration";
        card.classList.add("onb-source-rollout");
        card.innerHTML = `
          <div class="onb-source-icon" style="color: var(--purple);"><i class="ti ti-info-circle"></i></div>
          <div class="onb-source-text">
            <div class="onb-source-name">${escapeHtml(name)} — coming soon</div>
            <div class="onb-source-desc">Rolling out gradually</div>
          </div>
          <button class="onb-notify">Notify me</button>
        `;
        const notifyBtn = card.querySelector(".onb-notify");
        notifyBtn.addEventListener("click", () => {
          card.classList.remove("onb-source-rollout");
          card.classList.add("onb-source-notified");
          card.innerHTML = `
            <div class="onb-source-icon" style="color: var(--accent-green);"><i class="ti ti-check"></i></div>
            <div class="onb-source-text">
              <div class="onb-source-name">You're on the list</div>
              <div class="onb-source-desc">We'll email when ${escapeHtml(name)} is available</div>
            </div>
          `;
        });
      });
    });
  }

  // ── Chat handoff modal (Files Index AC-41) ──────────────────────────
  function wireHandoffModal() {
    const backdrop = document.getElementById("handoff-backdrop");
    if (!backdrop) return;
    const titleEl   = document.getElementById("handoff-title");
    const eyebrowEl = document.getElementById("handoff-eyebrow");
    const filesEl   = document.getElementById("handoff-files");
    const contactsEl = document.getElementById("handoff-contacts");
    const contactsSection = document.getElementById("handoff-contacts-section");
    const promptEl  = document.getElementById("handoff-prompt");

    const open = (item, kind) => {
      titleEl.textContent = item.name || "Untitled action";
      eyebrowEl.textContent = `Chat handoff · ${kind === "missing" ? "Create missing document" : (item.action || "Action")}`;

      // Files attached
      const files = Array.isArray(item.files) ? item.files : [];
      filesEl.innerHTML = files.length
        ? files.map(f => `<span class="chip-attach"><i class="ti ti-file-text"></i>${escapeHtml(f)}</span>`).join("")
        : `<span class="chip-attach chip-attach-empty"><i class="ti ti-circle-dashed"></i>No files yet</span>`;

      // Contacts attached
      const contacts = Array.isArray(item.contacts) ? item.contacts : [];
      if (contacts.length) {
        contactsSection.hidden = false;
        contactsEl.innerHTML = contacts.map(c => `<span class="chip-attach"><i class="ti ti-user"></i>${escapeHtml(c)}</span>`).join("");
      } else {
        contactsSection.hidden = true;
        contactsEl.innerHTML = "";
      }

      // Prompt — fall back to a synthesised default if none provided
      promptEl.value = item.prompt
        || (kind === "missing"
              ? `Please draft a ${item.name || "document"} for me.\n\nWhy we need it: ${item.sub || ""}`
              : `Help me ${(item.action || "resolve").toLowerCase()}: ${item.name || ""}.\n\nContext: ${item.sub || ""}`);

      backdrop.hidden = false;
      backdrop.style.display = "";
      setTimeout(() => promptEl.focus(), 0);
    };

    const close = () => {
      backdrop.hidden = true;
      backdrop.style.display = "none";
    };

    document.body.addEventListener("click", (e) => {
      // Dismiss buttons handle their own action — don't fire the handoff modal.
      if (e.target.closest("button.dismiss")) return;
      const btn = e.target.closest("[data-handoff]");
      if (!btn) return;
      const kind = btn.dataset.handoff;
      const idx  = parseInt(btn.dataset.handoffIndex, 10);
      const items = (DATA[kind] && DATA[kind].items) || [];
      const item = items[idx];
      if (item) open(item, kind);
    });

    document.getElementById("handoff-close").addEventListener("click", close);
    document.getElementById("handoff-cancel").addEventListener("click", close);
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !backdrop.hidden) close();
    });
    document.getElementById("handoff-send").addEventListener("click", () => {
      const sendBtn = document.getElementById("handoff-send");
      const original = sendBtn.innerHTML;
      sendBtn.innerHTML = `<i class="ti ti-check"></i> Sent (illustrative)`;
      sendBtn.disabled = true;
      setTimeout(() => {
        sendBtn.innerHTML = original;
        sendBtn.disabled = false;
        close();
      }, 800);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderApp);
  } else {
    renderApp();
  }
})();
