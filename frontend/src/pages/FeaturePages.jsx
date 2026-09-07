import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  commentApi,
  likeApi,
  subscriptionApi,
  unwrap,
  userApi,
  videoApi,
} from "../services/api";
import { useAuth } from "../context/useAuth";
import Loader from "../components/Loader";
import VideoCard from "../components/VideoCard";

const pick = (value, fallback = "") => value || fallback;
const ownerOf = (video) => video?.owner || video?.user || {};
const apiMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

export function Watch() {
  const { videoId } = useParams();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    Promise.all([videoApi.get(videoId), commentApi.list(videoId)])
      .then(([videoResponse, commentResponse]) => {
        setVideo(unwrap(videoResponse));
        const result = unwrap(commentResponse);
        setComments(
          Array.isArray(result)
            ? result
            : result?.docs || result?.comments || [],
        );
      })
      .catch((requestError) =>
        setError(apiMessage(requestError, "This video is unavailable.")),
      );
  }, [videoId]);

  const addComment = async (event) => {
    event.preventDefault();
    if (!comment.trim()) return;
    try {
      const response = await commentApi.create(videoId, comment.trim());
      setComments((current) => [unwrap(response), ...current]);
      setComment("");
      setActionError("");
    } catch (requestError) {
      setActionError(
        apiMessage(requestError, "Your comment could not be posted."),
      );
    }
  };

  const toggleLike = async () => {
    try {
      await likeApi.video(videoId);
      setLiked((value) => !value);
      setActionError("");
    } catch (requestError) {
      setActionError(
        apiMessage(requestError, "You need to be signed in to like videos."),
      );
    }
  };

  if (error)
    return (
      <div className="state-panel">
        <strong>Could not open this video.</strong>
        <p>{error}</p>
        <Link className="button button-small" to="/">
          Back to home
        </Link>
      </div>
    );
  if (!video) return <Loader label="Opening video" />;

  const owner = ownerOf(video);
  return (
    <div className="watch-page">
      <div className="watch-player">
        <video controls poster={video.thumbnail} src={video.videoFile}>
          Your browser does not support video playback.
        </video>
      </div>
      <div className="watch-copy">
        <p className="eyebrow">Now playing</p>
        <h1>{pick(video.title, "Untitled video")}</h1>
        <div className="watch-meta">
          <span>{video.views || 0} views</span>
          <span>•</span>
          <span>
            {video.createdAt
              ? new Date(video.createdAt).toLocaleDateString()
              : "Recently published"}
          </span>
          <div className="watch-actions">
            <button
              className={`action-button ${liked ? "selected" : ""}`}
              onClick={toggleLike}
            >
              ♡ Like
            </button>
            <button
              className="action-button"
              onClick={() =>
                navigator.clipboard?.writeText(window.location.href)
              }
            >
              ↗ Share
            </button>
          </div>
        </div>
        <div className="creator-row">
          <div className="creator-avatar large">
            {(owner.fullName || owner.username || "S")
              .slice(0, 1)
              .toUpperCase()}
          </div>
          <div>
            <Link
              to={`/channel/${owner.username || "creator"}`}
              className="creator-name strong"
            >
              {owner.fullName || owner.username || "StreamHub creator"}
            </Link>
            <p>@{owner.username || "creator"}</p>
          </div>
          <Link
            className="button button-small"
            to={`/channel/${owner.username || "creator"}`}
          >
            View channel
          </Link>
        </div>
        <p className="description">{video.description}</p>
      </div>
      {actionError && <p className="form-error action-error">{actionError}</p>}
      <section className="comments">
        <h2>{comments.length} comments</h2>
        {user && (
          <form className="comment-form" onSubmit={addComment}>
            <input
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Add a thoughtful comment..."
              aria-label="Comment"
            />
            <button className="button button-small">Post</button>
          </form>
        )}
        {comments.length === 0 && (
          <p className="empty-copy">No comments yet.</p>
        )}
        {comments.map((item) => (
          <div className="comment" key={item._id || item.id}>
            <div className="creator-avatar">
              {(item.owner?.username || item.user?.username || "U")
                .slice(0, 1)
                .toUpperCase()}
            </div>
            <div>
              <strong>
                @{item.owner?.username || item.user?.username || "viewer"}
              </strong>
              <p>{item.content}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export function Upload() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    duration: "",
  });
  const [files, setFiles] = useState({ videoFile: null, thumbnail: null });
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    data.append("videoFile", files.videoFile);
    data.append("thumbnail", files.thumbnail);
    try {
      setStatus("Uploading your video...");
      const response = await videoApi.upload(data, (uploadEvent) =>
        setProgress(Math.round((uploadEvent.loaded * 100) / uploadEvent.total)),
      );
      const created = unwrap(response);
      setStatus("Published. Opening your video...");
      setTimeout(() => navigate(`/watch/${created?._id || created?.id}`), 500);
    } catch (requestError) {
      setStatus(
        apiMessage(
          requestError,
          "Upload failed. Check the files and try again.",
        ),
      );
    }
  };

  return (
    <div className="upload-page">
      <div className="page-intro compact">
        <div>
          <p className="eyebrow">Creator studio</p>
          <h1>
            Put something
            <br />
            <em>out there.</em>
          </h1>
          <p>Turn a good idea into a place people can visit.</p>
        </div>
        <span className="upload-symbol">↗</span>
      </div>
      <form className="upload-form" onSubmit={submit}>
        <div className="file-grid">
          <label className="file-drop">
            Video file
            <input
              required
              type="file"
              accept="video/*"
              onChange={(event) =>
                setFiles({
                  ...files,
                  videoFile: event.target.files?.[0] || null,
                })
              }
            />
            <span>{files.videoFile?.name || "Choose a video"}</span>
          </label>
          <label className="file-drop">
            Thumbnail
            <input
              required
              type="file"
              accept="image/*"
              onChange={(event) =>
                setFiles({
                  ...files,
                  thumbnail: event.target.files?.[0] || null,
                })
              }
            />
            <span>{files.thumbnail?.name || "Choose an image"}</span>
          </label>
        </div>
        <label>
          Title
          <input
            required
            value={form.title}
            onChange={(event) =>
              setForm({ ...form, title: event.target.value })
            }
            placeholder="Give your video a title"
          />
        </label>
        <label>
          Description
          <textarea
            required
            rows="6"
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
            placeholder="What should people know before they watch?"
          />
        </label>
        <label>
          Duration in seconds
          <input
            required
            type="number"
            min="1"
            value={form.duration}
            onChange={(event) =>
              setForm({ ...form, duration: event.target.value })
            }
          />
        </label>
        {progress > 0 && <progress value={progress} max="100" />}
        {status && <p className="upload-status">{status}</p>}
        <button className="button" disabled={status.startsWith("Uploading")}>
          {status.startsWith("Uploading")
            ? `${progress}% uploading...`
            : "Publish video →"}
        </button>
      </form>
    </div>
  );
}

