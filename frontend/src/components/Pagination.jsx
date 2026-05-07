import React from "react";

export const Pagination = ({ pagination, onPageChange }) => {
  const { page, totalPages, total } = pagination;
  if (!totalPages || totalPages <= 1) return null;

  const pages = [];
  const range = 2;
  for (let i = Math.max(1, page - range); i <= Math.min(totalPages, page + range); i++) {
    pages.push(i);
  }

  return (
    <div className="pagination">
      <span className="pagination__info">
        {total} items · Page {page} of {totalPages}
      </span>
      <div className="pagination__controls">
        <button
          className="pagination__btn"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          ‹ Prev
        </button>

        {pages[0] > 1 && (
          <>
            <button className="pagination__btn" onClick={() => onPageChange(1)}>1</button>
            {pages[0] > 2 && <span className="pagination__ellipsis">…</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            className={`pagination__btn ${p === page ? "pagination__btn--active" : ""}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && (
              <span className="pagination__ellipsis">…</span>
            )}
            <button
              className="pagination__btn"
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          className="pagination__btn"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next ›
        </button>
      </div>
    </div>
  );
};
