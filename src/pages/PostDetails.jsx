import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../services/axiosInstance";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

function PostDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  // Assume the post is passed via location.state
  const [post, setPost] = useState(state?.post || null);
  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState({}); // maps commentId -> reply text

  // Fetch post details if not passed via state (optional)
  useEffect(() => {
    if (!post && state?.postId) {
      const fetchPost = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(`/api/posts/${state.postId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setPost(res.data.post);
        } catch (error) {
          console.error("Error fetching post details:", error);
        }
      };
      fetchPost();
    }
  }, [post, state]);

  const handleLike = async () => {
    try {
      const token = localStorage.getItem("token");
      // Toggle like status; assumes endpoint returns updated post
      const res = await axios.post(
        `/api/posts/${post._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPost(res.data.post);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `/api/posts/${post._id}/comment`,
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPost(res.data.post);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleAddReply = async (commentId) => {
    const text = replyText[commentId];
    if (!text || !text.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `/api/posts/${post._id}/comment/${commentId}/reply`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPost(res.data.post);
      setReplyText((prev) => ({ ...prev, [commentId]: "" }));
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  if (!post) return <div className="p-4">Loading post...</div>;

  // Determine if current user has liked the post
  const currentUserId = JSON.parse(localStorage.getItem("user"))?._id;
  const isLiked =
    post.likes && currentUserId && post.likes.includes(currentUserId);

  return (
    <div className="max-w-3xl mx-auto p-4 bg-[#F7F4F3] min-h-screen">
      {/* Updated Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 bg-white border border-gray-300 text-[#5B2333] font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition-colors mb-6"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span>Back</span>
      </button>

      {/* Post Container */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <img
          src={post.imageUrl}
          alt="Post"
          className="w-full object-cover"
        />
        <div className="p-6 space-y-6">
          {post.caption && (
            <p className="text-gray-800 text-lg">{post.caption}</p>
          )}

          {/* Like Button */}
          <div>
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
          </div>

          {/* Comments Section */}
          <div>
            <h3 className="text-2xl font-bold text-[#5B2333]">Comments</h3>
            <div className="mt-4 space-y-6">
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment) => (
                  <div key={comment._id} className="pb-4 border-b">
                    <div className="flex items-center mb-2">
                      <img
                        src={comment.user.profilePic || "/default-avatar.png"}
                        alt="User"
                        className="w-10 h-10 rounded-full mr-3 object-cover"
                      />
                      <p className="font-bold text-gray-800">
                        {comment.userName || comment.userId}
                      </p>
                    </div>
                    <p className="text-gray-700 mb-2">{comment.text}</p>
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-12 mt-3 border-l pl-4 space-y-3">
                        {comment.replies.map((reply) => (
                          <div key={reply._id}>
                            <div className="flex items-center mb-1">
                              <img
                                src={
                                  reply.user.profilePic ||
                                  "/default-avatar.png"
                                }
                                alt="User"
                                className="w-8 h-8 rounded-full mr-2 object-cover"
                              />
                              <p className="font-bold text-gray-800">
                                {reply.userName || reply.userId}
                              </p>
                            </div>
                            <p className="text-gray-700 text-sm">
                              {reply.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Reply Input */}
                    <div className="mt-3 ml-12 flex items-center">
                      <input
                        type="text"
                        placeholder="Reply..."
                        value={replyText[comment._id] || ""}
                        onChange={(e) =>
                          setReplyText((prev) => ({
                            ...prev,
                            [comment._id]: e.target.value,
                          }))
                        }
                        className="border border-gray-300 rounded-full px-4 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-[#5B2333]"
                      />
                      <button
                        onClick={() => handleAddReply(comment._id)}
                        className="ml-3 bg-[#5B2333] text-white px-4 py-2 rounded-full hover:bg-opacity-90 transition"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No comments yet.</p>
              )}
            </div>

            {/* New Comment Input */}
            <div className="mt-6">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="border border-gray-300 rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#5B2333]"
              />
              <button
                onClick={handleAddComment}
                className="bg-[#5B2333] text-white px-6 py-2 mt-3 rounded-full hover:bg-opacity-90 transition"
              >
                Post Comment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostDetail;