export function Channel() {
  const { username } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    userApi
      .channel(username)
      .then((response) => setProfile(unwrap(response)))
      .catch((requestError) =>
        setError(apiMessage(requestError, "Channel not found.")),
      );
  }, [username]);

  const toggleSubscription = async (channel) => {
    if (!user) {
      setActionError("Sign in to subscribe to channels.");
      return;
    }
    try {
      await subscriptionApi.toggle(channel._id || channel.id);
      setSubscribed((value) => !value);
      setActionError("");
    } catch (requestError) {
      setActionError(
        apiMessage(requestError, "Subscription could not be updated."),
      );
    }
  };

  if (error)
    return (
      <div className="state-panel">
        <strong>{error}</strong>
        <Link className="button button-small" to="/">
          Back to home
        </Link>
      </div>
    );
  if (!profile) return <Loader label="Finding channel" />;
  const channel = profile.user || profile;
  const videos = profile.videos || channel.videos || [];
  return (
    <div className="channel-page">
      <div
        className="cover-image"
        style={{
          backgroundImage: `url(${channel.coverImage || "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=80"})`,
        }}
      />
      <div className="channel-heading">
        <div className="channel-avatar">
          {(channel.fullName || channel.username || "S")
            .slice(0, 1)
            .toUpperCase()}
        </div>
        <div>
          <p className="eyebrow">Creator channel</p>
          <h1>{channel.fullName || channel.username}</h1>
          <p>
            @{channel.username} · {channel.subscribersCount || 0} subscribers
          </p>
        </div>
        <button
          className="button button-small"
          onClick={() => toggleSubscription(channel)}
        >
          {subscribed ? "Subscribed" : "Subscribe"}
        </button>
      </div>
      {actionError && <p className="form-error action-error">{actionError}</p>}
      <div className="channel-tabs">
        <strong>Videos</strong>
        <span>About</span>
      </div>
      {videos.length ? (
        <div className="video-grid">
          {videos.map((video) => (
            <VideoCard key={video._id || video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="state-panel">
          <strong>This channel is just getting started.</strong>
          <p>No published videos yet.</p>
        </div>
      )}
    </div>
  );
}

export function Profile() {
  const { user } = useAuth();
  return (
    <div className="profile-page">
      <p className="eyebrow">Your space</p>
      <h1>{user?.fullName || user?.username}</h1>
      <div className="profile-card">
        <div className="channel-avatar">
          {(user?.fullName || user?.username || "U").slice(0, 1).toUpperCase()}
        </div>
        <div>
          <p className="eyebrow">@{user?.username}</p>
          <h2>Keep making things worth sharing.</h2>
          <p>{user?.email}</p>
        </div>
      </div>
    </div>
  );
}
