import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadDashboard } from "../../store/adminDashboardSlice";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) => (n == null ? "—" : n.toLocaleString());

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// Fill in missing days in chart data so the sparkline is continuous
const fillDays = (data, days = 30) => {
  const map = {};
  data.forEach((d) => (map[d._id] = d.count));
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, count: map[key] || 0 });
  }
  return result;
};

// ─── Sparkline SVG ────────────────────────────────────────────────────────────

const Sparkline = ({ data, color = "#c8a35f", height = 48, filled = true }) => {
  if (!data || data.length === 0) return null;
  const w = 260;
  const h = height;
  const max = Math.max(...data.map((d) => d.count), 1);
  const pts = data.map((d, i) => [
    (i / (data.length - 1)) * w,
    h - (d.count / max) * (h - 4) - 2,
  ]);

  const polyline = pts.map((p) => p.join(",")).join(" ");
  const area = `M${pts[0][0]},${h} ` + pts.map((p) => `L${p[0]},${p[1]}`).join(" ") + ` L${pts[pts.length - 1][0]},${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: `${h}px`, overflow: "visible" }}>
      {filled && (
        <path d={area} fill={color} fillOpacity="0.08" />
      )}
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Last point dot */}
      <circle
        cx={pts[pts.length - 1][0]}
        cy={pts[pts.length - 1][1]}
        r="3"
        fill={color}
      />
    </svg>
  );
};

// ─── Mini bar chart ───────────────────────────────────────────────────────────

const BarChart = ({ data, color = "#c8a35f" }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: "60px" }}>
      {data.map((d, i) => (
        <div
          key={i}
          title={`${d.date}: ${d.count}`}
          style={{
            flex: 1,
            height: `${Math.max(2, (d.count / max) * 60)}px`,
            background: color,
            opacity: 0.4 + (i / data.length) * 0.6,
            borderRadius: "1px 1px 0 0",
            transition: "opacity 0.2s",
            cursor: "default",
          }}
          onMouseEnter={(e) => (e.target.style.opacity = 1)}
          onMouseLeave={(e) => (e.target.style.opacity = 0.4 + (i / data.length) * 0.6)}
        />
      ))}
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, accent = "#c8a35f", icon, chartData, chartColor, delay = 0 }) => (
  <div
    style={{
      background: "linear-gradient(145deg, #141008 0%, #0c0a06 100%)",
      border: `1px solid #2a1f10`,
      borderTop: `2px solid ${accent}`,
      borderRadius: "2px",
      padding: "1.4rem 1.5rem 1.2rem",
      position: "relative",
      overflow: "hidden",
      animation: `fadeSlideUp 0.5s ease both`,
      animationDelay: `${delay}ms`,
    }}
  >
    <div style={{ position: "relative", zIndex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.6rem" }}>
        <p style={{
          fontSize: "0.65rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#5a4a2e",
          fontFamily: "'Cinzel', serif",
          margin: 0,
        }}>
          {label}
        </p>
        {icon && <span style={{ fontSize: "1rem", opacity: 0.5 }}>{icon}</span>}
      </div>
      <p style={{
        fontFamily: "'Cinzel', serif",
        fontSize: "2.2rem",
        color: accent,
        margin: "0 0 0.2rem",
        lineHeight: 1,
        letterSpacing: "-0.02em",
      }}>
        {fmt(value)}
      </p>
      {sub && (
        <p style={{ fontSize: "0.72rem", color: "#6b5a3a", margin: 0 }}>{sub}</p>
      )}
    </div>

    {chartData && (
      <div style={{ marginTop: "0.8rem", opacity: 0.9 }}>
        <Sparkline data={chartData} color={chartColor || accent} height={40} />
      </div>
    )}

    {/* Decorative corner */}
    <div style={{
      position: "absolute", bottom: 0, right: 0,
      width: "60px", height: "60px",
      background: `radial-gradient(circle at bottom right, ${accent}08, transparent 70%)`,
    }} />
  </div>
);

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader = ({ children, accent = "#c8a35f" }) => (
  <div style={{
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
    marginBottom: "1rem",
    marginTop: "2rem",
  }}>
    <div style={{ width: "3px", height: "1rem", background: accent, borderRadius: "1px" }} />
    <h2 style={{
      fontFamily: "'Cinzel', serif",
      fontSize: "0.72rem",
      letterSpacing: "0.25em",
      textTransform: "uppercase",
      color: accent,
      margin: 0,
    }}>
      {children}
    </h2>
    <div style={{ flex: 1, height: "1px", background: "#2a1f10" }} />
  </div>
);

// ─── Leaderboard Row ──────────────────────────────────────────────────────────

const LeaderRow = ({ rank, title, metric, metricLabel, accent = "#c8a35f" }) => (
  <div style={{
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
    padding: "0.7rem 0",
    borderBottom: "1px solid #1a1408",
  }}>
    <span style={{
      fontFamily: "'Cinzel', serif",
      fontSize: "0.78rem",
      color: rank <= 3 ? accent : "#3a2e1a",
      minWidth: "1.5rem",
      textAlign: "center",
    }}>
      {rank === 1 ? "①" : rank === 2 ? "②" : rank === 3 ? "③" : `${rank}`}
    </span>
    <span style={{
      flex: 1,
      fontSize: "0.85rem",
      color: "#c8b89a",
      fontFamily: "'Crimson Text', serif",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    }}>
      {title}
    </span>
    <span style={{
      fontFamily: "monospace",
      fontSize: "0.8rem",
      color: accent,
      background: `${accent}14`,
      padding: "2px 8px",
      borderRadius: "2px",
      whiteSpace: "nowrap",
    }}>
      {metric} {metricLabel}
    </span>
  </div>
);

// ─── Activity Item ────────────────────────────────────────────────────────────

const ActivityItem = ({ event }) => {
  const isUser = event.type === "user_joined";
  return (
    <div style={{
      display: "flex",
      alignItems: "flex-start",
      gap: "0.75rem",
      padding: "0.6rem 0",
      borderBottom: "1px solid #120e08",
    }}>
      <div style={{
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        background: isUser ? "#1a1030" : "#1a1008",
        border: `1px solid ${isUser ? "#6040a0" : "#c8a35f"}33`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.7rem",
        flexShrink: 0,
        marginTop: "2px",
      }}>
        {isUser ? "👤" : "⚔"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: "0.82rem", color: "#c8b89a", fontFamily: "'Crimson Text', serif" }}>
          {isUser ? (
            <>
              <span style={{ color: "#9070d0" }}>{event.label}</span>
              {" joined the Undead Asylum"}
            </>
          ) : (
            <>
              <span style={{ color: "#9a7d4a" }}>{event.author || "Unknown"}</span>
              {" forged "}
              <span style={{ color: "#c8a35f" }}>{event.label}</span>
              {event.isPublic ? " (public)" : " (private)"}
            </>
          )}
        </p>
        <p style={{ margin: 0, fontSize: "0.68rem", color: "#4a3a22", marginTop: "2px" }}>
          {timeAgo(event.timestamp)}
        </p>
      </div>
    </div>
  );
};

