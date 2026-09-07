import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { videoApi, unwrap } from "../services/api";
import VideoCard from "../components/VideoCard";
import Loader from "../components/Loader";
export default function Home() {
  const [searchParams] = useSearchParams();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const query = searchParams.get("q") || "";
  useEffect(() => {
    videoApi
      .list({
        query,
        sortBy: searchParams.get("sort") === "trending" ? "views" : "createdAt",
      })
      .then((response) => {
        const result = unwrap(response);
        setVideos(
          Array.isArray(result) ? result : result?.docs || result?.videos || []
        );
      })
      .catch((err) =>
        setError(
          err.response?.data?.message || "The feed could not load right now."
        )
      )
      .finally(() => setLoading(false));
  }, [query, searchParams]);
  return (
    <div className="home-page">
      <section className="page-intro">
        <div>
          <p className="eyebrow">The daily drop</p>
          <h1>{query ? `Results for “${query}”` : "A little more you."}</h1>
          <p>Fresh perspectives from the StreamHub community.</p>
        </div>
        <div className="feed-stat">
          <strong>{videos.length}</strong>
          <span>videos in the feed</span>
        </div>
      </section>
      <div className="filter-row">
        <button className="filter-chip active">For you</button>
        <button className="filter-chip">Following</button>
        <button className="filter-chip">Newest</button>
        <button className="filter-chip">Most watched</button>
      </div>
      {loading ? (
        <Loader label="Curating your feed" />
      ) : error ? (
        <div className="state-panel">
          <strong>Something interrupted the feed.</strong>
          <p>{error}</p>
          <button
            className="button button-small"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      ) : videos.length ? (
        <div className="video-grid">
          {videos.map((video) => (
            <VideoCard key={video._id || video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="state-panel">
          <span className="empty-icon">⌁</span>
          <strong>No videos here yet.</strong>
          <p>Try a different search or check back soon.</p>
        </div>
      )}
    </div>
  );
}
