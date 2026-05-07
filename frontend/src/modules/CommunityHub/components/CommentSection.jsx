import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loadComments,
  submitComment,
  removeComment,
  reportComment,
} from "../../store/communitySlice";

const CommentSection = ({ buildId }) => {
  const dispatch = useDispatch();
  const { comments, commentsPagination, loadingComments, submittingComment } =
    useSelector((s) => s.community);
  const { user } = useSelector((s) => s.auth); // from your existing auth slice

  const [text, setText] = useState("");
  const [flagModal, setFlagModal] = useState(null); // commentId being flagged
  const [flagReason, setFlagReason] = useState("");

  useEffect(() => {
    if (buildId) dispatch(loadComments({ buildId, params: { limit: 20 } }));
  }, [buildId, dispatch]);

  const handleSubmit = () => {
    if (!text.trim()) return;
    dispatch(submitComment({ buildId, content: text }));
    setText("");
  };

  const handleDelete = (commentId) => {
    if (window.confirm("Delete this comment?")) {
      dispatch(removeComment(commentId));
    }
  };

  const handleFlag = () => {
    dispatch(reportComment({ commentId: flagModal, reason: flagReason }));
    setFlagModal(null);
    setFlagReason("");
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <section style={{ marginTop: "2.5rem" }}>
      {/* Header */}
      <h3 style={{
        fontFamily: "'Cinzel', serif",
        fontSize: "1rem",
        color: "#c8a35f",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        marginBottom: "1.5rem",
        borderBottom: "1px solid #2e2415",
        paddingBottom: "0.75rem",
      }}>
        ⚔ Inscriptions ({commentsPagination?.total || 0})
      </h3>

      {/* Input */}
      {user ? (
        <div style={{ marginBottom: "2rem" }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Leave your mark, Undead..."
            maxLength={1000}
            rows={3}
            style={{
              width: "100%",
              background: "#0f0d0a",
              border: "1px solid #2e2415",
              borderRadius: "3px",
              color: "#c8b89a",
              padding: "0.75rem 1rem",
              fontSize: "0.9rem",
              fontFamily: "'Crimson Text', serif",
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#c8a35f")}
            onBlur={(e) => (e.target.style.borderColor = "#2e2415")}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
            <span style={{ fontSize: "0.72rem", color: "#4a3d26" }}>{text.length}/1000</span>
            <button
              onClick={handleSubmit}
              disabled={submittingComment || !text.trim()}
              style={{
                background: submittingComment || !text.trim() ? "#1a1510" : "#c8a35f",
                color: submittingComment || !text.trim() ? "#4a3d26" : "#0f0d0a",
                border: "none",
                borderRadius: "3px",
                padding: "0.5rem 1.4rem",
                fontSize: "0.82rem",
                fontFamily: "'Cinzel', serif",
                letterSpacing: "0.05em",
                cursor: submittingComment || !text.trim() ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
            >
              {submittingComment ? "Inscribing..." : "Inscribe"}
            </button>
          </div>
        </div>
      ) : (
        <p style={{ color: "#6b5a3a", fontSize: "0.85rem", marginBottom: "1.5rem", fontStyle: "italic" }}>
          Sign in to leave an inscription.
        </p>
      )}

      {/* Comments list */}
      {loadingComments ? (
        <p style={{ color: "#6b5a3a", textAlign: "center", padding: "2rem" }}>Loading inscriptions...</p>
      ) : comments.length === 0 ? (
        <p style={{ color: "#4a3d26", textAlign: "center", padding: "2rem", fontStyle: "italic" }}>
          No inscriptions yet. Be the first.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {comments.map((comment) => (
            <div
              key={comment._id}
              style={{
                background: "#120f0a",
                border: "1px solid #2a1f10",
                borderRadius: "3px",
                padding: "1rem 1.2rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.78rem", color: "#9a7d4a" }}>
                  {comment.authorId?.name || "Unknown Undead"}
                </span>
                <span style={{ fontSize: "0.72rem", color: "#4a3d26" }}>
                  {timeAgo(comment.createdAt)}
                </span>
              </div>
              <p style={{ color: "#c0a87a", fontSize: "0.9rem", fontFamily: "'Crimson Text', serif", lineHeight: 1.6, margin: 0 }}>
                {comment.content}
              </p>

              {/* Actions */}
              {user && (
                <div style={{ display: "flex", gap: "1rem", marginTop: "0.6rem" }}>
                  {(user._id === comment.authorId?._id || user.role === "admin") && (
                    <button
                      onClick={() => handleDelete(comment._id)}
                      style={actionBtnStyle("#8b2020")}
                    >
                      Delete
                    </button>
                  )}
                  {user._id !== comment.authorId?._id && (
                    <button
                      onClick={() => setFlagModal(comment._id)}
                      style={actionBtnStyle("#6b5a3a")}
                    >
                      Report
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Flag modal */}
      {flagModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div style={{
            background: "#1a1510", border: "1px solid #c8a35f44",
            borderRadius: "4px", padding: "2rem", width: "400px", maxWidth: "90vw",
          }}>
            <h4 style={{ fontFamily: "'Cinzel', serif", color: "#c8a35f", marginBottom: "1rem" }}>
              Report Inscription
            </h4>
            <textarea
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="Reason (optional)"
              rows={3}
              style={{
                width: "100%", background: "#0f0d0a", border: "1px solid #2e2415",
                color: "#c8b89a", padding: "0.6rem", borderRadius: "3px",
                fontSize: "0.85rem", boxSizing: "border-box", marginBottom: "1rem",
              }}
            />
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button onClick={() => setFlagModal(null)} style={actionBtnStyle("#4a3d26")}>
                Cancel
              </button>
              <button onClick={handleFlag} style={actionBtnStyle("#c8a35f", "#0f0d0a")}>
                Report
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const actionBtnStyle = (color, textColor = color) => ({
  background: "transparent",
  border: "none",
  color,
  fontSize: "0.72rem",
  cursor: "pointer",
  padding: "0",
  fontFamily: "'Cinzel', serif",
  letterSpacing: "0.05em",
  opacity: 0.8,
});

export default CommentSection;
