import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/axiosInstance";
import { PlusIcon } from "@heroicons/react/24/outline";
import { HomeIcon, UserIcon, ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline";

function PaintPage() {
  const [savedPaintings, setSavedPaintings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPaintings = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/paintings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSavedPaintings(response.data.paintings);
      } catch (error) {
        console.error("Error fetching paintings:", error);
      }
    };
    fetchPaintings();
  }, []);

  // Directly open the editor (solo mode by default)
  const handleNewPaintingClick = () => {
    navigate("/paint/editor", { state: { collaborativeMode: false } });
  };

  const handleLoadPainting = (painting) => {
    navigate("/paint/editor", { state: { painting, collaborativeMode: false } });
  };

  const handleUploadAsPost = (painting) => {
    navigate("/uploadpost", { state: { painting } });
  };

  const handleDeletePainting = async (paintingId) => {
    if (!window.confirm("Are you sure you want to delete this painting?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/paintings/${paintingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSavedPaintings((prev) => prev.filter((p) => p._id !== paintingId));
    } catch (error) {
      console.error("Error deleting painting:", error);
      alert("Error deleting painting.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4F3] p-4">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md rounded-lg p-4 flex flex-col md:flex-row justify-between items-center mb-6">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center space-x-2 text-[#5B2333] hover:text-blue-500 transition-colors"
          >
            <HomeIcon className="w-6 h-6" />
            <span className="font-medium">Home</span>
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center space-x-2 text-[#5B2333] hover:text-blue-500 transition-colors"
          >
            <UserIcon className="w-6 h-6" />
            <span className="font-medium">Profile</span>
          </button>
          <button
            onClick={() => navigate("/chat")}
            className="flex items-center space-x-2 text-[#5B2333] hover:text-blue-500 transition-colors"
          >
            <ChatBubbleLeftEllipsisIcon className="w-6 h-6" />
            <span className="font-medium">Messages</span>
          </button>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => navigate("/paint/collaboration")}
            className="bg-yellow-500 text-white px-5 py-2 rounded-lg shadow hover:bg-yellow-600 transition-colors"
          >
            Collaboration Requests
          </button>
        </div>
      </nav>

      <h2 className="text-3xl font-bold text-[#5B2333] my-4">Your Paintings</h2>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* New Painting Card */}
        <div
          className="relative border-4 border-dashed border-gray-400 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={handleNewPaintingClick}
        >
          <PlusIcon className="w-12 h-12 text-gray-500" />
          <span className="mt-3 font-semibold text-gray-600">New Painting</span>
        </div>
        {savedPaintings.map((painting) => (
          <div
            key={painting._id}
            className="relative border rounded-lg shadow-md group overflow-hidden cursor-pointer"
          >
            <img
              src={painting.thumbnailUrl}
              alt="Painting thumbnail"
              className="w-full h-56 object-cover"
            />
            <div className="p-2 text-center font-medium text-gray-700">
              Painting #{painting._id.slice(-4)}
            </div>
            {/* Overlay with options */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={() => handleLoadPainting(painting)}
                className="bg-blue-500 text-white px-4 py-2 m-1 rounded-full hover:bg-blue-600 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleUploadAsPost(painting)}
                className="bg-green-500 text-white px-4 py-2 m-1 rounded-full hover:bg-green-600 transition-colors"
              >
                Upload as Post
              </button>
              <button
                onClick={() => handleDeletePainting(painting._id)}
                className="bg-red-500 text-white px-4 py-2 m-1 rounded-full hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PaintPage;
