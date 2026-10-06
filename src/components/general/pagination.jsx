import React from "react";

import { getPageNumbers, PAGE_GAP } from "../../utils/pageNumbers";

import "./pagination.css";

// Numbered page bar: ‹ 1 … 4 5 [6] 7 8 … 143 ›
const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <nav className="pagination" aria-label="Pages">
      <button
        type="button"
        className="pagination-button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        ‹
      </button>

      {pages.map((entry, index) =>
        entry === PAGE_GAP ? (
          <span
            key={`gap-${index}`}
            className="pagination-gap"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <button
            key={entry}
            type="button"
            className={`pagination-button ${
              entry === page ? "pagination-button-active" : ""
            }`}
            onClick={() => onPageChange(entry)}
            aria-current={entry === page ? "page" : undefined}
          >
            {entry}
          </button>
        )
      )}

      <button
        type="button"
        className="pagination-button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        ›
      </button>
    </nav>
  );
};

export default Pagination;
