import React, { useEffect } from "react";

const SCALING_COLOR = {
  S: "#d4a853",
  A: "#7fc47f",
  B: "#6ab0d4",
  C: "#aaaaaa",
  D: "#888888",
  E: "#666666",
  "-": "#555",
};

const StatRow = ({ label, value, color }) => (
  <div className="modal__stat-row">
    <span className="modal__stat-label">{label}</span>
    <span className="modal__stat-value" style={color ? { color } : {}}>
      {value}
    </span>
  </div>
);

export const ItemModal = ({ item, onClose }) => {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!item) return null;

  const hasDamage = Object.values(item.baseDamage || {}).some((v) => v > 0);
  const hasDefense = Object.values(item.defense || {}).some((v) => v > 0);
  const hasScaling = Object.values(item.scaling || {}).some((v) => v && v !== "-");
  const hasReqs = Object.values(item.requirements || {}).some((v) => v > 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose}>✕</button>

        <div className="modal__header">
          {item.imageUrl && (
            <img src={item.imageUrl} alt={item.name} className="modal__img" />
          )}
          <div>
            <p className="modal__category">{item.category} · {item.type}</p>
            <h2 className="modal__title">{item.name}</h2>
            {item.weight > 0 && (
              <p className="modal__weight">Weight: {item.weight}</p>
            )}
          </div>
        </div>

        {item.description && (
          <p className="modal__description">{item.description}</p>
        )}

        {item.effect && (
          <div className="modal__section">
            <h4 className="modal__section-title">Effect</h4>
            <p className="modal__effect">{item.effect}</p>
          </div>
        )}

        {hasDamage && (
          <div className="modal__section">
            <h4 className="modal__section-title">Base Damage</h4>
            {Object.entries(item.baseDamage).map(
              ([key, val]) =>
                val > 0 && (
                  <StatRow key={key} label={capitalize(key)} value={val} />
                )
            )}
          </div>
        )}

        {hasDefense && (
          <div className="modal__section">
            <h4 className="modal__section-title">Defense</h4>
            {Object.entries(item.defense).map(
              ([key, val]) =>
                val > 0 && (
                  <StatRow key={key} label={capitalize(key)} value={val} />
                )
            )}
          </div>
        )}

        {hasScaling && (
          <div className="modal__section">
            <h4 className="modal__section-title">Scaling</h4>
            <div className="modal__scaling-grid">
              {Object.entries(item.scaling).map(
                ([stat, grade]) =>
                  grade && grade !== "-" && (
                    <div key={stat} className="modal__scaling-cell">
                      <span className="modal__scaling-stat">
                        {capitalize(stat)}
                      </span>
                      <span
                        className="modal__scaling-grade"
                        style={{ color: SCALING_COLOR[grade] }}
                      >
                        {grade}
                      </span>
                    </div>
                  )
              )}
            </div>
          </div>
        )}

        {hasReqs && (
          <div className="modal__section">
            <h4 className="modal__section-title">Requirements</h4>
            {Object.entries(item.requirements).map(
              ([stat, val]) =>
                val > 0 && (
                  <StatRow key={stat} label={capitalize(stat)} value={val} />
                )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
