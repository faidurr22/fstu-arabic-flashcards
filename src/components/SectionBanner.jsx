import theme from "../theme";

export default function SectionBanner({ section, sIdx, completedCount }) {
  const totalParts = section.partOrder.length;
  const progress = totalParts > 0 ? completedCount / totalParts : 0;

  return (
    <div
      role="heading"
      aria-level={2}
      aria-label={`${section.name}: ${completedCount} of ${totalParts} parts completed`}
      style={{
        margin: "0 20px 8px",
        borderRadius: 16,
        overflow: "hidden",
        background: theme.gradients.goldBanner,
        boxShadow: theme.shadows.goldBanner,
        animation: `slide-up 0.5s ease ${sIdx * 100}ms both`,
      }}
    >
      <div style={{ padding: "16px 20px" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: "rgba(0,0,0,0.35)",
            textTransform: "uppercase",
            letterSpacing: 1.5,
          }}
        >
          {section.name}
        </div>
        <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", marginTop: 2 }}>
          {section.name}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
          <div
            style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(0,0,0,0.15)" }}
            role="progressbar"
            aria-valuenow={completedCount}
            aria-valuemin={0}
            aria-valuemax={totalParts}
          >
            <div
              style={{
                height: "100%",
                width: `${progress * 100}%`,
                borderRadius: 3,
                background: "#fff",
                transition: "width 0.5s",
              }}
            />
          </div>
          <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.8)" }}>
            {completedCount}/{totalParts}
          </span>
        </div>
      </div>
    </div>
  );
}
