export default function Loader({ label = "Loading StreamHub" }) {
  return (
    <div className="loader" role="status">
      <span className="loader-dot" />
      {label}
    </div>
  );
}
