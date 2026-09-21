export function groupUnityHistoryEntries(entries, locale) {
  const monthFormatter = new Intl.DateTimeFormat(locale, { month: 'long' });
  const groups = [];

  entries.forEach((entry) => {
    const date = new Date(entry.createdAt);
    const key = Number.isNaN(date.getTime())
      ? 'undated'
      : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    let group = groups[groups.length - 1];

    if (!group || group.key !== key) {
      group = {
        key,
        year: Number.isNaN(date.getTime()) ? '—' : String(date.getFullYear()),
        month: Number.isNaN(date.getTime()) ? '—' : monthFormatter.format(date).toLocaleUpperCase(locale),
        entries: [],
      };
      groups.push(group);
    }

    group.entries.push(entry);
  });

  return groups;
}
