import { useNavigate } from "react-router-dom";
import StarRating from "./StarRating";

/**
 * BuildCard — shown in the community feed grid.
 * Expects a build object with: title, author, stats, avgRating, ratingCount, commentCount, createdAt
 */
const BuildCard = ({ build }) => {
  const navigate = useNavigate();

  const soulLevel = build.stats
    ? Object.values(build.stats).reduce((sum, v) => sum + (Number(v) || 0), 0)
    : "?";

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "today";
    if (days === 1) return "yesterday";
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  };

  return (
    <article
      onClick={() => navigate(`/community/builds/${build._id}`)}
      style={{
        background: "linear-gradient(135deg, #1a1510 0%, #0f0d0a 100%)",
        border: "1px solid #2e2415",
        borderRadius: "4px",
        padding: "1.5rem",
        cursor: "pointer",
        transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#c8a35f";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(200,163,95,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#2e2415";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Decorative corner accent */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: "40px", height: "40px",
        borderBottom: "40px solid transparent",
        borderRight: "40px solid #2e2415",
      }} />

      {/* Build title */}
      <h3 style={{
        fontFamily: "'Cinzel', serif",
        fontSize: "1.05rem",
        color: "#e8d5a3",
        marginBottom: "0.4rem",
        letterSpacing: "0.03em",
        lineHeight: 1.3,
        paddingRight: "2rem",
      }}>
        {build.title}
      </h3>

      {/* Author & date */}
      <p style={{ fontSize: "0.75rem", color: "#6b5a3a", marginBottom: "1rem" }}>
        by <span style={{ color: "#9a7d4a" }}>{build.author?.name || "Unknown"}</span>
        {" · "}
        {timeAgo(build.createdAt)}
      </p>

      {/* Stats chips */}
      {build.stats && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "1rem" }}>
          {Object.entries(build.stats)
            .slice(0, 4)
            .map(([key, val]) => (
              <span key={key} style={{
                background: "#1f1a10",
                border: "1px solid #2e2415",
                borderRadius: "2px",
                padding: "2px 8px",
                fontSize: "0.7rem",
                color: "#8a7050",
                fontFamily: "monospace",
                letterSpacing: "0.05em",
              }}>
                {key.slice(0, 3).toUpperCase()} {val}
              </span>
            ))}
          <span style={{
            background: "#1f1a10",
            border: "1px solid #c8a35f44",
            borderRadius: "2px",
            padding: "2px 8px",
            fontSize: "0.7rem",
            color: "#c8a35f",
            fontFamily: "monospace",
          }}>
            SL {soulLevel}
          </span>
        </div>
      )}

      {/* Rating + comments */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <StarRating value={build.avgRating || 0} readonly size="sm" />
          <span style={{ fontSize: "0.72rem", color: "#6b5a3a" }}>
            {build.avgRating ? build.avgRating.toFixed(1) : "—"}
            {" "}({build.ratingCount || 0})
          </span>
        </div>
        <span style={{ fontSize: "0.72rem", color: "#6b5a3a" }}>
          💬 {build.commentCount || 0}
        </span>
      </div>
    </article>
  );
};

export default BuildCard;
