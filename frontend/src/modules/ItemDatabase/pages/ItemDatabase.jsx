import React, { useState } from "react";
import { useItems } from "./useItems";
import { FilterBar } from "../components/FilterBar";
import { ItemCard } from "../components/ItemCard";
import { ItemModal } from "../components/ItemModal";
import { Pagination } from "../components/Pagination";
import "./ItemDatabase.css";

const ItemDatabase = () => {
  const {
    items,
    categories,
    pagination,
    filters,
    loading,
    error,
    updateFilter,
    setPage,
    resetFilters,
  } = useItems();

  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <div className="item-db">
      {/* ── Header ───────────────────────────────────── */}
      <div className="item-db__header">
        <div className="item-db__header-inner">
          <p className="item-db__eyebrow">Lordran Archives</p>
          <h1 className="item-db__title">Item Database</h1>
          <p className="item-db__subtitle">
            Browse weapons, armor, rings, and shields. Filter by scaling grade
            or stat requirements to find gear for your build.
          </p>
        </div>
        <div className="item-db__header-ornament" aria-hidden="true">
          <span>⚜</span>
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────── */}
      <FilterBar
        filters={filters}
        categories={categories}
        onUpdate={updateFilter}
        onReset={resetFilters}
      />

      {/* ── State: loading / error / empty / grid ────── */}
      <div className="item-db__content">
        {loading && (
          <div className="item-db__status">
            <div className="item-db__spinner" />
            <p>Consulting the archives…</p>
          </div>
        )}

        {!loading && error && (
          <div className="item-db__status item-db__status--error">
            <p>⚠ {error}</p>
            <button onClick={resetFilters} className="item-db__retry">
              Try again
            </button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="item-db__status">
            <p className="item-db__empty-icon">🕯</p>
            <p>No items match your search.</p>
            <button onClick={resetFilters} className="item-db__retry">
              Clear filters
            </button>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <>
            <div className="item-db__grid">
              {items.map((item) => (
                <ItemCard
                  key={item._id}
                  item={item}
                  onClick={setSelectedItem}
                />
              ))}
            </div>

            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* ── Detail Modal ─────────────────────────────── */}
      {selectedItem && (
        <ItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};

export default ItemDatabase;
