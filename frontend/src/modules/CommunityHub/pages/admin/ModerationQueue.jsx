import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeComment, clearError } from "../../store/communitySlice";
import { fetchFlaggedComments, unflagComment } from "../../api/communityAPI";

const ModerationQueue = () => {
  const dispatch = useDispatch();
  const { error } = useSelector((s) => s.community);

  const [flagged, setFlagged] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await fetchFlaggedComments();
      setFlagged(data.data);
    } catch {
      /* handled below */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (commentId) => {
    if (!window.confirm("Permanently delete this comment?")) return;
    dispatch(removeComment(commentId));
    setFlagged((prev) => prev.filter((c) => c._id !== commentId));
    toast("Comment deleted.");
  };

  const handleApprove = async (commentId) => {
    try {
      await unflagComment(commentId);
      setFlagged((prev) => prev.filter((c) => c._id !== commentId));
      toast("Comment approved and unflagged.");
    } catch {
      toast("Failed to approve comment.", true);
    }
  };

  const toast = (msg, isError = false) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(""), 3000);
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "today";
    if (days === 1) return "yesterday";
    return `${days}d ago`;
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0805",
      padding: "2rem 1.5rem 4rem",
      fontFamily: "'Crimson Text', serif",
      color: "#c8b89a",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        <header style={{ marginBottom: "2.5rem" }}>
          <p style={{ fontSize: "0.72rem", letterSpacing: "0.25em", color: "#8b2020", textTransform: "uppercase", marginBottom: "0.3rem" }}>
            Admin Panel
          </p>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.8rem", color: "#e8d5a3", letterSpacing: "0.06em" }}>
            Moderation Queue
          </h1>
          <p style={{ color: "#6b5a3a", fontSize: "0.9rem", fontStyle: "italic" }}>
            {flagged.length} flagged inscription{flagged.length !== 1 ? "s" : ""} awaiting review
          </p>
        </header>

        {/* Toast */}
        {actionMsg && (
          <div style={{
            background: "#0a1a0a", border: "1px solid #40a040", borderRadius: "3px",
            padding: "0.6rem 1rem", marginBottom: "1rem", color: "#60c060", fontSize: "0.85rem",
          }}>
            ✓ {actionMsg}
          </div>
        )}

        {error && (
          <div style={{
            background: "#1a0a0a", border: "1px solid #8b2020", borderRadius: "3px",
            padding: "0.6rem 1rem", marginBottom: "1rem", color: "#c84040", fontSize: "0.85rem",
            display: "flex", justifyContent: "space-between",
          }}>
            {error}
            <button onClick={() => dispatch(clearError())} style={{ background: "none", border: "none", color: "#c84040", cursor: "pointer" }}>✕</button>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "#6b5a3a", fontStyle: "italic" }}>
            Loading flagged inscriptions...
          </div>
        ) : flagged.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "4rem",
            border: "1px solid #2e2415", borderRadius: "4px",
            background: "#0f0d0a", color: "#4a3d26",
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚔</div>
            <p style={{ fontFamily: "'Cinzel', serif" }}>Queue is clear</p>
            <p style={{ fontSize: "0.85rem", fontStyle: "italic", marginTop: "0.3rem" }}>No flagged inscriptions. The community is at peace.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {flagged.map((comment) => (
              <div key={comment._id} style={{
                background: "#120f0a",
                border: "1px solid #8b202040",
                borderLeft: "3px solid #8b2020",
                borderRadius: "3px",
                padding: "1.2rem 1.5rem",
              }}>
                {/* Meta */}
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.6rem" }}>
                  <div>
                    <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.78rem", color: "#9a7d4a" }}>
                      {comment.authorId?.name || "Unknown"}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "#4a3d26", margin: "0 0.5rem" }}>on</span>
                    <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.78rem", color: "#c8a35f" }}>
                      {comment.buildId?.title || "Unknown Build"}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "#4a3d26" }}>{timeAgo(comment.createdAt)}</span>
                </div>

                {/* Content */}
                <p style={{ color: "#a09070", fontSize: "0.9rem", lineHeight: 1.6, margin: "0 0 0.8rem" }}>
                  {comment.content}
                </p>

                {/* Flag reason */}
                {comment.flagReason && (
                  <p style={{ fontSize: "0.75rem", color: "#8b2020", fontStyle: "italic", marginBottom: "0.8rem" }}>
                    ⚑ Flagged: {comment.flagReason}
                  </p>
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    onClick={() => handleApprove(comment._id)}
                    style={{
                      background: "transparent", border: "1px solid #40a040",
                      color: "#40a040", borderRadius: "3px",
                      padding: "0.35rem 1rem", cursor: "pointer",
                      fontFamily: "'Cinzel', serif", fontSize: "0.72rem",
                      letterSpacing: "0.05em", transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { e.target.style.background = "#40a040"; e.target.style.color = "#0a0805"; }}
                    onMouseLeave={(e) => { e.target.style.background = "transparent"; e.target.style.color = "#40a040"; }}
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => handleDelete(comment._id)}
                    style={{
                      background: "transparent", border: "1px solid #8b2020",
                      color: "#8b2020", borderRadius: "3px",
                      padding: "0.35rem 1rem", cursor: "pointer",
                      fontFamily: "'Cinzel', serif", fontSize: "0.72rem",
                      letterSpacing: "0.05em", transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { e.target.style.background = "#8b2020"; e.target.style.color = "#e8d5a3"; }}
                    onMouseLeave={(e) => { e.target.style.background = "transparent"; e.target.style.color = "#8b2020"; }}
                  >
                    ✕ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModerationQueue;
