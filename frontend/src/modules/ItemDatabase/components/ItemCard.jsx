import React, { useState } from "react";

const SCALING_COLOR = {
  S: "#d4a853",
  A: "#7fc47f",
  B: "#6ab0d4",
  C: "#aaaaaa",
  D: "#888888",
  E: "#666666",
  "-": "#444",
};

const TYPE_ICON = {
  Weapon: "⚔️",
  Armor: "🛡️",
  Ring: "💍",
  Shield: "🔰",
};

export const ItemCard = ({ item, onClick }) => {
  const [imgError, setImgError] = useState(false);

  const scalingEntries = Object.entries(item.scaling || {}).filter(
    ([, v]) => v && v !== "-"
  );

  return (
    <div className="item-card" onClick={() => onClick(item)}>
      <div className="item-card__img-wrapper">
        {item.imageUrl && !imgError ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="item-card__img"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="item-card__img-fallback">
            <span>{TYPE_ICON[item.type] || "📦"}</span>
          </div>
        )}
      </div>

      <div className="item-card__body">
        <p className="item-card__category">{item.category}</p>
        <h3 className="item-card__name">{item.name}</h3>

        <div className="item-card__stats">
          {item.type === "Weapon" && item.baseDamage?.physical > 0 && (
            <span className="stat-pill stat-pill--dmg">
              {item.baseDamage.physical} Phys
            </span>
          )}
          {item.weight > 0 && (
            <span className="stat-pill stat-pill--wt">{item.weight} wt</span>
          )}
          {item.type === "Ring" && item.effect && (
            <span className="stat-pill stat-pill--ring" title={item.effect}>
              {item.effect.length > 28
                ? item.effect.slice(0, 26) + "…"
                : item.effect}
            </span>
          )}
        </div>

        {scalingEntries.length > 0 && (
          <div className="item-card__scaling">
            {scalingEntries.map(([stat, grade]) => (
              <span
                key={stat}
                className="scaling-badge"
                style={{ color: SCALING_COLOR[grade] }}
                title={`${stat} scaling`}
              >
                {stat[0].toUpperCase()}: {grade}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
