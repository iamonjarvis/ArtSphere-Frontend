import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Line } from "react-konva";
import { useNavigate, useLocation } from "react-router-dom";
import io from "socket.io-client";
import axios from "../services/axiosInstance";
import { FaSave, FaArrowLeft, FaRegCommentDots, FaUndo, FaUsers } from "react-icons/fa";

// Connect to your Socket.IO backend (adjust URL as needed)
const socket = io("https://artsphere-backend.onrender.com");

function PaintingEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  // Extract parameters from state. 'collaborator' is the other user.
  const { collaborativeMode = false, painting, collaborator, roomId: initialRoomId } = location.state || {};

  const userId = localStorage.getItem("userId");

  // If a roomId is provided (e.g., from an accepted request), use it.
  const [currentRoomId, setCurrentRoomId] = useState(initialRoomId || null);

  const [lines, setLines] = useState(
    painting && painting.canvasJson ? JSON.parse(painting.canvasJson) : []
  );
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushWidth, setBrushWidth] = useState(3);
  const [tool, setTool] = useState("brush"); // "brush" or "eraser"
  const [collaborative, setCollaborative] = useState(collaborativeMode);
  const [showCollaborateModal, setShowCollaborateModal] = useState(false);
  const [mutualFollowers, setMutualFollowers] = useState([]);

  const isDrawing = useRef(false);
  const stageRef = useRef(null);

  // When in collaborative mode and a room ID exists, join that room.
  useEffect(() => {
    if (collaborative && currentRoomId) {
      console.log("Joining room:", currentRoomId);
      socket.emit("joinRoom", currentRoomId);
      socket.on("canvas:update", (data) => {
        if (data?.lines) {
          console.log("Received canvas update:", data.lines);
          setLines(data.lines);
        }
      });
      return () => {
        socket.off("canvas:update");
      };
    }
  }, [collaborative, currentRoomId]);

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    setLines((prev) => [
      ...prev,
      {
        points: [point.x, point.y],
        stroke: tool === "brush" ? brushColor : "black",
        strokeWidth: brushWidth,
        globalCompositeOperation: tool === "eraser" ? "destination-out" : "source-over",
      },
    ]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    setLines((prev) => {
      const lastLine = prev[prev.length - 1];
      const newPoints = lastLine.points.concat([point.x, point.y]);
      const updatedLine = { ...lastLine, points: newPoints };
      const updatedLines = [...prev.slice(0, prev.length - 1), updatedLine];
      if (collaborative && currentRoomId) {
        console.log("Emitting canvas update to room:", currentRoomId, updatedLines);
        socket.emit("canvas:update", { roomId: currentRoomId, lines: updatedLines });
      }
      return updatedLines;
    });
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  // Navigation handlers
  const handleBackToGallery = () => navigate("/paint");
  const handleMessageClick = () => navigate("/chat");

  const handleSavePainting = async () => {
    try {
      const canvasJson = JSON.stringify(lines);
      const dataURL = stageRef.current.toDataURL();
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/paintings",
        { canvas: canvasJson, imageData: dataURL },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Painting saved!");
      navigate("/paint");
    } catch (error) {
      console.error("Error saving painting:", error);
      alert("Error saving painting.");
    }
  };

  const handleUndo = () => {
    setLines((prev) => {
      const updated = prev.slice(0, prev.length - 1);
      if (collaborative && currentRoomId) {
        socket.emit("canvas:update", { roomId: currentRoomId, lines: updated });
      }
      return updated;
    });
  };

  const handleClearCanvas = () => {
    setLines([]);
    if (collaborative && currentRoomId) {
      socket.emit("canvas:update", { roomId: currentRoomId, lines: [] });
    }
  };

  const presetColors = [
    "#000000",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
  ];

  // --- Collaboration Modal logic ---
  const openCollaborateModal = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/collaborate/mutualFollowers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMutualFollowers(res.data.mutualFollowers);
      setShowCollaborateModal(true);
    } catch (error) {
      console.error("Error fetching mutual followers:", error);
      alert("Error fetching mutual followers.");
    }
  };

  // When sending a collaboration request, call the backend endpoint to generate the room ID.
  const sendCollaborationRequest = async (targetUserId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/api/collaborate/request",
        { targetUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Use the roomId returned from the backend.
      const newRoomId = res.data.roomId;
      console.log("Collaboration request sent with room id:", newRoomId);
      // Immediately join the generated room.
      socket.emit("joinRoom", newRoomId);
      setCurrentRoomId(newRoomId);
      setCollaborative(true);
    } catch (error) {
      console.error("Error sending collaboration request:", error);
      alert("Failed to send collaboration request.");
    }
  };
  // --- End Collaboration Modal logic ---

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F4F3]">
      {/* Top Navigation Bar */}
      <nav className="bg-gray-200 p-3 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-2">
          <button onClick={handleBackToGallery} className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
            <FaArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Gallery</span>
          </button>
          <button onClick={openCollaborateModal} className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
            <FaUsers className="w-5 h-5" />
            <span className="font-medium">Collaborate</span>
          </button>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={handleMessageClick} className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
            <FaRegCommentDots className="w-5 h-5" />
            <span className="font-medium">Message</span>
          </button>
          <button onClick={handleSavePainting} className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
            <FaSave className="w-5 h-5" />
            <span className="font-medium">Save</span>
          </button>
          <button onClick={handleUndo} className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
            <FaUndo className="w-5 h-5" />
            <span className="font-medium">Undo</span>
          </button>
          <button onClick={handleClearCanvas} className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
            <span className="font-medium">Clear</span>
          </button>
        </div>
      </nav>

      {/* Toolbox Toolbar */}
      <div className="bg-gray-100 p-3 shadow-md flex flex-wrap items-center justify-between">
        <div className="flex items-center space-x-2">
          <button onClick={() => setTool("brush")} className={`px-4 py-2 rounded-lg border transition-colors ${tool === "brush" ? "bg-blue-500 text-white" : "bg-white text-[#5B2333]"}`}>
            Brush
          </button>
          <button onClick={() => setTool("eraser")} className={`px-4 py-2 rounded-lg border transition-colors ${tool === "eraser" ? "bg-blue-500 text-white" : "bg-white text-[#5B2333]"}`}>
            Eraser
          </button>
        </div>
        {tool === "brush" && (
          <div className="flex items-center space-x-2">
            {presetColors.map((color) => (
              <div
                key={color}
                onClick={() => setBrushColor(color)}
                className={`w-6 h-6 rounded-full cursor-pointer border transition-colors ${brushColor === color ? "border-black" : "border-gray-300"}`}
                style={{ backgroundColor: color }}
              />
            ))}
            <input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              className="w-10 h-10 p-0 border-none cursor-pointer"
            />
          </div>
        )}
        <div className="flex items-center space-x-2">
          <span className="text-[#5B2333] font-medium">Size:</span>
          <input
            type="range"
            min="1"
            max="20"
            value={brushWidth}
            onChange={(e) => setBrushWidth(Number(e.target.value))}
            className="accent-[#5B2333]"
          />
          <span className="text-[#5B2333] font-medium">{brushWidth}px</span>
        </div>
      </div>

      {/* Drawing Canvas */}
      <div className="flex flex-1 p-4 bg-gray-300">
        <Stage
          width={window.innerWidth}
          height={window.innerHeight - 120} // Adjust height for nav and toolbox
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          ref={stageRef}
          className="bg-white"
        >
          <Layer>
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.stroke}
                strokeWidth={line.strokeWidth}
                tension={0.5}
                lineCap="round"
                globalCompositeOperation={line.globalCompositeOperation}
              />
            ))}
          </Layer>
        </Stage>
      </div>

      {/* Collaborate Modal */}
      {showCollaborateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
            <h2 className="text-2xl font-bold text-[#5B2333] mb-4">Collaborate with Mutual Followers</h2>
            {mutualFollowers.length > 0 ? (
              <ul className="space-y-3">
                {mutualFollowers.map((user) => (
                  <li key={user._id} className="flex justify-between items-center p-3 border-b">
                    <span className="font-medium text-[#5B2333]">{user.name}</span>
                    <button
                      onClick={() => sendCollaborationRequest(user._id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                    >
                      Send Request
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No mutual followers available.</p>
            )}
            <button onClick={() => setShowCollaborateModal(false)} className="mt-4 text-gray-500 underline">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaintingEditor;
