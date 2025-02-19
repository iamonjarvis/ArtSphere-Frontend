import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../services/axiosInstance";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

function UploadPost() {
  const location = useLocation();
  const navigate = useNavigate();
  const { painting } = location.state || {};
  const [caption, setCaption] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        caption,
        imageUrl: painting.thumbnailUrl,
        paintingId: painting._id,
      };
      const token = localStorage.getItem("token");
      await axios.post("/api/posts", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Post uploaded successfully!");
      navigate("/home");
    } catch (error) {
      console.error("Error uploading post:", error);
      alert("Error uploading post.");
    }
  };

  if (!painting) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold text-center">No painting selected.</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F4F3] p-4">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 bg-white border border-gray-300 text-[#5B2333] font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition-colors mb-6"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span>Back</span>
      </button>

      {/* Upload Card */}
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-[#5B2333] mb-4 text-center">
          Upload Painting as Post
        </h2>
        <div className="mb-4">
          <img
            src={painting.thumbnailUrl}
            alt="Selected Painting"
            className="w-full h-64 object-contain border rounded-lg shadow-md"
          />
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Enter caption or description..."
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B2333] transition"
            rows={4}
            required
          />
          <button
            type="submit"
            className="bg-[#5B2333] text-white py-2 rounded-lg hover:bg-[#421f30] transition-colors"
          >
            Upload Post
          </button>
        </form>
      </div>
    </div>
  );
}

export default UploadPost;
