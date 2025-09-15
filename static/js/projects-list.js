(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const cards = $$('#projectCards .card');
  const searchInput = $('#searchInput');
  const tagFiltersEl = $('#tagFilters');
  const clearBtn = $('#clearFilters');
  const resultsInfo = $('#resultsInfo');

  // No results element
  const noResults = document.createElement('div');
  noResults.id = 'noResults';
  noResults.className = 'content';
  noResults.style.display = 'none';
  noResults.innerHTML = '<p>검색/필터 조건에 해당하는 결과가 없습니다.</p>';
  const cardsContainer = $('#projectCards');
  if (cardsContainer && cardsContainer.parentNode) {
    cardsContainer.parentNode.insertBefore(noResults, cardsContainer.nextSibling);
  }

  // Collect all tags from cards
  const allTags = new Set();
  cards.forEach(card => {
    (card.dataset.tags || '').split(',').filter(Boolean).forEach(t => allTags.add(t.trim()));
  });
  const selected = new Set();

  // Render tag filter buttons
  const makeBtn = (tag) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn';
    btn.textContent = tag;
    btn.setAttribute('data-tag', tag);
    btn.setAttribute('aria-label', `태그 필터: ${tag}`);
    btn.setAttribute('aria-pressed', 'false');
    btn.addEventListener('click', () => {
      if (selected.has(tag)) selected.delete(tag); else selected.add(tag);
      btn.classList.toggle('active', selected.has(tag));
      btn.setAttribute('aria-pressed', String(selected.has(tag)));
      filter();
    });
    return btn;
  };
  Array.from(allTags).sort().forEach(tag => tagFiltersEl && tagFiltersEl.appendChild(makeBtn(tag)));

  // Clear filters
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      selected.clear();
      $$('#tagFilters .btn').forEach(b => b.classList.remove('active'));
      filter();
    });
  }

  // Filtering logic
  const filter = () => {
    const q = (searchInput && searchInput.value || '').toLowerCase().trim();
    cards.forEach(card => {
      const title = card.dataset.title || '';
      const summary = card.dataset.summary || '';
      const tags = (card.dataset.tags || '').split(',').filter(Boolean);
      const textMatch = !q || title.includes(q) || summary.includes(q);
      const tagsMatch = selected.size === 0 || Array.from(selected).every(t => tags.includes(t));
      card.style.display = (textMatch && tagsMatch) ? '' : 'none';
    });

    // Update results info and no-results state
    const visibleCount = cards.filter(c => c.style.display !== 'none').length;
    if (resultsInfo) resultsInfo.textContent = `${visibleCount}개 결과`;
    if (noResults) noResults.style.display = visibleCount === 0 ? '' : 'none';
  };

  // Debounce helper
  const debounce = (fn, ms=150) => {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn.apply(null, args), ms); };
  };
  const debouncedFilter = debounce(filter, 150);

  if (searchInput) searchInput.addEventListener('input', debouncedFilter);
  // Init once
  filter();
})();
