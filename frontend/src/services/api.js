import axios from "axios";

const api = axios.create({
    baseURL: "https://streamhub-backend-xia0.onrender.com/api/v1",
    withCredentials: true,
});

export default api;

export const unwrap = (response) => response?.data?.data ?? response?.data;

export const authApi = {
    login: (payload) => api.post("/users/login", payload),
    register: (payload) => api.post("/users/register", payload),
    logout: () => api.post("/users/logout"),
    currentUser: () => api.get("/users/current-user"),
};

export const videoApi = {
    list: (params = {}) => api.get("/videos", { params }),
    get: (videoId) => api.get(`/videos/${videoId}`),
    upload: (formData, onUploadProgress) =>
        api.post("/videos", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress,
        }),
};

export const likeApi = {
    video: (videoId) => api.post(`/likes/toggle/v/${videoId}`),
    likedVideos: () => api.get("/likes/videos"),
};

export const commentApi = {
    list: (videoId) => api.get(`/comments/${videoId}`),
    create: (videoId, content) =>
        api.post(`/comments/${videoId}`, { content }),
    update: (commentId, content) =>
        api.patch(`/comments/c/${commentId}`, { content }),
    remove: (commentId) => api.delete(`/comments/c/${commentId}`),
};

export const subscriptionApi = {
    toggle: (channelId) => api.post(`/subscriptions/c/${channelId}`),
};

export const userApi = {
    channel: (username) => api.get(`/users/c/${username}`),
    update: (payload) => api.patch("/users/update-account", payload),
};