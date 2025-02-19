import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../services/axiosInstance";
import {
  HeartIcon as HeartIconOutline,
  ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

function PublicPostPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [likeClickCount, setLikeClickCount] = useState(0);

  // Get current user (assumes you store the user object in localStorage)
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser ? currentUser._id : null;

  // Fetch post details
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/api/posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPost(res.data.post);
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };
    fetchPost();
  }, [postId]);

  // Handle adding a comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `/api/posts/${postId}/comment`,
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPost(res.data.post);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Handle like toggle
  const handleLike = async () => {
    try {
      setLikeClickCount((prev) => prev + 1);
      const isOddClick = likeClickCount % 2 !== 0;
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `/api/posts/${postId}/like`,
        { action: isOddClick ? "add" : "remove" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPost(res.data.post);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  if (!post)
    return <div className="p-4 text-center">Loading post...</div>;

  // Check if current user has liked the post
  const isLiked =
    post.likes && currentUserId && post.likes.includes(currentUserId);

  return (
    <div className="max-w-3xl mx-auto p-4">
    <button
  onClick={() => navigate(-1)}
  className="flex items-center space-x-2 bg-white border border-gray-300 text-[#5B2333] font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
  <span>Back</span>
</button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Post Image */}
        <img
          src={post.imageUrl}
          alt="Post"
          className="w-full object-cover"
        />

        {/* Post Details & Interactions */}
        <div className="p-4 space-y-4">
          {post.caption && (
            <p className="text-gray-800 text-lg">{post.caption}</p>
          )}

          {/* Like & Comment Buttons (Vertical) */}
          <div className="flex flex-col space-y-2">
            <button
              onClick={handleLike}
              className="flex items-center space-x-2 focus:outline-none"
            >
              {isLiked ? (
                <HeartIconSolid className="w-7 h-7 text-red-500" />
              ) : (
                <HeartIconOutline className="w-7 h-7 text-gray-500" />
              )}
              <span className="text-gray-700 font-medium">
                {post.likes?.length || 0} Likes
              </span>
            </button>
            <div className="flex items-center space-x-2">
              <ChatBubbleLeftEllipsisIcon className="w-7 h-7 text-gray-500" />
              <span className="text-gray-700 font-medium">
                {post.comments?.length || 0} Comments
              </span>
            </div>
          </div>

          {/* Comments List */}
          <div className="border-t pt-4">
            <h3 className="text-xl font-semibold text-[#5B2333] mb-3">
              Comments
            </h3>
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div key={comment._id} className="mb-4 border-b pb-2">
                  <div className="flex items-center mb-1">
                    <img
                      src={comment.user.profilePic || "/default-avatar.png"}
                      alt="User"
                      className="w-8 h-8 rounded-full mr-2 object-cover"
                    />
                    <p className="font-bold text-gray-800">
                      {comment.user.name}
                    </p>
                  </div>
                  <p className="text-gray-700 text-sm">{comment.text}</p>
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-2 pl-8 border-l border-gray-200">
                      {comment.replies.map((reply) => (
                        <div key={reply._id} className="mb-2">
                          <div className="flex items-center mb-1">
                            <img
                              src={reply.user.profilePic || "/default-avatar.png"}
                              alt="User"
                              className="w-6 h-6 rounded-full mr-2 object-cover"
                            />
                            <p className="font-bold text-gray-800">
                              {reply.user.name}
                            </p>
                          </div>
                          <p className="text-gray-700 text-sm">{reply.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-sm">No comments yet.</p>
            )}
          </div>

          {/* Add Comment Input */}
          <div className="flex items-center border-t pt-4">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5B2333]"
            />
            <button
              onClick={handleAddComment}
              className="ml-3 bg-[#5B2333] text-white px-4 py-2 rounded-full hover:bg-opacity-90 transition"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicPostPage;
