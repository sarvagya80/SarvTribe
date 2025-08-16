import api from "./axios"; // your axios instance

export const createUserProfile = async () => {
  try {
    const res = await api.post("/user/create-profile");
    return res.data;
  } catch (err) {
    console.error("❌ Failed to create profile:", err.response?.data || err.message);
    throw err;
  }
};
