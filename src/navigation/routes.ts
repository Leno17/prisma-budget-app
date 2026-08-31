export const appRoutes = {
  dashboard: '/dashboard',
  history: '/history',
  newExpense: '/expenses/new',
  settings: '/settings',
  setup: '/setup',
  editExpense: (id: string) => ({ pathname: '/expenses/[id]' as const, params: { id } }),
} as const;
