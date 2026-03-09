/**
 * Returns the subset of CUITs for which ExtraData should be fetched:
 * only those where at least one BCRA endpoint (debts or cheques) returned successfully.
 */
export function getExtraDataCuits<T>(
  cuits: string[],
  debtSettled: PromiseSettledResult<T>[],
  checksSettled: PromiseSettledResult<T>[],
): string[] {
  return cuits.filter((_, i) =>
    debtSettled[i]?.status === 'fulfilled' || checksSettled[i]?.status === 'fulfilled'
  );
}
