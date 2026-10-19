export function normalizeSearchTerm(term) {
  return term.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export const searchOptions = {
  fields: ['title', 'headingsText', 'category', 'plainText'],
  storeFields: ['title', 'category', 'path', 'passages', 'evidencePeriod', 'isIndex'],
  processTerm: normalizeSearchTerm,
  searchOptions: { prefix: true, fuzzy: 0.2, boost: { title: 4, headingsText: 2.5, category: 1.5, plainText: 1 } },
};
