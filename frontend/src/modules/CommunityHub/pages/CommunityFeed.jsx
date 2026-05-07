import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadBuilds, clearError } from "../../store/communitySlice";
import BuildCard from "../../components/community/BuildCard";

const CommunityFeed = () => {
  const dispatch = useDispatch();
  const { builds, pagination, loadingBuilds, error } = useSelector((s) => s.community);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const fetchBuilds = useCallback(() => {
    dispatch(loadBuilds({ search, sort, page, limit: 12 }));
  }, [dispatch, search, sort, page]);

  useEffect(() => {
    fetchBuilds();
  }, [fetchBuilds]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [search, sort]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0805",
      padding: "2rem 1.5rem 4rem",
      fontFamily: "'Crimson Text', serif",
      color: "#c8b89a",
    }}>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap"
        rel="stylesheet"
      />

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Page Header */}
        <header style={{ marginBottom: "2.5rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.3em", color: "#6b5a3a", marginBottom: "0.5rem", textTransform: "uppercase" }}>
            — The Archive —
          </p>
          <h1 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "clamp(1.8rem, 4vw, 3rem)",
            color: "#e8d5a3",
            letterSpacing: "0.08em",
            margin: 0,
          }}>
            Community Hub
          </h1>
          <p style={{ color: "#6b5a3a", marginTop: "0.5rem", fontSize: "0.95rem", fontStyle: "italic" }}>
            Builds forged in fire, shared with the Undead
          </p>
        </header>

        {/* Controls */}
        <div style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: "220px", position: "relative" }}>
            <span style={{
              position: "absolute", left: "0.8rem", top: "50%", transform: "translateY(-50%)",
              color: "#6b5a3a", fontSize: "0.9rem",
            }}>⚔</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search builds..."
              style={{
                width: "100%",
                background: "#0f0d0a",
                border: "1px solid #2e2415",
                borderRadius: "3px",
                color: "#c8b89a",
                padding: "0.6rem 0.8rem 0.6rem 2.2rem",
                fontSize: "0.9rem",
                fontFamily: "'Crimson Text', serif",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#c8a35f")}
              onBlur={(e) => (e.target.style.borderColor = "#2e2415")}
            />
          </div>

          {/* Sort toggle */}
          <div style={{ display: "flex", background: "#0f0d0a", border: "1px solid #2e2415", borderRadius: "3px", overflow: "hidden" }}>
            {["newest", "top"].map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                style={{
                  padding: "0.6rem 1.2rem",
                  background: sort === s ? "#c8a35f" : "transparent",
                  color: sort === s ? "#0f0d0a" : "#6b5a3a",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Cinzel', serif",
                  fontSize: "0.78rem",
                  letterSpacing: "0.05em",
                  transition: "all 0.2s",
                }}
              >
                {s === "newest" ? "Newest" : "Top Rated"}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "#1a0a0a", border: "1px solid #8b2020", borderRadius: "3px",
            padding: "0.8rem 1rem", marginBottom: "1.5rem", color: "#c84040",
            fontSize: "0.85rem", display: "flex", justifyContent: "space-between",
          }}>
            {error}
            <button onClick={() => dispatch(clearError())} style={{ background: "none", border: "none", color: "#c84040", cursor: "pointer" }}>✕</button>
          </div>
        )}

        {/* Loading */}
        {loadingBuilds ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "#6b5a3a" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚙</div>
            <p style={{ fontStyle: "italic" }}>Consulting the archives...</p>
          </div>
        ) : builds.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "#4a3d26" }}>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: "1.1rem" }}>No builds found</p>
            <p style={{ fontStyle: "italic", fontSize: "0.9rem", marginTop: "0.5rem" }}>
              The archives are silent. Be the first to share your build.
            </p>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1rem",
              marginBottom: "2rem",
            }}>
              {builds.map((build) => (
                <BuildCard key={build._id} build={build} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={paginationBtn(page !== 1)}
                >
                  ‹ Prev
                </button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - page) <= 2)
                  .map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      style={paginationBtn(true, p === page)}
                    >
                      {p}
                    </button>
                  ))}
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  style={paginationBtn(page !== pagination.pages)}
                >
                  Next ›
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const paginationBtn = (active, current = false) => ({
  background: current ? "#c8a35f" : "transparent",
  color: current ? "#0f0d0a" : active ? "#9a7d4a" : "#2e2415",
  border: `1px solid ${current ? "#c8a35f" : "#2e2415"}`,
  borderRadius: "3px",
  padding: "0.4rem 0.8rem",
  cursor: active ? "pointer" : "not-allowed",
  fontFamily: "'Cinzel', serif",
  fontSize: "0.78rem",
  transition: "all 0.2s",
});

export default CommunityFeed;
