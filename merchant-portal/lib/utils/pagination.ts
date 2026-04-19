/** Compact page list with ellipsis gaps (matches common Figma pagination patterns). */
export function getPaginationItems(currentPage: number, totalPages: number): Array<number | 'gap'> {
  if (totalPages < 1) return [];
  if (totalPages === 1) return [1];
  if (totalPages <= 9) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, 'gap', totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, 'gap', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, 'gap', currentPage - 1, currentPage, currentPage + 1, 'gap', totalPages];
}
