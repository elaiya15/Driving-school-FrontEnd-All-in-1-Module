import axios from "axios";
const BURL = import.meta.env.VITE_BACK_URL;

const getDriveFileType = async (driveId) => {
  try {
    const res = await axios.head(`${BURL}/api/image-proxy/${driveId}`, {
      withCredentials: true, // ✅ Important for cookies/session
    });
    console.log("HEAD headers:", res.headers);

    return res.headers["x-file-type"]; // 'image' or 'pdf'
  } catch (error) {
    console.error("Error fetching file type:", error);
    return null;
  }
};

export default getDriveFileType;
