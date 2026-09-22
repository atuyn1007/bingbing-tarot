// Read-only presentation index. Source objects and their persistence stay untouched.
export function buildReadingArchive({ unity = [], tarot = [], daily = {} }) {
  return [
    ...unity.map(source => ({ ...source, id: `unity:${source.id}`, kind: 'unity', source, canDelete: true })),
    ...tarot.map(source => ({ ...source, id: `tarot:${source.id}`, kind: 'tarot', source, canDelete: true })),
    ...Object.entries(daily).filter(([dateKey, card]) => card && /^\d{4}-\d{2}-\d{2}$/.test(dateKey)).map(([dateKey, card]) => ({
      id: `daily:${dateKey}`, kind: 'daily', createdAt: `${dateKey}T12:00:00`, dateOnly: true,
      question: card.name || '', source: { dateKey, card }, canDelete: false,
    })),
  ].sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0));
}

export function filterReadingArchive(entries, query = '', kind = 'all') {
  const term = query.trim().toLocaleLowerCase();
  return entries.filter(entry => (kind === 'all' || entry.kind === kind) &&
    (!term || [entry.question, entry.createdAt, entry.primaryHexagramNumber, entry.changedHexagramNumber, entry.spreadName]
      .filter(value => value != null).join(' ').toLocaleLowerCase().includes(term)));
}
