import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/axiosInstance";
import {
  MagnifyingGlassIcon,
  PencilSquareIcon,
  UserCircleIcon,
  ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/24/outline";

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  // Fetch posts from followed users
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/posts/following", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(response.data.posts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, []);

  // Fetch search results when searchQuery changes
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.trim() === "") {
        setSearchResults([]);
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `/api/users/search?query=${encodeURIComponent(searchQuery)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSearchResults(response.data.users);
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    };

    fetchSearchResults();
  }, [searchQuery]);

  // Update search input value
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Navigate to a public profile using the user's _id
  const handleUserSelect = (userId) => {
    navigate(`/profile/${userId}`);
  };

  // Navigation button handlers
  const handlePaintClick = () => {
    navigate("/paint");
  };

  const handleAccountClick = () => {
    navigate("/profile");
  };

  const handleMessageClick = () => {
    navigate("/chat");
  };

  return (
    <div className="min-h-screen bg-[#F7F4F3]">
      {/* Header Section */}
      <header className="bg-white shadow-md p-4 flex flex-col md:flex-row md:items-center md:justify-between">
        {/* Logo/Title */}
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-bold text-[#5B2333]">ArtSphere</h1>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 md:mx-4">
          <MagnifyingGlassIcon className="w-6 h-6 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by userId or name..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5B2333]"
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border rounded shadow-lg z-10">
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className="p-2 hover:bg-gray-200 cursor-pointer"
                  onClick={() => handleUserSelect(user._id)}
                >
                  {user.name} ({user.userId})
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center space-x-6 mt-4 md:mt-0">
          <button
            onClick={handlePaintClick}
            className="flex items-center space-x-1 p-2 rounded hover:bg-gray-200 transition"
          >
            <PencilSquareIcon className="w-6 h-6 text-[#5B2333]" />
            <span className="hidden md:inline text-[#5B2333] font-medium">
              Paint
            </span>
          </button>
          <button
            onClick={handleAccountClick}
            className="flex items-center space-x-1 p-2 rounded hover:bg-gray-200 transition"
          >
            <UserCircleIcon className="w-6 h-6 text-[#5B2333]" />
            <span className="hidden md:inline text-[#5B2333] font-medium">
              Account
            </span>
          </button>
          <button
            onClick={handleMessageClick}
            className="flex items-center space-x-1 p-2 rounded hover:bg-gray-200 transition"
          >
            <ChatBubbleLeftEllipsisIcon className="w-6 h-6 text-[#5B2333]" />
            <span className="hidden md:inline text-[#5B2333] font-medium">
              Messages
            </span>
          </button>
        </div>
      </header>

      {/* Posts Section */}
      <main className="p-4">
        {posts.length === 0 ? (
          <p className="text-center text-gray-600 mt-10">
            No posts from followed users.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div
                key={post._id}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform hover:scale-105 transition-transform"
                onClick={() => navigate(`/post/${post._id}`)}
              >
                <img
                  src={post.imageUrl}
                  alt="Post"
                  className="w-full h-56 object-cover"
                />
                <div className="p-4">
                  {post.caption && (
                    <p className="text-gray-800 text-sm mb-2">
                      {post.caption}
                    </p>
                  )}
                  {post.user && (
                    <p className="text-xs text-gray-500">
                      Posted by: {post.user.userId}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default HomePage;
