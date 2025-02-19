import React, { useState, useEffect } from "react";
import axios from "../services/axiosInstance";
import { useNavigate } from "react-router-dom";
import { HomeIcon, ArrowLeftIcon, PowerIcon } from "@heroicons/react/24/outline";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const navigate = useNavigate();

  // Fetch the current user's profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  // Fetch posts uploaded by the user
  useEffect(() => {
    if (user) {
      const fetchUserPosts = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(`/api/posts/user?userId=${user._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUserPosts(res.data.posts);
        } catch (error) {
          console.error("Error fetching user posts:", error);
        }
      };
      fetchUserPosts();
    }
  }, [user]);

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (!user)
    return <div className="p-4 text-center text-lg font-semibold">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F7F4F3] p-4">
      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate("/home")}
          className="flex items-center space-x-2 bg-[#5B2333] text-white py-2 px-4 rounded-lg shadow hover:bg-[#421f30] transition-colors"
        >
          <HomeIcon className="w-5 h-5" />
          <span>Home</span>
        </button>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 bg-gray-200 text-[#5B2333] py-2 px-4 rounded-lg shadow hover:bg-gray-300 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back</span>
          </button>
          <button
            onClick={logout}
            className="flex items-center space-x-2 bg-red-500 text-white py-2 px-4 rounded-lg shadow hover:bg-red-600 transition-colors"
          >
            <PowerIcon className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center bg-white rounded-xl shadow-lg p-6 mb-6">
        <img
          src={user.profilePic || "https://via.placeholder.com/150"}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover border-4 border-[#5B2333]"
        />
        <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left">
          <h1 className="text-3xl font-bold text-[#5B2333]">{user.name}</h1>
          <p className="text-gray-600">@{user.userId}</p>
          {user.bio && <p className="mt-2 text-gray-700">{user.bio}</p>}
          <div className="flex justify-center md:justify-start space-x-6 mt-4">
            <div
              className="cursor-pointer hover:underline"
              onClick={() => setShowFollowersModal(true)}
            >
              <span className="font-bold text-[#5B2333]">
                {user.followers ? user.followers.length : 0}
              </span>{" "}
              Followers
            </div>
            <div
              className="cursor-pointer hover:underline"
              onClick={() => setShowFollowingModal(true)}
            >
              <span className="font-bold text-[#5B2333]">
                {user.following ? user.following.length : 0}
              </span>{" "}
              Following
            </div>
          </div>
        </div>
      </div>

      <hr className="my-6 border-gray-300" />

      {/* Posts Grid */}
      <div>
        <h2 className="text-2xl font-bold text-[#5B2333] mb-4">Posts</h2>
        {userPosts.length === 0 ? (
          <p className="text-gray-600">No posts yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {userPosts.map((post) => (
              <div
                key={post._id}
                className="bg-white rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/post/${post._id}`)}
              >
                <img
                  src={post.imageUrl}
                  alt="User Post"
                  className="w-full h-48 object-cover"
                />
                {post.caption && (
                  <div className="p-2 text-sm text-gray-700">{post.caption}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 max-h-[80vh] overflow-y-auto shadow-lg">
            <h3 className="font-bold text-2xl text-[#5B2333] mb-4">Followers</h3>
            {user.followers && user.followers.length > 0 ? (
              user.followers.map((follower, index) => {
                const id =
                  typeof follower === "object" && follower._id
                    ? follower._id
                    : follower;
                const name =
                  typeof follower === "object" && follower.name
                    ? follower.name
                    : "No Name";
                const uId =
                  typeof follower === "object" && follower.userId
                    ? follower.userId
                    : "unknown";
                const profilePic =
                  typeof follower === "object" && follower.profilePic
                    ? follower.profilePic
                    : "https://via.placeholder.com/50";
                return (
                  <div
                    key={id || index}
                    className="flex items-center space-x-3 p-3 border-b hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      navigate(`/profile/${id}`);
                      setShowFollowersModal(false);
                    }}
                  >
                    <img
                      src={profilePic}
                      alt={name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-bold text-[#5B2333]">{name}</p>
                      <p className="text-sm text-gray-600">@{uId}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-600">No followers yet.</p>
            )}
            <button
              className="mt-4 text-[#5B2333] underline"
              onClick={() => setShowFollowersModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 max-h-[80vh] overflow-y-auto shadow-lg">
            <h3 className="font-bold text-2xl text-[#5B2333] mb-4">Following</h3>
            {user.following && user.following.length > 0 ? (
              user.following.map((followingUser, index) => {
                const id =
                  typeof followingUser === "object" && followingUser._id
                    ? followingUser._id
                    : followingUser;
                const name =
                  typeof followingUser === "object" && followingUser.name
                    ? followingUser.name
                    : "No Name";
                const uId =
                  typeof followingUser === "object" && followingUser.userId
                    ? followingUser.userId
                    : "unknown";
                const profilePic =
                  typeof followingUser === "object" && followingUser.profilePic
                    ? followingUser.profilePic
                    : "https://via.placeholder.com/50";
                return (
                  <div
                    key={id || index}
                    className="flex items-center space-x-3 p-3 border-b hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      navigate(`/profile/${id}`);
                      setShowFollowingModal(false);
                    }}
                  >
                    <img
                      src={profilePic}
                      alt={name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-bold text-[#5B2333]">{name}</p>
                      <p className="text-sm text-gray-600">@{uId}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-600">Not following anyone yet.</p>
            )}
            <button
              className="mt-4 text-[#5B2333] underline"
              onClick={() => setShowFollowingModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