// ─── Donut Chart (pure SVG — public vs private builds) ────────────────────────

const DonutChart = ({ publicCount, privateCount }) => {
  const total = publicCount + privateCount;
  if (total === 0) return <p style={{ color: "#4a3a22", fontSize: "0.8rem" }}>No data</p>;

  const pubPct = publicCount / total;
  const r = 36;
  const circ = 2 * Math.PI * r;
  const pubArc = pubPct * circ;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
      <svg width="88" height="88" viewBox="0 0 88 88">
        {/* Track */}
        <circle cx="44" cy="44" r={r} fill="none" stroke="#1a1408" strokeWidth="10" />
        {/* Public arc */}
        <circle
          cx="44" cy="44" r={r}
          fill="none"
          stroke="#c8a35f"
          strokeWidth="10"
          strokeDasharray={`${pubArc} ${circ - pubArc}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
        />
        {/* Private arc */}
        <circle
          cx="44" cy="44" r={r}
          fill="none"
          stroke="#3a2e18"
          strokeWidth="10"
          strokeDasharray={`${circ - pubArc} ${pubArc}`}
          strokeDashoffset={circ / 4 - pubArc}
          strokeLinecap="round"
        />
        <text x="44" y="40" textAnchor="middle" fill="#c8a35f" fontSize="11" fontFamily="'Cinzel', serif">
          {Math.round(pubPct * 100)}%
        </text>
        <text x="44" y="53" textAnchor="middle" fill="#6b5a3a" fontSize="8">
          public
        </text>
      </svg>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
          <div style={{ width: "8px", height: "8px", background: "#c8a35f", borderRadius: "50%" }} />
          <span style={{ fontSize: "0.75rem", color: "#9a7d4a" }}>Public — {fmt(publicCount)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "8px", height: "8px", background: "#3a2e18", borderRadius: "50%", border: "1px solid #5a4a2e" }} />
          <span style={{ fontSize: "0.75rem", color: "#5a4a2e" }}>Private — {fmt(privateCount)}</span>
        </div>
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading, error, lastFetched } = useSelector((s) => s.adminDashboard);
  const refreshTimer = useRef(null);

  useEffect(() => {
    dispatch(loadDashboard());
    // Auto-refresh every 5 minutes
    refreshTimer.current = setInterval(() => dispatch(loadDashboard()), 5 * 60 * 1000);
    return () => clearInterval(refreshTimer.current);
  }, [dispatch]);

  const userChartData = stats ? fillDays(stats.charts.userGrowth) : [];
  const buildChartData = stats ? fillDays(stats.charts.buildGrowth) : [];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080604",
      backgroundImage: `
        radial-gradient(ellipse at 20% 0%, #1a120800 0%, transparent 60%),
        repeating-linear-gradient(0deg, transparent, transparent 39px, #0f0c0820 40px),
        repeating-linear-gradient(90deg, transparent, transparent 39px, #0f0c0820 40px)
      `,
      padding: "2rem 1.5rem 5rem",
      fontFamily: "'Crimson Text', serif",
      color: "#c8b89a",
    }}>
      {/* Fonts + keyframes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; } 50% { opacity: 0.4; }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0805; }
        ::-webkit-scrollbar-thumb { background: #2a1f10; border-radius: 3px; }
      `}</style>

      <div style={{ maxWidth: "1300px", margin: "0 auto" }}>

        {/* ── Header ── */}
        <header style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "2.5rem",
          borderBottom: "1px solid #1a1408",
          paddingBottom: "1.5rem",
        }}>
          <div>
            <p style={{ fontSize: "0.65rem", letterSpacing: "0.3em", color: "#6b3030", textTransform: "uppercase", margin: "0 0 0.3rem" }}>
              ⚑ Admin Sanctum
            </p>
            <h1 style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
              color: "#e8d5a3",
              letterSpacing: "0.06em",
              margin: 0,
              lineHeight: 1,
            }}>
              War Council Dashboard
            </h1>
            <p style={{ color: "#5a4a2e", fontSize: "0.82rem", margin: "0.4rem 0 0", fontStyle: "italic" }}>
              All intelligence from across the Undead realm
            </p>
          </div>

          {/* Refresh control */}
          <div style={{ textAlign: "right" }}>
            <button
              onClick={() => dispatch(loadDashboard())}
              disabled={loading}
              style={{
                background: "transparent",
                border: "1px solid #2a1f10",
                color: loading ? "#3a2e1a" : "#9a7d4a",
                borderRadius: "2px",
                padding: "0.45rem 1rem",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Cinzel', serif",
                fontSize: "0.72rem",
                letterSpacing: "0.08em",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => !loading && (e.target.style.borderColor = "#c8a35f")}
              onMouseLeave={(e) => (e.target.style.borderColor = "#2a1f10")}
            >
              {loading ? (
                <span style={{ animation: "pulse 1s infinite" }}>⟳ Refreshing...</span>
              ) : "⟳ Refresh"}
            </button>
            {lastFetched && (
              <p style={{ fontSize: "0.65rem", color: "#3a2e1a", margin: "0.3rem 0 0" }}>
                Last updated {timeAgo(lastFetched)}
              </p>
            )}
          </div>
        </header>

        {/* ── Error ── */}
        {error && (
          <div style={{
            background: "#120808", border: "1px solid #8b2020", borderRadius: "2px",
            padding: "0.8rem 1rem", marginBottom: "1.5rem", color: "#c84040", fontSize: "0.85rem",
          }}>
            ⚠ {error}
          </div>
        )}

        {/* ── Loading skeleton ── */}
        {loading && !stats && (
          <div style={{ textAlign: "center", padding: "6rem", color: "#4a3a22" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem", animation: "pulse 1.5s infinite" }}>⚙</div>
            <p style={{ fontFamily: "'Cinzel', serif", letterSpacing: "0.1em" }}>Consulting the war records...</p>
          </div>
        )}

        {stats && (() => {
          const { totals, growth, avgRating, charts, topRatedBuilds, mostCommentedBuilds, recentActivity } = stats;

          return (
            <>
              {/* ── Primary KPI cards ── */}
              <SectionHeader>Kingdom Overview</SectionHeader>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "1rem",
                marginBottom: "0.5rem",
              }}>
                <StatCard
                  label="Total Undead"
                  value={totals.users}
                  sub={`+${growth.newUsersToday} today · +${growth.newUsers7d} this week`}
                  accent="#9070d0"
                  icon="👤"
                  chartData={userChartData}
                  chartColor="#9070d0"
                  delay={0}
                />
                <StatCard
                  label="Builds Forged"
                  value={totals.builds}
                  sub={`+${growth.newBuilds7d} this week`}
                  accent="#c8a35f"
                  icon="⚔"
                  chartData={buildChartData}
                  chartColor="#c8a35f"
                  delay={60}
                />
                <StatCard
                  label="Inscriptions"
                  value={totals.comments}
                  sub={`${totals.flaggedComments} flagged for moderation`}
                  accent={totals.flaggedComments > 0 ? "#c84040" : "#50a878"}
                  icon="💬"
                  delay={120}
                />
                <StatCard
                  label="Ratings Cast"
                  value={totals.ratings}
                  sub={avgRating ? `Avg: ${avgRating} ★ across all builds` : "No ratings yet"}
                  accent="#c8a35f"
                  icon="★"
                  delay={180}
                />
                <StatCard
                  label="Items Cached"
                  value={totals.items}
                  sub="From external API sync"
                  accent="#50a878"
                  icon="🗡"
                  delay={240}
                />
                <StatCard
                  label="New Undead (30d)"
                  value={growth.newUsers30d}
                  sub={`+${growth.newUsers7d} in last 7 days`}
                  accent="#9070d0"
                  icon="📈"
                  delay={300}
                />
              </div>

              {/* ── Charts row ── */}
              <SectionHeader>30-Day Activity</SectionHeader>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: "1rem",
                marginBottom: "0.5rem",
              }}>
                {/* Registrations chart */}
                <div style={{
                  background: "#0e0c08",
                  border: "1px solid #2a1f10",
                  borderRadius: "2px",
                  padding: "1.2rem 1.5rem",
                  animation: "fadeSlideUp 0.5s ease both",
                  animationDelay: "360ms",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1rem" }}>
                    <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.68rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#6040a0", margin: 0 }}>
                      Registrations
                    </p>
                    <span style={{ fontFamily: "monospace", fontSize: "1.3rem", color: "#9070d0" }}>
                      {growth.newUsers30d}
                    </span>
                  </div>
                  <BarChart data={userChartData} color="#9070d0" />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.4rem" }}>
                    <span style={{ fontSize: "0.62rem", color: "#3a2e1a" }}>30 days ago</span>
                    <span style={{ fontSize: "0.62rem", color: "#3a2e1a" }}>Today</span>
                  </div>
                </div>

                {/* Builds chart */}
                <div style={{
                  background: "#0e0c08",
                  border: "1px solid #2a1f10",
                  borderRadius: "2px",
                  padding: "1.2rem 1.5rem",
                  animation: "fadeSlideUp 0.5s ease both",
                  animationDelay: "420ms",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1rem" }}>
                    <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.68rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a6a30", margin: 0 }}>
                      Builds Created
                    </p>
                    <span style={{ fontFamily: "monospace", fontSize: "1.3rem", color: "#c8a35f" }}>
                      {buildChartData.reduce((s, d) => s + d.count, 0)}
                    </span>
                  </div>
                  <BarChart data={buildChartData} color="#c8a35f" />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.4rem" }}>
                    <span style={{ fontSize: "0.62rem", color: "#3a2e1a" }}>30 days ago</span>
                    <span style={{ fontSize: "0.62rem", color: "#3a2e1a" }}>Today</span>
                  </div>
                </div>

                {/* Build visibility donut */}
                <div style={{
                  background: "#0e0c08",
                  border: "1px solid #2a1f10",
                  borderRadius: "2px",
                  padding: "1.2rem 1.5rem",
                  animation: "fadeSlideUp 0.5s ease both",
                  animationDelay: "480ms",
                }}>
                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.68rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a6a30", margin: "0 0 1rem" }}>
                    Build Visibility
                  </p>
                  <DonutChart
                    publicCount={totals.publicBuilds}
                    privateCount={totals.privateBuilds}
                  />
                  <p style={{ fontSize: "0.72rem", color: "#4a3a22", marginTop: "0.8rem", margin: "0.8rem 0 0" }}>
                    {totals.builds} total builds across the realm
                  </p>
                </div>
              </div>

              {/* ── Leaderboards + Activity ── */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1rem",
                marginTop: "1rem",
              }}>

                {/* Top rated builds */}
                <div style={{
                  background: "#0e0c08",
                  border: "1px solid #2a1f10",
                  borderRadius: "2px",
                  padding: "1.2rem 1.5rem",
                  animation: "fadeSlideUp 0.5s ease both",
                  animationDelay: "540ms",
                }}>
                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#c8a35f", margin: "0 0 0.5rem" }}>
                    ★ Top Rated Builds
                  </p>
                  {topRatedBuilds.length === 0 ? (
                    <p style={{ color: "#3a2e1a", fontSize: "0.82rem", fontStyle: "italic" }}>No ratings yet</p>
                  ) : topRatedBuilds.map((b, i) => (
                    <LeaderRow
                      key={b._id}
                      rank={i + 1}
                      title={b.title}
                      metric={`${b.avgRating}★`}
                      metricLabel={`(${b.ratingCount})`}
                      accent="#c8a35f"
                    />
                  ))}
                </div>

                {/* Most commented builds */}
                <div style={{
                  background: "#0e0c08",
                  border: "1px solid #2a1f10",
                  borderRadius: "2px",
                  padding: "1.2rem 1.5rem",
                  animation: "fadeSlideUp 0.5s ease both",
                  animationDelay: "600ms",
                }}>
                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#50a878", margin: "0 0 0.5rem" }}>
                    💬 Most Discussed
                  </p>
                  {mostCommentedBuilds.length === 0 ? (
                    <p style={{ color: "#3a2e1a", fontSize: "0.82rem", fontStyle: "italic" }}>No comments yet</p>
                  ) : mostCommentedBuilds.map((b, i) => (
                    <LeaderRow
                      key={b._id}
                      rank={i + 1}
                      title={b.title}
                      metric={b.commentCount}
                      metricLabel="inscriptions"
                      accent="#50a878"
                    />
                  ))}
                </div>

                {/* Recent activity */}
                <div style={{
                  background: "#0e0c08",
                  border: "1px solid #2a1f10",
                  borderRadius: "2px",
                  padding: "1.2rem 1.5rem",
                  animation: "fadeSlideUp 0.5s ease both",
                  animationDelay: "660ms",
                }}>
                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#7090c0", margin: "0 0 0.5rem" }}>
                    ⚡ Recent Activity
                  </p>
                  {recentActivity.length === 0 ? (
                    <p style={{ color: "#3a2e1a", fontSize: "0.82rem", fontStyle: "italic" }}>No recent activity</p>
                  ) : recentActivity.map((event, i) => (
                    <ActivityItem key={i} event={event} />
                  ))}
                </div>

              </div>

              {/* ── Flagged warning banner ── */}
              {totals.flaggedComments > 0 && (
                <div style={{
                  marginTop: "1.5rem",
                  background: "#120808",
                  border: "1px solid #8b202066",
                  borderLeft: "3px solid #8b2020",
                  borderRadius: "2px",
                  padding: "0.9rem 1.2rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  animation: "fadeSlideUp 0.5s ease both",
                  animationDelay: "720ms",
                }}>
                  <div>
                    <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.78rem", color: "#c84040", margin: "0 0 0.2rem", letterSpacing: "0.05em" }}>
                      ⚑ Moderation Required
                    </p>
                    <p style={{ fontSize: "0.82rem", color: "#8b4040", margin: 0 }}>
                      {totals.flaggedComments} inscription{totals.flaggedComments !== 1 ? "s" : ""} flagged and awaiting review
                    </p>
                  </div>
                  <a
                    href="/admin/moderation"
                    style={{
                      background: "transparent",
                      border: "1px solid #8b2020",
                      color: "#c84040",
                      borderRadius: "2px",
                      padding: "0.4rem 1rem",
                      textDecoration: "none",
                      fontFamily: "'Cinzel', serif",
                      fontSize: "0.72rem",
                      letterSpacing: "0.05em",
                      transition: "all 0.2s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Review Queue →
                  </a>
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
};

export default AdminDashboard;
