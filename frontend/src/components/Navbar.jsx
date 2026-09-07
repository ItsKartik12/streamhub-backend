import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Navbar({ onMenu }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
  return (
    <header className="navbar">
      <button
        className="icon-button menu-button"
        onClick={onMenu}
        aria-label="Toggle navigation"
      >
        ☰
      </button>
      <Link to="/" className="brand">
        <span className="brand-mark">▶</span>
        <span>
          Stream<span>Hub</span>
        </span>
      </Link>
      <form
        className="search-form"
        onSubmit={(event) => {
          event.preventDefault();
          const query = new FormData(event.currentTarget).get("q");
          navigate(query ? `/?q=${encodeURIComponent(query)}` : "/");
        }}
      >
        <input
          name="q"
          placeholder="Search videos, creators..."
          aria-label="Search videos"
        />
        <button aria-label="Search">⌕</button>
      </form>
      <div className="nav-actions">
        {user ? (
          <>
            <Link to="/upload" className="upload-link">
              ＋ <span>Upload</span>
            </Link>
            <button
              className="avatar-button"
              onClick={() => navigate("/profile")}
              aria-label="Open profile"
            >
              {(user.fullName || user.username || "U")
                .slice(0, 1)
                .toUpperCase()}
            </button>
            <button className="logout-link" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <Link to="/login" className="button button-small">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
