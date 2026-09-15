"use client";

const pageSizes = [5, 10, 20];

export default function Pagination({ page, pageSize, totalItems, onPageChange, onPageSizeChange }) {
  if (totalItems === 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  return <nav className="pagination" aria-label="Paginação local">
    <span className="pagination-summary">Página {currentPage} de {totalPages}</span>
    <div className="pagination-controls">
      <button type="button" className="pagination-button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} aria-label="Página anterior">Anterior</button>
      <button type="button" className="pagination-button" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Próxima página">Próxima</button>
    </div>
    <label className="pagination-size">Itens por página
      <select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))} aria-label="Itens por página">
        {pageSizes.map((size) => <option value={size} key={size}>{size}</option>)}
      </select>
    </label>
  </nav>;
}