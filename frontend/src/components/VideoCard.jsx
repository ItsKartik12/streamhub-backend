import { Link } from "react-router-dom";

const getOwner = (video) => video?.owner || video?.user || {};
const formatViews = (value = 0) =>
  new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
export default function VideoCard({ video }) {
  const owner = getOwner(video);
  const id = video?._id || video?.id;
  return (
    <article className="video-card">
      <Link to={`/watch/${id}`} className="thumbnail-wrap">
        <img
          src={
            video.thumbnail ||
            "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=900&q=80"
          }
          alt=""
        />
        <span className="duration">
          {video.duration
            ? `${Math.floor(video.duration / 60)}:${String(
                Math.floor(video.duration % 60)
              ).padStart(2, "0")}`
            : "HD"}
        </span>
      </Link>
      <div className="video-card-body">
        <div className="creator-avatar">
          {(owner.fullName || owner.username || "S").slice(0, 1).toUpperCase()}
        </div>
        <div>
          <Link to={`/watch/${id}`} className="video-title">
            {video.title || "Untitled video"}
          </Link>
          <Link
            to={`/channel/${owner.username || "creator"}`}
            className="creator-name"
          >
            {owner.fullName || owner.username || "StreamHub creator"}
          </Link>
          <p className="video-meta">
            {formatViews(video.views)} views <span>•</span>{" "}
            {video.createdAt
              ? new Date(video.createdAt).toLocaleDateString()
              : "Recently"}
          </p>
          {video.likeCount !== undefined && (
            <p className="video-meta">{formatViews(video.likeCount)} likes</p>
          )}
        </div>
      </div>
    </article>
  );
}
