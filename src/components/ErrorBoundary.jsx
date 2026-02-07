import { Component } from "react";
import theme from "../theme";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            minHeight: "100vh",
            background: theme.colors.bgDark,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            color: theme.colors.text,
            fontFamily: "'Nunito', 'Segoe UI', system-ui, sans-serif",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>&#9888;</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Something went wrong</h2>
          <p style={{ fontSize: 14, color: theme.colors.textDim, marginBottom: 24, textAlign: "center" }}>
            An error occurred while loading the flashcards.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: "12px 28px",
              borderRadius: 14,
              border: "none",
              background: theme.colors.primary,
              color: theme.colors.text,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
          {this.state.error && (
            <pre
              style={{
                marginTop: 24,
                padding: 16,
                borderRadius: 10,
                background: "rgba(255,255,255,0.05)",
                color: theme.colors.textDim,
                fontSize: 12,
                maxWidth: "90%",
                overflow: "auto",
              }}
            >
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
