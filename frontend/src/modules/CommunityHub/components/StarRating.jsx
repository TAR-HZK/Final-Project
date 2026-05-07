import { useState } from "react";

/**
 * StarRating
 * Props:
 *  - value       : current rating (1-5 or null)
 *  - onChange    : (newValue) => void  — called when user clicks a star
 *  - readonly    : bool
 *  - size        : "sm" | "md" | "lg"
 */
const StarRating = ({ value = 0, onChange, readonly = false, size = "md" }) => {
  const [hovered, setHovered] = useState(0);

  const sizes = { sm: "1rem", md: "1.4rem", lg: "2rem" };
  const px = sizes[size] || sizes.md;

  return (
    <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = hovered ? star <= hovered : star <= Math.round(value);
        return (
          <span
            key={star}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            style={{
              fontSize: px,
              color: filled ? "#c8a35f" : "#3a3020",
              cursor: readonly ? "default" : "pointer",
              transition: "color 0.15s, transform 0.1s",
              transform: !readonly && hovered === star ? "scale(1.2)" : "scale(1)",
              display: "inline-block",
              userSelect: "none",
            }}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};

export default StarRating;
