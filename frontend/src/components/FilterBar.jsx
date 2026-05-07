import React from "react";

const TYPES = ["Weapon", "Armor", "Ring", "Shield"];
const SCALING_GRADES = ["S", "A", "B", "C", "D", "E"];
const SORT_OPTIONS = [
  { value: "name", label: "Name (A–Z)" },
  { value: "weight", label: "Weight (Low)" },
  { value: "-weight", label: "Weight (High)" },
  { value: "physical", label: "Damage (High)" },
];

export const FilterBar = ({ filters, categories, onUpdate, onReset }) => (
  <div className="filter-bar">
    {/* Search */}
    <div className="filter-bar__search-wrap">
      <span className="filter-bar__search-icon">🔍</span>
      <input
        className="filter-bar__search"
        type="text"
        placeholder="Search weapons, armor, rings…"
        value={filters.search}
        onChange={(e) => onUpdate("search", e.target.value)}
      />
      {filters.search && (
        <button
          className="filter-bar__clear-search"
          onClick={() => onUpdate("search", "")}
        >
          ✕
        </button>
      )}
    </div>

    {/* Filter row */}
    <div className="filter-bar__row">
      <select
        value={filters.type}
        onChange={(e) => onUpdate("type", e.target.value)}
        className="filter-select"
      >
        <option value="">All Types</option>
        {TYPES.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <select
        value={filters.category}
        onChange={(e) => onUpdate("category", e.target.value)}
        className="filter-select"
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        value={filters.scalingGrade}
        onChange={(e) => onUpdate("scalingGrade", e.target.value)}
        className="filter-select"
      >
        <option value="">Any Scaling</option>
        {SCALING_GRADES.map((g) => (
          <option key={g} value={g}>Scaling: {g}</option>
        ))}
      </select>

      <select
        value={filters.sort}
        onChange={(e) => onUpdate("sort", e.target.value)}
        className="filter-select"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      <button className="filter-bar__reset" onClick={onReset}>
        Reset
      </button>
    </div>
  </div>
);
