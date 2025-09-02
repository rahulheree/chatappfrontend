import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api/v1",
  withCredentials: true, 
});

export const startSession = (name) => apiClient.post("/session/start", { name });
export const getMySession = () => apiClient.get("/session/me");

export const createRoom = (roomData) => apiClient.post("/rooms", roomData);
export const getCommunityRooms = () => apiClient.get("/rooms/community");
export const getUserspaceRooms = () => apiClient.get("/rooms/userspaces");
export const getMyRooms = () => apiClient.get("/rooms/my");
export const getRoom = (roomId) => apiClient.get(`/rooms/${roomId}`);
export const deleteRoom = (roomId) => apiClient.delete(`/rooms/${roomId}`);
export const joinRoom = (roomId) => apiClient.post(`/rooms/${roomId}/join`);
export const leaveRoom = (roomId) => apiClient.post(`/rooms/${roomId}/leave`);

export const getRoomMembers = (roomId) => apiClient.get(`/rooms/${roomId}/members`);
export const getRoomMessages = (roomId) => apiClient.get(`/rooms/${roomId}/messages`);

export const createInvite = (roomId) => apiClient.post(`/rooms/${roomId}/invite`);

/**
 * Fetches room details using an invite token.
 * @param {string} token - The UUID token from the invite link.
 * @returns {Promise<AxiosResponse<any>>}
 */
export const getRoomByInvite = (token) => apiClient.get(`/invite/${token}`); // 👈 ADD THIS FUNCTION

export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient.post("/upload-file", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};







