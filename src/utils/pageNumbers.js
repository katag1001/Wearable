export const PAGE_GAP = "gap";

/*
 * The page numbers to show in the pagination bar: always the first and
 * last page, plus a window around the current one, with gaps between.
 *
 *   getPageNumbers(6, 143) -> [1, "gap", 4, 5, 6, 7, 8, "gap", 143]
 */
export const getPageNumbers = (currentPage, totalPages, around = 2) => {
  if (totalPages <= 1) return [1];

  const start = Math.max(2, currentPage - around);
  const end = Math.min(totalPages - 1, currentPage + around);

  const pages = [1];

  if (start > 2) pages.push(PAGE_GAP);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (end < totalPages - 1) pages.push(PAGE_GAP);

  pages.push(totalPages);

  return pages;
};
