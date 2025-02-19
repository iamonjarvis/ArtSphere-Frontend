import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/axiosInstance";

function CollaborationRequestsPage() {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  // Fetch pending collaboration requests for the logged-in user
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/collaborate/received", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequests(res.data.requests);
      } catch (error) {
        console.error("Error fetching collaboration requests:", error);
      }
    };

    fetchRequests();
  }, []);

  // Accept a request, then navigate to the PaintingEditor in collaborative mode.
  const handleAcceptRequest = async (request) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/collaborate/accept",
        { requestId: request._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Collaboration request accepted!");
      // Use the roomId stored with the request.
      const roomId = request.roomId;
      if (!roomId) {
        alert("Room ID not found in request.");
        return;
      }
      // Navigate to the PaintingEditor with the roomId and sender info.
      navigate("/paint/editor", { state: { collaborativeMode: true, collaborator: request.sender, roomId } });
    } catch (error) {
      console.error("Error accepting collaboration request:", error);
      alert("Error accepting request.");
    }
  };

  // Reject a request and remove it from the list.
  const handleRejectRequest = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/collaborate/reject",
        { requestId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Collaboration request rejected!");
      setRequests((prev) => prev.filter((req) => req._id !== requestId));
    } catch (error) {
      console.error("Error rejecting collaboration request:", error);
      alert("Error rejecting request.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-4">Collaboration Requests</h2>
      {requests.length === 0 ? (
        <p>No collaboration requests at the moment.</p>
      ) : (
        <ul className="space-y-4">
          {requests.map((req) => (
            <li key={req._id} className="border p-4 rounded flex justify-between items-center">
              <div>
                <p className="font-semibold">{req.sender.name}</p>
                <p className="text-sm text-gray-600">@{req.sender.userId}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleAcceptRequest(req)}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleRejectRequest(req._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <button onClick={() => navigate("/paint")} className="mt-6 bg-gray-500 text-white px-4 py-2 rounded">
        Back to Gallery
      </button>
    </div>
  );
}

export default CollaborationRequestsPage;
