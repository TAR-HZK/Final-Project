import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  loadBuildDetail,
  submitRating,
  clearSelectedBuild,
  clearError,
  clearSuccess,
} from "../../store/communitySlice";
import StarRating from "../../components/community/StarRating";
import CommentSection from "../../components/community/CommentSection";

const STAT_COLORS = {
  vigor: "#c84040",
  endurance: "#40a0c8",
  strength: "#c8a35f",
  dexterity: "#70c840",
  intelligence: "#8040c8",
  faith: "#c8c040",
  vitality: "#c87040",
  luck: "#40c8a0",
};

const BuildDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedBuild, loadingDetail, error, successMessage, submittingRating } =
    useSelector((s) => s.community);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(loadBuildDetail(id));
    return () => dispatch(clearSelectedBuild());
  }, [id, dispatch]);

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => dispatch(clearSuccess()), 3000);
      return () => clearTimeout(t);
    }
  }, [successMessage, dispatch]);

  const handleRate = (value) => {
    if (!user) return;
    dispatch(submitRating({ buildId: id, value }));
  };

  if (loadingDetail) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0805", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b5a3a", fontFamily: "'Crimson Text', serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⚙</div>
          <p style={{ fontStyle: "italic" }}>Consulting the archives...</p>
        </div>
      </div>
    );
  }

  if (error || !selectedBuild) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0805", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cinzel', serif" }}>
        <div style={{ textAlign: "center", color: "#c84040" }}>
          <p style={{ fontSize: "1.1rem" }}>{error || "Build not found"}</p>
          <button onClick={() => navigate("/community")} style={{ marginTop: "1rem", background: "none", border: "1px solid #c8a35f", color: "#c8a35f", padding: "0.5rem 1.2rem", cursor: "pointer", borderRadius: "3px", fontFamily: "'Cinzel', serif" }}>
            ← Return
          </button>
        </div>
      </div>
    );
  }

  const build = selectedBuild;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0805",
      padding: "2rem 1.5rem 4rem",
      fontFamily: "'Crimson Text', serif",
      color: "#c8b89a",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: "800px", margin: "0 auto" }}>

        {/* Back */}
        <button
          onClick={() => navigate("/community")}
          style={{
            background: "none", border: "none", color: "#6b5a3a",
            cursor: "pointer", fontSize: "0.85rem", fontFamily: "'Cinzel', serif",
            letterSpacing: "0.05em", marginBottom: "1.5rem", padding: 0,
          }}
        >
          ← Community Hub
        </button>

        {/* Toast */}
        {successMessage && (
          <div style={{
            background: "#0a1a0a", border: "1px solid #40a040", borderRadius: "3px",
            padding: "0.6rem 1rem", marginBottom: "1rem", color: "#60c060", fontSize: "0.85rem",
          }}>
            ✓ {successMessage}
          </div>
        )}

        {/* Build header */}
        <div style={{
          background: "linear-gradient(135deg, #1a1510 0%, #0f0d0a 100%)",
          border: "1px solid #2e2415",
          borderRadius: "4px",
          padding: "2rem",
          marginBottom: "1.5rem",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Decorative bg rune */}
          <div style={{
            position: "absolute", right: "-20px", top: "-20px",
            fontSize: "8rem", opacity: 0.03, userSelect: "none",
            fontFamily: "'Cinzel', serif",
          }}>⚔</div>

          <p style={{ fontSize: "0.72rem", letterSpacing: "0.2em", color: "#6b5a3a", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            by {build.authorId?.name || "Unknown"}
          </p>
          <h1 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "clamp(1.4rem, 3vw, 2rem)",
            color: "#e8d5a3",
            letterSpacing: "0.06em",
            margin: "0 0 1.5rem",
          }}>
            {build.title}
          </h1>

          {/* Stats grid */}
          {build.stats && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
              gap: "0.6rem",
              marginBottom: "1.5rem",
            }}>
              {Object.entries(build.stats).map(([key, val]) => (
                <div key={key} style={{
                  background: "#0a0805",
                  border: `1px solid ${STAT_COLORS[key.toLowerCase()] || "#2e2415"}22`,
                  borderLeft: `3px solid ${STAT_COLORS[key.toLowerCase()] || "#2e2415"}`,
                  borderRadius: "2px",
                  padding: "0.5rem 0.8rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <span style={{ fontSize: "0.72rem", color: "#6b5a3a", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {key}
                  </span>
                  <span style={{
                    fontFamily: "monospace",
                    fontSize: "1rem",
                    color: STAT_COLORS[key.toLowerCase()] || "#c8b89a",
                    fontWeight: "bold",
                  }}>
                    {val}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Equipment */}
          {build.equipment && Object.keys(build.equipment).length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "0.72rem", letterSpacing: "0.15em", color: "#6b5a3a", textTransform: "uppercase", marginBottom: "0.6rem" }}>Equipment</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {Object.entries(build.equipment).map(([slot, item]) => (
                  <span key={slot} style={{
                    background: "#1a1510", border: "1px solid #2e2415",
                    borderRadius: "2px", padding: "4px 10px",
                    fontSize: "0.78rem", color: "#9a7d4a",
                  }}>
                    <span style={{ color: "#4a3d26", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{slot}: </span>
                    {typeof item === "object" ? item?.name || "—" : item || "—"}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Rating */}
          <div style={{
            borderTop: "1px solid #2e2415",
            paddingTop: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            flexWrap: "wrap",
          }}>
            <div>
              <p style={{ fontSize: "0.65rem", color: "#6b5a3a", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.3rem" }}>
                Community Rating
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <StarRating value={build.avgRating || 0} readonly />
                <span style={{ color: "#9a7d4a", fontSize: "0.9rem" }}>
                  {build.avgRating ? build.avgRating.toFixed(1) : "—"} ({build.ratingCount || 0})
                </span>
              </div>
            </div>

            {user && build.authorId?._id !== user._id && (
              <div>
                <p style={{ fontSize: "0.65rem", color: "#6b5a3a", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.3rem" }}>
                  {build.userRating ? "Your Rating" : "Rate this Build"}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <StarRating
                    value={build.userRating || 0}
                    onChange={handleRate}
                    size="lg"
                  />
                  {submittingRating && (
                    <span style={{ color: "#6b5a3a", fontSize: "0.8rem", fontStyle: "italic" }}>Saving...</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comments */}
        <CommentSection buildId={id} />
      </div>
    </div>
  );
};

export default BuildDetail;
