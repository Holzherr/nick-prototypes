// Shared renderer for the data-driven non-overview pages.
// Each page sets <body data-page="..."> and includes:
//   <script src="data.js"></script><script src="pages.js"></script>

(function () {
  const DATA = window.DATA || {};
  const FILES    = Array.isArray(DATA.files)    ? DATA.files    : [];
  const CONTACTS = Array.isArray(DATA.contacts) ? DATA.contacts : [];
  const STATUS_GROUPS = DATA.statusGroups || { draft: [], "under-review": [], executed: [], "needs-attention": [] };

  // Lookup: file basename → id (used to navigate the panel from a reminder
  // whose `relatedDocument` is a different file from the one currently open).
  const FILE_BY_BASENAME = {};
  FILES.forEach(f => { if (f.file) FILE_BY_BASENAME[f.file] = f.id; });

  // ── User-company detection ────────────────────────────────────────
  // Names of organisations marked is_user_company anywhere in the corpus.
  // Used to filter user-company signatories out of counterparty People tabs.
  const USER_COMPANY_NAMES = (() => {
    const set = new Set();
    FILES.forEach(f => (f.primaryParties || []).forEach(p => {
      if (p && p.is_user_company && p.name) set.add(String(p.name));
    }));
    return set;
  })();
  // Names of user-side signatories — built from two passes:
  //  (a) Contacts whose organization matches a user company, plus their aliases.
  //  (b) other-named-parties anywhere in the corpus whose role/appears_in
  //      explicitly mentions a user-company name. This catches mis-tagged
  //      signatories: a name extracted as "signatory for Recip.ly" in one
  //      file but as "signatory for Foodient Ltd" in another lands here
  //      because of the second occurrence.
  const USER_PEOPLE_NAMES = new Set();
  CONTACTS
    .filter(c => c && c.entityType === "person" && c.organization && USER_COMPANY_NAMES.has(c.organization))
    .forEach(c => {
      if (c.name) USER_PEOPLE_NAMES.add(c.name);
      (c.aliases || []).forEach(a => a && USER_PEOPLE_NAMES.add(a));
    });
  FILES.forEach(f => (f.otherNamedParties || []).forEach(p => {
    if (!p || !p.name) return;
    const text = String((p.role || "") + " " + (p.appears_in || ""));
    for (const userOrg of USER_COMPANY_NAMES) {
      if (text.includes(userOrg)) { USER_PEOPLE_NAMES.add(p.name); break; }
    }
  }));

  // ── helpers ────────────────────────────────────────────────────────
  const escapeHtml = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmtMoney = (v) => {
    if (!v || typeof v !== "object") return "";
    const sym = ({ GBP: "£", USD: "$", EUR: "€" })[v.currency] || (v.currency ? v.currency + " " : "");
    const amt = v.amount != null ? v.amount.toLocaleString() : "";
    const cadMap = { annual: "yr", monthly: "mo", "one-time": "" };
    const cadKey = v.cadence ? (cadMap[v.cadence] != null ? cadMap[v.cadence] : v.cadence) : "";
    const cad = cadKey ? "/" + cadKey : "";
    return amt ? `${sym}${amt}${cad}` : "";
  };
  const STATUS_META = {
    draft:             { label: "Draft",           cls: "badge-grey",  dot: "kdot-grey" },
    "under-review":    { label: "Under review",    cls: "badge-amber", dot: "kdot-amber" },
    executed:          { label: "Executed",        cls: "badge-green", dot: "kdot-green" },
    "needs-attention": { label: "Needs attention", cls: "badge-red",   dot: "kdot-red" }
  };
  const statusBadge = (s) => {
    const m = STATUS_META[s];
    return m ? `<span class="badge ${m.cls}">${m.label}</span>` : "";
  };
  const flagBadge = (f) => {
    if (!f || !f.note) return "";
    const sev = f.severity || "warn";
    const cls = sev === "high" ? "badge-red" : sev === "info" ? "badge-blue" : "badge-amber";
    return `<span class="badge ${cls}">${escapeHtml(f.note)}</span>`;
  };
  const expiryMeta = (f) => {
    if (!f.expiryDate) return "";
    const ms = Date.parse(f.expiryDate);
    if (isNaN(ms)) return "";
    const days = Math.round((ms - Date.now()) / 86400000);
    if (days < 0) return `Expired ${Math.abs(days)}d ago`;
    if (days < 90) return `Expires in ${days}d`;
    return new Date(ms).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };
  const fileMeta = (f) => {
    const bits = [];
    if (f.value) { const m = fmtMoney(f.value); if (m) bits.push(m); }
    if (f.expiryDate) {
      const e = expiryMeta(f);
      if (e) bits.push(e);
    } else if (f.executionDate) {
      bits.push("Signed " + (f.executionDate || "").slice(0, 4));
    }
    return bits.join(" · ");
  };
  const empty = (title, sub) => `
    <div class="empty-state">
      <i class="ti ti-folder-off"></i>
      <div class="empty-title">${escapeHtml(title)}</div>
      <div class="empty-sub">${escapeHtml(sub)}</div>
    </div>`;

  function fileRow(f) {
    const partyHtml = f.primaryPartyName
      ? `<a href="contact.html#${escapeHtml(f.primaryPartyId)}">${escapeHtml(f.primaryPartyName)}</a>`
      : "";
    const flagsHtml = (f.flags || []).slice(0, 1).map(flagBadge).join("");
    const subBits = [];
    if (f.category) subBits.push(escapeHtml(f.category));
    if (partyHtml)  subBits.push(partyHtml);
    return `
      <div class="file-row" data-file-id="${escapeHtml(f.id)}">
        <div class="row-icon"><i class="ti ti-file-text"></i></div>
        <div class="row-main">
          <div class="row-title">
            <span class="row-title-text">${escapeHtml(f.title)}</span>
            ${statusBadge(f.status)}
            ${flagsHtml}
          </div>
          <div class="row-sub">${subBits.join(" · ")}</div>
        </div>
        <div class="row-meta">${escapeHtml(fileMeta(f))}</div>
        <button class="row-star"><i class="ti ti-star"></i></button>
      </div>`;
  }

  // ── all-files ──────────────────────────────────────────────────────
  function renderAllFiles() {
    const root = document.getElementById("all-files-root");
    if (!root) return;
    const headerCount = document.getElementById("all-files-count");
    if (headerCount) headerCount.textContent = `${FILES.length} document${FILES.length === 1 ? "" : "s"}`;
    if (!FILES.length) {
      root.innerHTML = empty("No files extracted yet", "Re-run extraction to populate this list.");
      return;
    }
    root.innerHTML = `<div class="file-list">${FILES.map(fileRow).join("")}</div>`;
  }

  // ── parties ────────────────────────────────────────────────────────
  function renderParties() {
    const root = document.getElementById("parties-root");
    if (!root) return;
    if (!CONTACTS.length) {
      root.innerHTML = empty("No parties extracted yet", "Re-run extraction to populate this list.");
      return;
    }
    const cardHtml = (c) => {
      const tag = (c.tags && c.tags[0]) || "Counterparty";
      const tagsHtml = (c.tags && c.tags.length)
        ? c.tags.slice(0, 3).map(t => `<span class="badge badge-grey">${escapeHtml(t)}</span>`).join("")
        : `<span class="badge badge-grey">${escapeHtml(tag)}</span>`;
      const docsHtml = (c.docs || []).slice(0, 4).map((d, i) => `
        <div class="pc-doc${i >= 3 ? " muted-row" : ""}">
          <div class="pc-doc-name"><i class="ti ti-file-text"></i><span class="pc-doc-text">${escapeHtml(d.title)}</span></div>
          ${d.status ? statusBadge(d.status) : ""}
        </div>
      `).join("");
      return `
        <a class="party-card" href="contact.html#${escapeHtml(c.id)}">
          <div class="pc-head">
            <div class="pc-avatar" style="background:${c.avatarBg};color:${c.avatarColor};">${escapeHtml(c.initials)}</div>
            <div class="pc-name">${escapeHtml(c.name)}</div>
            <div class="pc-count">${c.fileCount}</div>
          </div>
          <div class="pc-tags">${tagsHtml}</div>
          ${docsHtml}
        </a>`;
    };
    root.innerHTML = `<div class="party-grid">${CONTACTS.map(cardHtml).join("")}</div>`;

    // Auto-generated subtabs filtered by primary tag
    const tabsEl = document.getElementById("party-tabs");
    if (tabsEl) wireSubtabs(tabsEl, root);
  }

  function wireSubtabs(tabsEl, gridRoot) {
    const cards = Array.from(gridRoot.querySelectorAll(".party-card"));
    const slug = s => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const pluralize = (n, label) => {
      if (n <= 1) return label;
      if (/y$/i.test(label)) return label.slice(0, -1) + "ies";
      if (/(s|x|ch|sh)$/i.test(label)) return label + "es";
      if (/ing$/i.test(label)) return label;
      return label + "s";
    };
    cards.forEach(card => {
      const firstBadge = card.querySelector(".pc-tags .badge");
      const text = firstBadge ? firstBadge.textContent.trim() : "Other";
      card.dataset.category = slug(text);
      card.dataset.categoryLabel = text;
    });
    const counts = {}, labels = {};
    cards.forEach(c => {
      counts[c.dataset.category] = (counts[c.dataset.category] || 0) + 1;
      labels[c.dataset.category] = c.dataset.categoryLabel;
    });
    const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || labels[a].localeCompare(labels[b]));
    const tabs = [{ slug: "all", label: "All", count: cards.length }]
      .concat(sorted.map(s => ({ slug: s, label: pluralize(counts[s], labels[s]), count: counts[s] })));
    tabsEl.innerHTML = tabs.map((t, i) =>
      `<button class="subtab${i === 0 ? " active" : ""}" data-filter="${t.slug}">${escapeHtml(t.label)}</button>`).join("");
    tabsEl.querySelectorAll(".subtab").forEach(btn => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.filter;
        tabsEl.querySelectorAll(".subtab").forEach(b => b.classList.toggle("active", b === btn));
        cards.forEach(card => {
          card.style.display = (target === "all" || card.dataset.category === target) ? "" : "none";
        });
      });
    });
  }

  // ── categories ─────────────────────────────────────────────────────
  function renderCategories() {
    const root = document.getElementById("categories-root");
    if (!root) return;
    if (!FILES.length) {
      root.innerHTML = empty("No files extracted yet", "Re-run extraction to populate categories.");
      return;
    }
    const groups = new Map();
    FILES.forEach(f => {
      const k = f.category || "Other";
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(f);
    });
    const sorted = [...groups.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
    root.innerHTML = sorted.map(([name, items]) => {
      const slug = String(name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      return `
      <div class="section">
        <div class="section-head">
          <div>
            <a class="section-title" href="category.html#${escapeHtml(slug)}" style="text-decoration:none;">${escapeHtml(name)}</a>
            <div class="section-sub">${items.length} document${items.length === 1 ? "" : "s"} in this category</div>
          </div>
          <a class="seeall" href="category.html#${escapeHtml(slug)}">Open <i class="ti ti-arrow-right"></i></a>
        </div>
        <div class="file-list">${items.map(fileRow).join("")}</div>
      </div>
    `;}).join("");
  }

  // ── status (kanban) ────────────────────────────────────────────────
  function renderStatus() {
    const root = document.getElementById("status-root");
    if (!root) return;
    if (!FILES.length) {
      root.innerHTML = empty("No files extracted yet", "Re-run extraction to populate the status board.");
      return;
    }
    const cols = [
      { key: "draft",            label: "Draft",           dot: "kdot-grey"  },
      { key: "under-review",     label: "Under review",    dot: "kdot-amber" },
      { key: "executed",         label: "Executed",        dot: "kdot-green" },
      { key: "needs-attention",  label: "Needs attention", dot: "kdot-red"   }
    ];
    const card = (f) => {
      const partyHtml = f.primaryPartyName
        ? `<a href="contact.html#${escapeHtml(f.primaryPartyId)}">${escapeHtml(f.primaryPartyName)}</a>`
        : "";
      const meta = (f.status === "needs-attention")
        ? expiryMeta(f) || (f.flags && f.flags[0] && f.flags[0].note) || ""
        : fileMeta(f) || (f.flags && f.flags.length ? `${f.flags.length} AI flag${f.flags.length === 1 ? "" : "s"}` : "");
      const initials = (f.primaryPartyName || "??").split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase().slice(0, 2);
      const isAlert = f.status === "needs-attention";
      const palette = avatarPaletteFor(f.primaryPartyId);
      return `
        <div class="kcard${isAlert ? " alert" : ""}" data-file-id="${escapeHtml(f.id)}">
          <div class="kcard-title">${escapeHtml(f.title)}${partyHtml ? " — " + partyHtml : ""}</div>
          <div class="kcard-meta">${escapeHtml(meta)}</div>
          <span class="kcard-avatar" style="background:${palette.bg};color:${palette.fg};">${escapeHtml(initials)}</span>
        </div>`;
    };
    root.innerHTML = cols.map(c => {
      const items = STATUS_GROUPS[c.key] || [];
      return `
        <section class="kanban-col">
          <div class="kanban-col-head">
            <span class="kdot ${c.dot}"></span>
            <span class="kname">${c.label}</span>
            <span class="kcount">${items.length}</span>
          </div>
          ${items.map(card).join("")}
        </section>`;
    }).join("");
  }

  const PALETTES = [
    { bg: "#CECBF6", fg: "#26215C" },
    { bg: "#9FE1CB", fg: "#04342C" },
    { bg: "#F5C4B3", fg: "#4A1B0C" },
    { bg: "#BFE2FF", fg: "#0C447C" },
    { bg: "#FFE3A6", fg: "#5A3A06" },
    { bg: "#D7B9F0", fg: "#3B1A66" }
  ];
  function avatarPaletteFor(id) {
    if (!id) return PALETTES[0];
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
    return PALETTES[h % PALETTES.length];
  }

  // ── contact (drill-down view) ──────────────────────────────────────
  function renderContact() {
    const id = (location.hash || "").slice(1) || (CONTACTS[0] && CONTACTS[0].id);
    const c = CONTACTS.find(x => x.id === id) || CONTACTS[0];

    const heroEl = document.getElementById("contact-hero");
    const contractsEl = document.getElementById("contact-contracts");
    const peopleEl = document.getElementById("contact-people");

    if (!c) {
      if (heroEl) heroEl.innerHTML = `<h1>No contact selected</h1><div class="contact-meta"><span>Run extraction first</span></div>`;
      if (contractsEl) contractsEl.innerHTML = empty("No contracts", "Re-run extraction to populate this contact.");
      if (peopleEl) peopleEl.innerHTML = empty("No people", "");
      return;
    }

    if (heroEl) {
      const tag = (c.tags && c.tags[0]) || "Counterparty";
      heroEl.innerHTML = `
        <h1>${escapeHtml(c.name)}</h1>
        <div class="contact-meta">
          <span><i class="ti ti-tag"></i>${escapeHtml(tag)}</span>
        </div>
        <div class="chat-input">Create new chat for ${escapeHtml(c.name)}</div>
      `;
    }

    if (contractsEl) {
      const partyFiles = FILES.filter(f => f.primaryPartyId === c.id);
      contractsEl.innerHTML = partyFiles.length
        ? `<div class="file-list">${partyFiles.map(fileRow).join("")}</div>`
        : empty("No contracts", "No files reference this party.");
    }

    if (peopleEl) {
      const people = [];
      const seen = new Set();
      // Collect signatories named on files where THIS contact is the primary
      // party. Filter out people who clearly belong to another primary party
      // on the same file (e.g. user-company signatories on a mutual NDA).
      FILES.filter(f => f.primaryPartyId === c.id).forEach(f => {
        const otherPrimaryNames = (f.primaryParties || [])
          .filter(p => p && p.name && p.name !== c.name)
          .map(p => p.name);
        (f.otherNamedParties || []).forEach(p => {
          if (!p.name || seen.has(p.name)) return;
          // Skip user-company people regardless of where they appear.
          if (USER_PEOPLE_NAMES.has(p.name)) return;
          // Skip signatories whose role/appears_in clearly references the
          // other primary party (the LLM sometimes mis-tags these).
          const roleStr = (p.role || "") + " " + (p.appears_in || "");
          if (otherPrimaryNames.some(n => roleStr.includes(n))) return;
          seen.add(p.name);
          people.push(p);
        });
      });
      if (people.length) {
        peopleEl.innerHTML = `
          <div class="people-list">
            ${people.map(p => {
              const ini = (p.name || "?").split(/\s+/).slice(0, 2).map(w => w[0] || "").join("").toUpperCase();
              return `
                <div class="person-row">
                  <div class="person-avatar" style="background:#EBE7FF;color:#5E49D6;">${escapeHtml(ini)}</div>
                  <div class="person-main">
                    <div class="person-name">${escapeHtml(p.name)}</div>
                    <div class="person-email">${escapeHtml(p.role || p.appears_in || "")}</div>
                  </div>
                  <button class="person-menu"><i class="ti ti-dots"></i></button>
                </div>`;
            }).join("")}
          </div>`;
      } else {
        peopleEl.innerHTML = empty("No people", "Other named parties (signatories, witnesses) appear here.");
      }
    }

    // Document title
    document.title = `GitLaw — ${c.name}`;

    // Sub-tab switching + Context File flow.
    setupSubtabs();
    setupContextFile(c, "Contact");
  }

  // ── Sub-tabs (Contracts / Chats / People / Context) ───────────────
  function setupSubtabs() {
    const subtabsActions = document.getElementById("subtabs-actions");
    document.querySelectorAll("#subtabs .subtab").forEach(btn => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.pane;
        document.querySelectorAll("#subtabs .subtab").forEach(b => b.classList.toggle("active", b === btn));
        document.querySelectorAll(".pane").forEach(p => { p.hidden = p.dataset.pane !== target; });
        // Context pane has its own header/actions; hide the global controls.
        if (subtabsActions) subtabsActions.hidden = (target === "context");
      });
    });
  }

  // ── Context File flow (per-scope, data-driven) ───────────────────
  // scope is a contact-or-category-shaped object: { id, name, contextBody,
  // sources }. scopeKind is "Contact" or "Category" — used in titles/badges.
  function setupContextFile(scope, scopeKind) {
    const entries = buildContextEntriesForScope(scope, scopeKind);
    mountContextEntries(entries, {
      emptyTitle: scope ? `No Context File for ${scope.name} yet` : "No Context Files yet",
      emptySub:   `Re-run extraction to populate this ${(scopeKind || "scope").toLowerCase()}'s playbook.`
    });
  }

  function buildContextEntriesForScope(scope, scopeKind) {
    const kind = scopeKind || "Contact";
    const entries = [];
    if (scope && scope.contextBody && scope.contextBody.trim()) {
      entries.push({
        id: kind.toLowerCase() + "-" + scope.id,
        scopeKind: kind,
        scopeName: scope.name,
        scopeIcon: kind === "Category" ? "ti-folder" : "ti-user-circle",
        playbookLabel: kind === "Category" ? "Category playbook" : "Counterparty playbook",
        sources: Array.isArray(scope.sources) ? scope.sources : [],
        body: scope.contextBody,
        sourcePath: (kind === "Category" ? ".gitlaw-memory/playbooks/" : ".gitlaw-memory/contacts/") + scope.id + ".md"
      });
    }
    if (kind === "Contact" && scope && scope.id) {
      const cats = (DATA.categories && DATA.categories.items) || [];
      const contactCategories = new Set(
        FILES.filter(f => f.primaryPartyId === scope.id).map(f => f.category).filter(Boolean)
      );
      cats.filter(c => contactCategories.has(c.name) && c.body && c.body.trim()).forEach(cat => {
        entries.push({
          id: "category-" + cat.id,
          scopeKind: "Category",
          scopeName: cat.name,
          scopeIcon: "ti-folder",
          playbookLabel: "Category playbook",
          sources: cat.sources || [],
          body: cat.body,
          sourcePath: ".gitlaw-memory/playbooks/" + cat.id + ".md"
        });
      });
    }
    if (DATA.profilePlaybook && DATA.profilePlaybook.body && DATA.profilePlaybook.body.trim()) {
      entries.push({
        id: "profile-general",
        scopeKind: "Profile",
        scopeName: "General",
        scopeIcon: "ti-user",
        playbookLabel: DATA.profilePlaybook.title || "General playbook",
        sources: DATA.profilePlaybook.sources || [],
        body: DATA.profilePlaybook.body,
        sourcePath: ".gitlaw-memory/playbooks/general.md"
      });
    }
    return entries;
  }

  function mountContextEntries(entries, opts) {
    opts = opts || {};
    const list = document.getElementById("ctx-list");
    const detail = document.getElementById("ctx-detail");
    const bodyEl = document.getElementById("ctx-body");
    const editor = document.getElementById("ctx-editor");
    const editorTx = document.getElementById("ctx-editor-text");
    if (!list || !detail || !bodyEl || !editor || !editorTx) return;

    if (!entries || !entries.length) {
      list.innerHTML = empty(opts.emptyTitle || "No Context Files yet", opts.emptySub || "");
      detail.hidden = true; detail.style.display = "none";
      return;
    }

    const titleEl = detail.querySelector(".ctx-detail-title");
    const tagsEl  = detail.querySelector(".ctx-detail-titles .ctx-tags");

    let activeEntry = null;
    let currentSections = [];
    let registry = { map: new Map(), order: [] };

    const hide = el => { el.hidden = true; el.style.display = "none"; };
    const show = el => { el.hidden = false; el.style.display = ""; };

    const renderList = () => {
      activeEntry = null;
      show(list); hide(detail);
      list.innerHTML = entries.map(e => {
        const sections = parseContextSections(e.body, e.sources);
        const sectionCount = sections.length;
        const preview = (sections[0] && sections[0].body && sections[0].body[0])
          ? stripMd(sections[0].body[0])
          : stripMd(e.body.split("\n").filter(Boolean).slice(0, 2).join(" "));
        return `
          <article class="context-row" data-ctx-id="${escapeHtml(e.id)}">
            <div class="ctx-main">
              <div class="ctx-tags">
                <span class="badge badge-scope"><i class="ti ${e.scopeIcon}"></i> ${escapeHtml(e.scopeKind)}: ${escapeHtml(e.scopeName)}</span>
                ${e.sources.length ? `<span class="badge badge-link"><i class="ti ti-paperclip"></i> ${e.sources.length} referenced file${e.sources.length === 1 ? "" : "s"}</span>` : ""}
                <span class="badge badge-inferred"><i class="ti ti-sparkles"></i> Inferred</span>
              </div>
              <div class="ctx-title">${escapeHtml(e.scopeName)} — ${escapeHtml(e.playbookLabel)}</div>
              <div class="ctx-text">${escapeHtml(preview.slice(0, 220))}</div>
              <div class="ctx-foot">
                <span class="ctx-foot-meta">${sectionCount} section${sectionCount === 1 ? "" : "s"}</span>
                <span class="ctx-foot-meta">From ${escapeHtml(e.sourcePath)}</span>
              </div>
            </div>
            <i class="ti ti-chevron-right ctx-chev"></i>
          </article>`;
      }).join("");
      list.querySelectorAll("[data-ctx-id]").forEach(el => {
        el.addEventListener("click", () => {
          const e = entries.find(x => x.id === el.dataset.ctxId);
          if (e) renderDetail(e);
        });
      });
    };

    const renderDetail = (entry) => {
      activeEntry = entry;
      currentSections = parseContextSections(entry.body, entry.sources);
      registry = buildCiteRegistry(currentSections);
      const titleText = `${entry.scopeName} — ${entry.playbookLabel}`;
      if (titleEl) titleEl.textContent = titleText;
      if (tagsEl) tagsEl.innerHTML = `
        <span class="badge badge-scope"><i class="ti ${entry.scopeIcon}"></i> ${escapeHtml(entry.scopeKind)}: ${escapeHtml(entry.scopeName)}</span>
        ${entry.sources.length ? `<span class="badge badge-link"><i class="ti ti-paperclip"></i> ${entry.sources.length} referenced file${entry.sources.length === 1 ? "" : "s"}</span>` : ""}
        <span class="badge badge-inferred"><i class="ti ti-sparkles"></i> Inferred</span>
      `;
      bodyEl.innerHTML = renderCtxBlocks(currentSections, registry);
      hide(editor); show(bodyEl);
      hide(list); show(detail);
    };

    bodyEl.addEventListener("click", e => {
      const link = e.target.closest(".ctx-cite, .ctx-source-link");
      if (!link) return;
      e.preventDefault();
      const contractsBtn = document.querySelector('#subtabs .subtab[data-pane="contracts"]');
      if (contractsBtn) contractsBtn.click();
    });

    document.getElementById("ctx-back").addEventListener("click", renderList);
    document.getElementById("ctx-edit").addEventListener("click", () => {
      if (!activeEntry) return;
      editorTx.value = sectionsToMarkdown(`${activeEntry.scopeName} — ${activeEntry.playbookLabel}`, activeEntry, currentSections);
      hide(bodyEl); show(editor);
      editorTx.focus();
    });
    document.getElementById("ctx-cancel").addEventListener("click", () => {
      hide(editor); show(bodyEl);
    });
    document.getElementById("ctx-save").addEventListener("click", () => {
      const md = editorTx.value;
      let parsed;
      try { parsed = parseContextSections(md, []); } catch (_) { parsed = []; }
      if (parsed && parsed.length) {
        // Section-level diff: only mark a section as user-edited when its
        // body or list actually changed. Unchanged sections keep their
        // original source state (typically "extracted") and citation pool.
        const oldSections = currentSections;
        currentSections = parsed.map(newSec => {
          const old = oldSections.find(o => o.heading === newSec.heading);
          if (!old) return { ...newSec, source: "user-edited" };
          const sameBody = JSON.stringify(old.body || []) === JSON.stringify(newSec.body || []);
          const sameList = JSON.stringify(old.list || []) === JSON.stringify(newSec.list || []);
          if (sameBody && sameList) {
            return { ...newSec, source: old.source, sources: old.sources };
          }
          return { ...newSec, source: "user-edited", sources: old.sources };
        });
        registry = buildCiteRegistry(currentSections);
        bodyEl.innerHTML = renderCtxBlocks(currentSections, registry);
      } else {
        bodyEl.innerHTML = `<section class="ctx-block" data-source="user-edited"><pre class="ctx-md-pre">${escapeHtml(md)}</pre></section>`;
      }
      hide(editor); show(bodyEl);
    });
    document.getElementById("ctx-download").addEventListener("click", () => {
      if (!activeEntry) return;
      const md = sectionsToMarkdown(`${activeEntry.scopeName} — ${activeEntry.playbookLabel}`, activeEntry, currentSections);
      const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activeEntry.scopeName} — ${activeEntry.playbookLabel}.md`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });

    renderList();
  }

  // Markdown helpers used by the Context File flow ------------------
  const stripMd = (s) => String(s || "").replace(/\*\*(.+?)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1").replace(/\s+/g, " ").trim();

  function renderInlineMd(s) {
    return String(s || "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  }

  // Parse a markdown body into section blocks. Three strategies in order:
  //   1) `## ` headings present  →  split on those (canonical)
  //   2) Lead-in labels detected (paragraphs starting with a "Title:" line)
  //      → split on those, extract inline `[source: file.md]` citations as
  //        the section's sources
  //   3) No structure  →  one Overview section
  function parseContextSections(md, defaultSources) {
    const text = String(md || "").replace(/^---[\s\S]*?\n---\s*\n?/, "");

    // Helpers ──────────────────────────────────────────────────────
    const SOURCE_RE = /\[source:\s*([^\]]+)\]/g;
    const stripSrc = (s) => String(s || "").replace(/\s*\[source:\s*[^\]]+\]/g, "").replace(/\s+/g, " ").trim();
    const collectSources = (text) => {
      const set = new Set();
      let m;
      SOURCE_RE.lastIndex = 0;
      while ((m = SOURCE_RE.exec(text)) !== null) set.add(m[1].trim());
      return [...set];
    };

    const parseChunk = (heading, chunk, fallbackSources) => {
      const lines = chunk.split("\n");
      const body = [];
      const list = [];
      let para = [];
      const flush = () => { if (para.length) { body.push(para.join(" ").trim()); para = []; } };
      for (const raw of lines) {
        const line = raw.trim();
        if (!line) { flush(); continue; }
        if (/^[-*]\s+/.test(line)) { flush(); list.push(line.replace(/^[-*]\s+/, "")); continue; }
        para.push(line);
      }
      flush();
      // Pull sources from the original chunk (before stripping) so we keep them
      const srcs = collectSources(chunk);
      const sources = srcs.length ? srcs : (fallbackSources && fallbackSources.length ? [fallbackSources[0]] : []);
      const out = { heading, source: "extracted", sources };
      const cleanBody = body.map(stripSrc).filter(Boolean);
      const cleanList = list.map(stripSrc).filter(Boolean);
      if (cleanBody.length) out.body = cleanBody;
      if (cleanList.length) out.list = cleanList;
      return out;
    };

    const sections = [];

    // Strategy 1: ## headings ─────────────────────────────────────
    const hashHeadings = [...text.matchAll(/^##\s+(.+)$/gm)];
    if (hashHeadings.length) {
      const firstStart = hashHeadings[0].index;
      const preamble = text.slice(0, firstStart).replace(/^#\s+.+$/m, "").trim();
      if (preamble) sections.push(parseChunk("Overview", preamble, defaultSources));
      for (let i = 0; i < hashHeadings.length; i++) {
        const heading = hashHeadings[i][1].trim();
        const start = hashHeadings[i].index + hashHeadings[i][0].length;
        const end = (i + 1 < hashHeadings.length) ? hashHeadings[i + 1].index : text.length;
        sections.push(parseChunk(heading, text.slice(start, end).trim(), defaultSources));
      }
      return spreadFallbackSources(sections, defaultSources);
    }

    // Strategy 2: paragraph + lead-in labels ─────────────────────
    // A "lead-in" is a short line ending with `:` that introduces the
    // following bullets/paragraph (e.g. "Practical use:").
    const paras = text.split(/\n\s*\n/).map(p => p.replace(/^#\s+.+\n?/m, "").trim()).filter(Boolean);
    const isLeadIn = (line) => /^[A-Z][A-Za-z][\w\s/&'(),-]{2,60}:$/.test(line.trim()) && line.length < 80;

    if (paras.length) {
      let curHeading = null;
      let curBuffer = [];
      const flushSection = () => {
        if (!curHeading && !curBuffer.length) return;
        const heading = curHeading || "Overview";
        const chunk = curBuffer.join("\n\n");
        sections.push(parseChunk(heading, chunk, defaultSources));
        curHeading = null;
        curBuffer = [];
      };

      for (const para of paras) {
        const lines = para.split("\n");
        const firstLine = lines[0];
        if (isLeadIn(firstLine)) {
          flushSection();
          curHeading = firstLine.trim().replace(/:$/, "");
          const rest = lines.slice(1).join("\n").trim();
          if (rest) curBuffer.push(rest);
        } else {
          curBuffer.push(para);
        }
      }
      flushSection();
      return spreadFallbackSources(sections, defaultSources);
    }

    return sections;
  }

  // Distribute defaultSources across sections that don't have any of their
  // own (back-compat with bodies that lack inline `[source: ...]` markers).
  function spreadFallbackSources(sections, defaultSources) {
    if (!defaultSources || !defaultSources.length) return sections;
    sections.forEach((s, idx) => {
      if (s.sources && s.sources.length) return;
      if (idx === 0) s.sources = defaultSources.slice();
      else if (defaultSources[idx]) s.sources = [defaultSources[idx]];
    });
    return sections;
  }

  function buildCiteRegistry(sections) {
    const order = []; const map = new Map();
    sections.forEach(s => (s.sources || []).forEach(f => {
      if (!map.has(f)) { order.push(f); map.set(f, order.length); }
    }));
    return { map, order };
  }

  function renderCtxBlocks(sections, registry) {
    return sections.map(s => renderCtxBlock(s, registry)).join("");
  }

  function renderCtxBlock(section, registry) {
    const isEdited = section.source === "user-edited";
    const tagHtml = isEdited
      ? `<span class="badge badge-edited block-tag block-tag-icon" data-tooltip="Edited by User" aria-label="Edited by User"><i class="ti ti-user"></i></span>`
      : `<span class="badge badge-inferred block-tag"><i class="ti ti-sparkles"></i> Inferred</span>`;
    const sourcesHtml = (section.sources && section.sources.length)
      ? `<span class="ctx-block-sources">${section.sources.map(f => {
          const n = registry.map.get(f);
          if (!n) return "";
          const attr = String(f).replace(/"/g, "&quot;");
          return `<a class="ctx-cite" data-file="${attr}" data-tooltip="${attr}" aria-label="${attr}" href="#">[${n}]</a>`;
        }).join("")}</span>`
      : "";
    let bodyHtml = "";
    if (section.body) bodyHtml += section.body.map(p => `<p>${renderInlineMd(p)}</p>`).join("");
    if (section.list) bodyHtml += `<ul>${section.list.map(it => `<li>${renderInlineMd(it)}</li>`).join("")}</ul>`;
    return `
      <section class="ctx-block" data-source="${section.source}">
        <div class="ctx-block-head">
          <h3>${renderInlineMd(section.heading)}</h3>
          ${tagHtml}
          ${sourcesHtml}
        </div>
        ${bodyHtml}
      </section>`;
  }

  function sectionsToMarkdown(title, scope, sections) {
    const out = [`# ${title}`, ""];
    if (scope.id) out.push(`**Scope:** ${scope.id}  `);
    if (scope.sources && scope.sources.length) out.push(`**Referenced files:** ${scope.sources.length}`);
    out.push("");
    sections.forEach(s => {
      out.push(`## ${s.heading}`, "");
      if (s.body) s.body.forEach(p => { out.push(p, ""); });
      if (s.list) { s.list.forEach(it => out.push(`- ${it}`)); out.push(""); }
    });
    return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
  }

  // ── File detail panel + chat-handoff modal (shared across pages) ──
  // Injected once into the document; wired with global click delegation
  // so any data-file-id row/card opens the panel without per-page setup.
  function ensureFilePanel() {
    if (document.getElementById("file-panel")) return;
    const aside = document.createElement("aside");
    aside.className = "file-panel";
    aside.id = "file-panel";
    aside.hidden = true;
    aside.innerHTML = `
      <div class="fp-head">
        <div class="fp-title-wrap">
          <div class="fp-eyebrow" id="fp-eyebrow"></div>
          <div class="fp-title" id="fp-title"></div>
        </div>
        <button class="icon-btn" id="fp-close" title="Close"><i class="ti ti-x"></i></button>
      </div>
      <div class="fp-body">
        <div class="fp-chips" id="fp-chips"></div>
        <section class="fp-section" id="fp-parties-section" hidden>
          <h4 class="fp-section-title">Parties</h4>
          <div id="fp-parties"></div>
        </section>
        <section class="fp-section" id="fp-flags-section" hidden>
          <h4 class="fp-section-title">Flags</h4>
          <div id="fp-flag-list"></div>
        </section>
        <section class="fp-section" id="fp-suggestions-section" hidden>
          <h4 class="fp-section-title">Suggestions</h4>
          <div id="fp-suggestions"></div>
        </section>
        <section class="fp-section" id="fp-reminders-section" hidden>
          <h4 class="fp-section-title">Reminders</h4>
          <div id="fp-reminders"></div>
        </section>
        <section class="fp-section" id="fp-summary-section" hidden>
          <h4 class="fp-section-title">Summary</h4>
          <div class="fp-summary" id="fp-summary"></div>
        </section>
        <section class="fp-section" id="fp-meta-section" hidden>
          <h4 class="fp-section-title">Other details</h4>
          <div class="fp-meta" id="fp-meta"></div>
        </section>
      </div>
      <div class="fp-foot">
        <button class="outline-btn" id="fp-source"><i class="ti ti-file-text"></i> Open source document</button>
      </div>
    `;
    document.body.appendChild(aside);

    document.getElementById("fp-close").addEventListener("click", closeFilePanel);
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        const fp = document.getElementById("file-panel");
        const md = document.getElementById("page-handoff-backdrop");
        if (md && !md.hidden) closeHandoffModal();
        else if (fp && fp.classList.contains("open")) closeFilePanel();
      }
    });
    document.getElementById("fp-source").addEventListener("click", () => {
      // Stub for the editor view — not built in this prototype.
      const btn = document.getElementById("fp-source");
      const orig = btn.innerHTML;
      btn.innerHTML = `<i class="ti ti-info-circle"></i> Editor not built yet`;
      setTimeout(() => { btn.innerHTML = orig; }, 1400);
    });
  }

  function ensureHandoffModal() {
    if (document.getElementById("page-handoff-backdrop")) return;
    const wrap = document.createElement("div");
    wrap.className = "modal-backdrop";
    wrap.id = "page-handoff-backdrop";
    wrap.hidden = true;
    wrap.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div>
            <div class="modal-eyebrow" id="page-handoff-eyebrow">Chat handoff</div>
            <div class="modal-title" id="page-handoff-title">…</div>
          </div>
          <button class="icon-btn" id="page-handoff-close" title="Close"><i class="ti ti-x"></i></button>
        </div>
        <div class="modal-body">
          <div class="handoff-section">
            <div class="handoff-label"><i class="ti ti-paperclip"></i> Files attached</div>
            <div class="handoff-chips" id="page-handoff-files"></div>
          </div>
          <div class="handoff-section" id="page-handoff-contacts-section">
            <div class="handoff-label"><i class="ti ti-users"></i> Contacts attached</div>
            <div class="handoff-chips" id="page-handoff-contacts"></div>
          </div>
          <div class="handoff-section">
            <div class="handoff-label"><i class="ti ti-message-circle"></i> Prompt <span class="handoff-hint">(editable — review before sending)</span></div>
            <textarea id="page-handoff-prompt" class="handoff-prompt" spellcheck="false"></textarea>
          </div>
        </div>
        <div class="modal-foot">
          <div class="handoff-foot-note">No backend in this prototype — Send is illustrative only.</div>
          <div class="modal-foot-actions">
            <button id="page-handoff-cancel">Cancel</button>
            <button class="primary" id="page-handoff-send"><i class="ti ti-send"></i> Send to chat</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);

    document.getElementById("page-handoff-close").addEventListener("click", closeHandoffModal);
    document.getElementById("page-handoff-cancel").addEventListener("click", closeHandoffModal);
    wrap.addEventListener("click", e => { if (e.target === wrap) closeHandoffModal(); });
    document.getElementById("page-handoff-send").addEventListener("click", () => {
      const btn = document.getElementById("page-handoff-send");
      const orig = btn.innerHTML;
      btn.innerHTML = `<i class="ti ti-check"></i> Sent (illustrative)`;
      btn.disabled = true;
      setTimeout(() => {
        btn.innerHTML = orig; btn.disabled = false;
        closeHandoffModal();
      }, 800);
    });
  }

  let currentFileId = null;
  let currentTrigger = null;

  function openFilePanel(fileId, triggerEl) {
    ensureFilePanel();
    ensureHandoffModal();
    const file = FILES.find(f => f.id === fileId);
    if (!file) return;

    const aside = document.getElementById("file-panel");
    if (currentFileId === fileId && currentTrigger === triggerEl && aside.classList.contains("open")) {
      closeFilePanel();
      return;
    }
    currentFileId = fileId;
    currentTrigger = triggerEl || null;

    document.querySelectorAll(".file-row.selected, .kcard.selected, .item.selected").forEach(el => el.classList.remove("selected"));
    if (triggerEl) triggerEl.classList.add("selected");

    document.getElementById("fp-eyebrow").textContent = file.category || "File";
    document.getElementById("fp-title").textContent = file.title;

    const chips = [];
    if (file.status) chips.push(STATUS_META[file.status] ? `<span class="badge ${STATUS_META[file.status].cls}">${STATUS_META[file.status].label}</span>` : "");
    if (file.expiryDate) {
      const e = expiryMeta(file);
      if (e && (/Expir|Expired/.test(e))) chips.push(`<span class="badge badge-amber">${escapeHtml(e)}</span>`);
    }
    if (file.executionDate) chips.push(`<span class="badge badge-grey">Signed ${file.executionDate.slice(0,4)}</span>`);
    if (file.governingLaw) chips.push(`<span class="badge badge-grey">${escapeHtml(file.governingLaw)}</span>`);
    document.getElementById("fp-chips").innerHTML = chips.filter(Boolean).join("");

    // Flags
    const flags = file.flags || [];
    document.getElementById("fp-flags-section").hidden = !flags.length;
    document.getElementById("fp-flag-list").innerHTML = flags.map((flag, i) => `
      <div class="fp-flag">
        <div class="fp-flag-text">${escapeHtml(flag.note || flag.type || "")}</div>
        <button class="btn-chat-action" data-fp-resolve-flag="${i}"><i class="ti ti-message-circle"></i> Resolve in chat</button>
      </div>
    `).join("");

    // Suggestions for this file (matched against suggested[].files entries)
    const fileBits = [file.file, file.title, file.id].filter(Boolean).map(s => String(s).toLowerCase());
    const suggestions = ((DATA.suggested && DATA.suggested.items) || []).filter(s => {
      if (Array.isArray(s.files) && s.files.length) {
        return s.files.some(sf => {
          const t = String(sf).toLowerCase();
          return fileBits.some(b => t === b || t.includes(b) || b.includes(t));
        });
      }
      return false;
    });
    document.getElementById("fp-suggestions-section").hidden = !suggestions.length;
    document.getElementById("fp-suggestions").innerHTML = suggestions.map((s, i) => `
      <div class="fp-suggest">
        <div class="fp-suggest-head">
          <span class="badge badge-${escapeHtml(s.tagColor || "grey")}">${escapeHtml(s.tag || "Action")}</span>
          <span class="fp-suggest-name">${escapeHtml(s.name)}</span>
        </div>
        ${s.sub ? `<div class="fp-suggest-sub">${escapeHtml(s.sub)}</div>` : ""}
        <button class="btn-chat-action" data-fp-suggest-idx="${i}"><i class="ti ti-message-circle"></i> ${escapeHtml(s.action || "Open")} in chat</button>
      </div>
    `).join("");

    // Reminders for this file (match by relatedDocument or substring of title)
    const reminders = ((DATA.notifications && DATA.notifications.items) || []).filter(n => {
      const blob = String((n.relatedDocument || "") + " " + (n.name || "")).toLowerCase();
      return fileBits.some(b => blob.includes(b));
    });
    document.getElementById("fp-reminders-section").hidden = !reminders.length;
    document.getElementById("fp-reminders").innerHTML = reminders.map((r, i) => {
      const cls = r.urgency === "red" ? "badge-red" : r.urgency === "amber" ? "badge-amber" : "badge-grey";
      const otherFileId = r.relatedDocument && FILE_BY_BASENAME[r.relatedDocument];
      const isOther = otherFileId && otherFileId !== file.id;
      const linkAttr = isOther ? ` data-file-id="${escapeHtml(otherFileId)}"` : "";
      const clickableCls = isOther ? " fp-reminder-clickable" : "";
      const otherHint = isOther ? `<div class="fp-reminder-hint">in ${escapeHtml(r.relatedDocument)} →</div>` : "";
      return `
        <div class="fp-reminder${clickableCls}"${linkAttr}>
          <i class="ti ti-bell"></i>
          <div class="fp-reminder-body">
            <div class="fp-reminder-name">${escapeHtml(r.name)}</div>
            ${r.when ? `<div class="fp-reminder-when"><span class="badge ${cls}">${escapeHtml(r.when)}</span></div>` : ""}
            ${otherHint}
          </div>
          <button class="btn-chat-action" data-fp-reminder-idx="${i}"><i class="ti ti-message-circle"></i> Action</button>
        </div>`;
    }).join("");

    // Parties
    const parties = (file.primaryParties || []).filter(p => p && p.name);
    document.getElementById("fp-parties-section").hidden = !parties.length;
    document.getElementById("fp-parties").innerHTML = parties.map(p => {
      const slug = String(p.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const sub = p.is_user_company ? "You" : (p.role || "");
      return `
        <a class="fp-party-row" href="contact.html#${slug}">
          <i class="ti ti-user-circle"></i>
          <div style="flex:1;min-width:0;">
            <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(p.name)}</div>
            ${sub ? `<div style="font-size:11px;color:var(--text-tertiary);font-weight:400;margin-top:1px;">${escapeHtml(sub)}</div>` : ""}
          </div>
          <i class="ti ti-chevron-right" style="color:var(--text-tertiary);font-size:14px;"></i>
        </a>`;
    }).join("");

    // Summary (status notes for now — per-File Context File body comes later)
    const summary = file.statusNotes || "";
    document.getElementById("fp-summary-section").hidden = !summary;
    document.getElementById("fp-summary").innerHTML = summary ? `<p>${escapeHtml(summary)}</p>` : "";

    // Other details
    const meta = [];
    if (file.governingCourts) meta.push(`<div class="fp-meta-row"><span class="fp-meta-k">Courts</span><span class="fp-meta-v">${escapeHtml(file.governingCourts)}</span></div>`);
    if (file.effectiveDate)   meta.push(`<div class="fp-meta-row"><span class="fp-meta-k">Effective</span><span class="fp-meta-v">${escapeHtml(file.effectiveDate)}</span></div>`);
    if (file.expiryDate)      meta.push(`<div class="fp-meta-row"><span class="fp-meta-k">Expires</span><span class="fp-meta-v">${escapeHtml(file.expiryDate)}</span></div>`);
    if (file.file)            meta.push(`<div class="fp-meta-row"><span class="fp-meta-k">Source</span><span class="fp-meta-v">${escapeHtml(file.file)}</span></div>`);
    document.getElementById("fp-meta-section").hidden = !meta.length;
    document.getElementById("fp-meta").innerHTML = meta.join("");

    // Wire flag → chat handoff
    document.querySelectorAll("[data-fp-resolve-flag]").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.fpResolveFlag, 10);
        const flag = (file.flags || [])[idx];
        if (!flag) return;
        openHandoffModal({
          eyebrow: "Chat handoff · Resolve flag",
          title: flag.note || flag.type || file.title,
          files: [file.file || file.title],
          contacts: parties.map(p => p.name),
          prompt: `Help me resolve this flag on "${file.title}":\n\n${flag.note || flag.type || ""}\n\nFile: ${file.file || file.title}.\nParties: ${parties.map(p => p.name).join(", ")}.`
        });
      });
    });

    // Wire suggestion → chat handoff (uses the suggestion's own payload)
    document.querySelectorAll("[data-fp-suggest-idx]").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.fpSuggestIdx, 10);
        const s = suggestions[idx];
        if (!s) return;
        openHandoffModal({
          eyebrow: `Chat handoff · ${s.action || "Action"}`,
          title: s.name,
          files: s.files && s.files.length ? s.files : [file.file || file.title],
          contacts: s.contacts && s.contacts.length ? s.contacts : parties.map(p => p.name),
          prompt: s.prompt || `Help me ${(s.action || "resolve").toLowerCase()}: ${s.name}.\n\nContext: ${s.sub || ""}`
        });
      });
    });

    // Wire reminder → chat handoff
    document.querySelectorAll("[data-fp-reminder-idx]").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.fpReminderIdx, 10);
        const r = reminders[idx];
        if (!r) return;
        openHandoffModal({
          eyebrow: "Chat handoff · Reminder",
          title: r.name,
          files: [file.file || file.title],
          contacts: parties.map(p => p.name),
          prompt: `Reminder is due (${r.when}): ${r.name}.\n\nReference file: ${file.file || file.title}.\nWhat should I do next?`
        });
      });
    });

    aside.hidden = false;
    requestAnimationFrame(() => aside.classList.add("open"));
  }

  function closeFilePanel() {
    const aside = document.getElementById("file-panel");
    if (!aside) return;
    aside.classList.remove("open");
    document.querySelectorAll(".file-row.selected, .kcard.selected, .item.selected").forEach(el => el.classList.remove("selected"));
    setTimeout(() => { aside.hidden = true; }, 220);
    currentFileId = null;
  }

  function openHandoffModal({ eyebrow, title, files, contacts, prompt }) {
    ensureHandoffModal();
    document.getElementById("page-handoff-eyebrow").textContent = eyebrow || "Chat handoff";
    document.getElementById("page-handoff-title").textContent = title || "Action";
    const filesEl = document.getElementById("page-handoff-files");
    filesEl.innerHTML = (files && files.length)
      ? files.map(f => `<span class="chip-attach"><i class="ti ti-file-text"></i>${escapeHtml(f)}</span>`).join("")
      : `<span class="chip-attach chip-attach-empty"><i class="ti ti-circle-dashed"></i>No files yet</span>`;
    const contactsEl = document.getElementById("page-handoff-contacts");
    const contactsSection = document.getElementById("page-handoff-contacts-section");
    if (contacts && contacts.length) {
      contactsSection.hidden = false;
      contactsEl.innerHTML = contacts.map(c => `<span class="chip-attach"><i class="ti ti-user"></i>${escapeHtml(c)}</span>`).join("");
    } else {
      contactsSection.hidden = true;
      contactsEl.innerHTML = "";
    }
    document.getElementById("page-handoff-prompt").value = prompt || "";
    const wrap = document.getElementById("page-handoff-backdrop");
    wrap.hidden = false;
    wrap.style.display = "";
    setTimeout(() => document.getElementById("page-handoff-prompt").focus(), 0);
  }

  function closeHandoffModal() {
    const wrap = document.getElementById("page-handoff-backdrop");
    if (!wrap) return;
    wrap.hidden = true;
    wrap.style.display = "none";
  }

  // Global click delegation:
  //  · click on a [data-file-id] row/card → open panel for that file
  //  · click anywhere outside the panel + outside any modal → close the panel
  document.addEventListener("click", e => {
    const trigger = e.target.closest("[data-file-id]");
    const onInteractive = e.target.closest("a:not(.fp-trigger), button, .row-star, [data-handoff], [data-fp-resolve-flag]");

    if (trigger && !onInteractive) {
      e.preventDefault();
      openFilePanel(trigger.dataset.fileId, trigger);
      return;
    }

    // Don't close when clicking inside the panel itself or inside any modal
    if (e.target.closest("#file-panel")) return;
    if (e.target.closest(".modal-backdrop")) return;

    const aside = document.getElementById("file-panel");
    if (aside && aside.classList.contains("open")) closeFilePanel();
  });

  // ── category landing page (category.html#category-slug) ──────────
  function renderCategory() {
    const cats = (DATA.categories && DATA.categories.items) || [];
    const id = (location.hash || "").slice(1) || (cats[0] && cats[0].id);
    const cat = cats.find(c => c.id === id) || cats[0];

    const crumb = document.getElementById("category-crumb");
    const heroEl = document.getElementById("category-hero");
    const contractsEl = document.getElementById("category-contracts");
    const peopleEl = document.getElementById("category-people");
    const chatsEl = document.getElementById("category-chats");

    if (!cat) {
      if (crumb) crumb.textContent = "Unknown";
      if (heroEl) heroEl.innerHTML = `<h1>No category found</h1><div class="contact-meta"><span>Run extraction first</span></div>`;
      if (contractsEl) contractsEl.innerHTML = empty("No documents", "Re-run extraction to populate this category.");
      return;
    }

    if (crumb) crumb.textContent = cat.name;
    document.title = `GitLaw — ${cat.name}`;

    if (heroEl) {
      heroEl.innerHTML = `
        <h1>${escapeHtml(cat.name)}</h1>
        <div class="contact-meta">
          <span><i class="ti ${escapeHtml(cat.icon || "ti-folder")}"></i>Category</span>
          <span><i class="ti ti-files"></i>${cat.count} document${cat.count === 1 ? "" : "s"}</span>
          ${cat.playbooks && cat.playbooks.length ? `<span><i class="ti ti-book"></i>${cat.playbooks.length} playbook${cat.playbooks.length === 1 ? "" : "s"}</span>` : ""}
        </div>
        <div class="chat-input">Create new chat about ${escapeHtml(cat.name)}</div>
      `;
    }

    // Contracts: every file whose category matches this one.
    if (contractsEl) {
      const inCat = FILES.filter(f => (f.category || "Other") === cat.name);
      contractsEl.innerHTML = inCat.length
        ? `<div class="file-list">${inCat.map(fileRow).join("")}</div>`
        : empty("No contracts", "No files have been categorised here yet.");
    }

    // People: union of all primary parties from files in this category
    // (excluding the user's own company), plus signatories that pass the
    // user-people filter.
    if (peopleEl) {
      const seen = new Set();
      const people = [];
      FILES.filter(f => (f.category || "Other") === cat.name).forEach(f => {
        (f.primaryParties || []).forEach(p => {
          if (!p || !p.name || p.is_user_company) return;
          if (seen.has(p.name)) return;
          seen.add(p.name);
          people.push({ name: p.name, role: p.role || "", isPrimary: true });
        });
        const otherPrimaryNames = (f.primaryParties || []).filter(p => p && p.name).map(p => p.name);
        (f.otherNamedParties || []).forEach(p => {
          if (!p || !p.name || seen.has(p.name)) return;
          if (USER_PEOPLE_NAMES.has(p.name)) return;
          const roleStr = (p.role || "") + " " + (p.appears_in || "");
          if (otherPrimaryNames.some(n => roleStr.includes(n) && n !== p.name)) return;
          seen.add(p.name);
          people.push({ name: p.name, role: p.role || p.appears_in || "", isPrimary: false });
        });
      });
      peopleEl.innerHTML = people.length
        ? `<div class="people-list">
            ${people.map(p => {
              const ini = (p.name || "?").split(/\s+/).slice(0, 2).map(w => w[0] || "").join("").toUpperCase();
              const slug = String(p.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
              const href = p.isPrimary ? `contact.html#${slug}` : "#";
              return `
                <a class="person-row" href="${href}" style="text-decoration:none;color:inherit;">
                  <div class="person-avatar" style="background:#EBE7FF;color:#5E49D6;">${escapeHtml(ini)}</div>
                  <div class="person-main">
                    <div class="person-name">${escapeHtml(p.name)}</div>
                    <div class="person-email">${escapeHtml(p.role || "")}</div>
                  </div>
                  <button class="person-menu"><i class="ti ti-dots"></i></button>
                </a>`;
            }).join("")}
          </div>`
        : empty("No people", "Named parties from files in this category appear here.");
    }

    // Chats: mock empty state for now (chat history not extracted).
    if (chatsEl) chatsEl.innerHTML = empty("No chats yet", "Chat history about this category will appear here.");

    setupSubtabs();
    setupContextFile(
      { id: cat.id, name: cat.name, sources: cat.sources || [], contextBody: cat.body || "" },
      "Category"
    );
  }

  // ── knowledge area (Contacts + Context Files index) ──────────────
  function renderKnowledge() {
    const contactsEl = document.getElementById("knowledge-contacts");
    const contextEl  = document.getElementById("knowledge-context");

    // ── Contacts pane (grid of contact cards) ─────────────────────
    if (contactsEl) {
      if (!CONTACTS.length) {
        contactsEl.innerHTML = empty("No contacts yet", "Re-run extraction to populate the contact directory.");
      } else {
        const cardHtml = (c) => {
          const tag = (c.tags && c.tags[0]) || "Counterparty";
          const tagsHtml = (c.tags && c.tags.length)
            ? c.tags.slice(0, 3).map(t => `<span class="badge badge-grey">${escapeHtml(t)}</span>`).join("")
            : `<span class="badge badge-grey">${escapeHtml(tag)}</span>`;
          const docsHtml = (c.docs || []).slice(0, 3).map(d => `
            <div class="pc-doc">
              <div class="pc-doc-name"><i class="ti ti-file-text"></i><span class="pc-doc-text">${escapeHtml(d.title)}</span></div>
              ${d.status ? statusBadge(d.status) : ""}
            </div>`).join("");
          return `
            <a class="party-card" href="contact.html#${escapeHtml(c.id)}">
              <div class="pc-head">
                <div class="pc-avatar" style="background:${c.avatarBg};color:${c.avatarColor};">${escapeHtml(c.initials)}</div>
                <div class="pc-name">${escapeHtml(c.name)}</div>
                <div class="pc-count">${c.fileCount}</div>
              </div>
              <div class="pc-tags">${tagsHtml}</div>
              ${docsHtml}
            </a>`;
        };
        contactsEl.innerHTML = `<div class="party-grid">${CONTACTS.map(cardHtml).join("")}</div>`;
      }
    }

    // ── Context pane: list of Context File entries that toggle to an
    // inline detail view (same flow as the Contact page's Context tab).
    setupKnowledgeContext();

    setupSubtabs();
  }

  function setupKnowledgeContext() {
    // Knowledge → Context: a flat index of every Context File entry.
    // Order: Profile (general) → Categories → Contacts.
    const entries = [];
    const profile = DATA.profilePlaybook;
    if (profile && profile.body && profile.body.trim()) {
      entries.push({
        id: "profile-general",
        scopeKind: "Profile",
        scopeName: "General",
        scopeIcon: "ti-user",
        playbookLabel: profile.title || "General playbook",
        sources: profile.sources || [],
        body: profile.body,
        sourcePath: ".gitlaw-memory/playbooks/general.md"
      });
    }
    ((DATA.categories && DATA.categories.items) || []).forEach(cat => {
      if (cat.body && cat.body.trim()) {
        entries.push({
          id: "category-" + cat.id,
          scopeKind: "Category",
          scopeName: cat.name,
          scopeIcon: "ti-folder",
          playbookLabel: "Category playbook",
          sources: cat.sources || [],
          body: cat.body,
          sourcePath: ".gitlaw-memory/playbooks/" + cat.id + ".md"
        });
      }
    });
    CONTACTS.filter(c => c.contextBody && c.contextBody.trim()).forEach(c => {
      entries.push({
        id: "contact-" + c.id,
        scopeKind: "Contact",
        scopeName: c.name,
        scopeIcon: "ti-user-circle",
        playbookLabel: "Counterparty playbook",
        sources: c.sources || [],
        body: c.contextBody,
        sourcePath: ".gitlaw-memory/contacts/" + c.id + ".md"
      });
    });
    mountContextEntries(entries, {
      emptyTitle: "No Context Files yet",
      emptySub:   "Re-run extraction to populate playbooks and contact memory."
    });
  }

  // ── dispatch ───────────────────────────────────────────────────────
  const renderers = {
    "all-files":  renderAllFiles,
    "parties":    renderParties,
    "categories": renderCategories,
    "status":     renderStatus,
    "contact":    renderContact,
    "category":   renderCategory,
    "knowledge":  renderKnowledge
  };
  const page = document.body && document.body.dataset.page;
  if (page && renderers[page]) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", renderers[page]);
    } else {
      renderers[page]();
    }
  }
})();
