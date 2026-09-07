import { NavLink } from "react-router-dom";

const links = [
  ["⌂", "Home", "/"],
  ["◉", "Explore", "/?sort=trending"],
  ["▣", "Subscriptions", "/?filter=subscriptions"],
  ["◷", "History", "/profile"],
];
export default function Sidebar({ open }) {
  return (
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="sidebar-section">
        <p className="eyebrow">Discover</p>
        {links.map(([icon, label, to]) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              `side-link ${isActive ? "active" : ""}`
            }
          >
            <span>{icon}</span>
            {label}
          </NavLink>
        ))}
      </div>
      <div className="sidebar-note">
        <span className="note-icon">✦</span>
        <strong>Make your mark</strong>
        <p>Share the videos that matter to you.</p>
        <NavLink to="/upload" className="text-link">
          Create a video →
        </NavLink>
      </div>
    </aside>
  );
}
