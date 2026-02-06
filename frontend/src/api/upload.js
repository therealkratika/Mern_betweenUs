import axios from "axios";
import api from "./api";

export const secureUpload = async (file) => {
  const sig = await api.post("/upload/signature");

  const { signature, timestamp, cloudName, apiKey, folder } = sig.data;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", folder);

  const res = await axios.post(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    formData
  );

  return res.data.secure_url; 
};
