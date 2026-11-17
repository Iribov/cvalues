(() => {
  const DATA_URL = "./static/data/cvalues.json";
  const state = { data: [], filtered: [], visible: 12, query: "", family: "", method: "", sort: "relevance" };
  const $ = (selector) => document.querySelector(selector);
  const grid = $("#results-grid");
  const count = $("#results-count");
  const empty = $("#empty-state");
  const loadMore = $("#load-more");
  const normalize = (value) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().trim();
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const plantName = (record) => [record.genus, record.species].filter(Boolean).join(" ") || "Unidentified plant";
  const formatValue = (value) => Number(value).toLocaleString(undefined, { maximumFractionDigits: 4 });

  async function loadRecords() {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`Data request failed (${response.status})`);
    return response.json();
  }

  function fillSelect(selector, values, label) {
    const select = $(selector);
    [...new Set(values.filter(Boolean))].sort((a,b) => a.localeCompare(b)).forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.append(option);
    });
  }

  function card(record) {
    const name = plantName(record);
    const nameHtml = record.genus ? `<em>${esc(record.genus)}</em>${record.species ? ` ${esc(record.species)}` : ""}` : esc(name);
    const details = [];
    if (record.chromosomes) details.push(`<span class="detail-chip"><b>Chromosomes</b> ${esc(record.chromosomes)}</span>`);
    if (record.ploidy) details.push(`<span class="detail-chip"><b>Ploidy</b> ${esc(record.ploidy)}</span>`);
    if (record.method) details.push(`<span class="detail-chip"><b>Method</b> ${esc(record.method)}</span>`);
    if (record.voucher) details.push(`<span class="detail-chip"><b>Voucher</b> ${esc(record.voucher)}</span>`);
    const cultivar = record.cultivar ? `<div class="cultivar"><strong>Cultivar</strong> · ${esc(record.cultivar)}</div>` : "";
    const authority = record.authority ? `<div class="authority">${esc(record.authority)}</div>` : "";
    const reference = record.reference ? `<div class="card-reference"><strong>Reference</strong> · ${esc(record.reference)}</div>` : "";
    return `<article class="result-card"><div class="card-top"><div class="plant-name"><span class="family-tag">${esc(record.family || "Plant family not listed")}</span><h3>${nameHtml}</h3>${authority}</div><div class="cvalue"><strong>${formatValue(record.value)}</strong><span>2C · pg</span></div></div>${cultivar}${details.length ? `<div class="card-details">${details.join("")}</div>` : ""}${reference}</article>`;
  }

  function applyFilters() {
    const query = normalize(state.query);
    state.filtered = state.data.filter((record) => {
      if (state.family && record.family !== state.family) return false;
      if (state.method && record.method !== state.method) return false;
      if (!query) return true;
      return normalize([record.family, record.genus, record.species, record.authority, record.cultivar, record.method, record.reference, record.chromosomes, record.ploidy].join(" ")).includes(query);
    });
    if (state.sort === "name") state.filtered.sort((a,b) => plantName(a).localeCompare(plantName(b)));
    if (state.sort === "value-asc") state.filtered.sort((a,b) => a.value - b.value);
    if (state.sort === "value-desc") state.filtered.sort((a,b) => b.value - a.value);
    state.visible = Number($("#page-size").value);
    render();
  }

  function render() {
    const results = state.filtered.slice(0, state.visible);
    grid.innerHTML = results.map(card).join("");
    grid.hidden = results.length === 0;
    empty.hidden = results.length !== 0;
    count.textContent = `${state.filtered.length.toLocaleString()} ${state.filtered.length === 1 ? "result" : "results"}`;
    loadMore.hidden = state.visible >= state.filtered.length;
    grid.setAttribute("aria-busy", "false");
  }

  $("#search-form").addEventListener("submit", (event) => { event.preventDefault(); state.query = $("#query").value; applyFilters(); });
  $("#query").addEventListener("input", () => { state.query = $("#query").value; applyFilters(); });
  $("#family-filter").addEventListener("change", (event) => { state.family = event.target.value; applyFilters(); });
  $("#method-filter").addEventListener("change", (event) => { state.method = event.target.value; applyFilters(); });
  $("#sort-order").addEventListener("change", (event) => { state.sort = event.target.value; applyFilters(); });
  $("#page-size").addEventListener("change", applyFilters);
  loadMore.addEventListener("click", () => { state.visible += Number($("#page-size").value); render(); });
  const reset = () => {
    state.query = ""; state.family = ""; state.method = ""; state.sort = "relevance";
    $("#query").value = ""; $("#family-filter").value = ""; $("#method-filter").value = ""; $("#sort-order").value = "relevance";
    applyFilters(); $("#query").focus();
  };
  $("#reset-filters").addEventListener("click", reset);
  $("#empty-reset").addEventListener("click", reset);

  const guide = $("#guide-dialog");
  $("#guide-trigger").addEventListener("click", () => guide.showModal());
  $("#guide-close").addEventListener("click", () => guide.close());
  guide.addEventListener("click", (event) => {
    if (event.target === guide) guide.close();
  });

  loadRecords().then((data) => {
    state.data = data;
    state.filtered = data;
    fillSelect("#family-filter", data.map((row) => row.family), "All families");
    fillSelect("#method-filter", data.map((row) => row.method), "All methods");
    applyFilters();
  }).catch((error) => {
    console.error("Could not load the C-value collection:", error);
    grid.hidden = true;
    empty.hidden = false;
    empty.innerHTML = "<div class=\"empty-icon\" aria-hidden=\"true\">!</div><h3>The collection couldn’t load</h3><p>Please refresh the page in a moment. If the problem continues, contact the Iribov team.</p><a class=\"text-link\" href=\"https://iribov.com/contact/\">Contact Iribov <span aria-hidden=\"true\">↗</span></a>";
    count.textContent = "Collection unavailable";
    grid.setAttribute("aria-busy", "false");
  });
})();


