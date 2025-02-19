import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/axiosInstance";
import { io } from "socket.io-client";

function ChatPage() {
  const [contacts, setContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Updated socket connection URL to the new backend link
    const newSocket = io("https://artsphere-backend.onrender.com");
    setSocket(newSocket);

    const token = localStorage.getItem("token");
    const decodedUser = JSON.parse(atob(token.split(".")[1]));
    newSocket.emit("register", decodedUser.id);

    newSocket.on("receiveMessage", (message) => {
      // If the message is for the current selected chat, add it to the conversation
      if (
        selectedUser &&
        (message.from === selectedUser._id || message.to === selectedUser._id)
      ) {
        setMessages((prev) => [...prev, message]);
      }
      // Update contacts with the latest chat message
      setContacts((prevContacts) =>
        prevContacts.map((contact) => {
          if (contact._id === message.from || contact._id === message.to) {
            return {
              ...contact,
              lastChat: { text: message.text, createdAt: message.createdAt },
            };
          }
          return contact;
        })
      );
    });

    return () => newSocket.disconnect();
  }, [selectedUser]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/messages/contacts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setContacts(response.data.contacts);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };
    fetchContacts();
  }, []);

  useEffect(() => {
    if (!selectedUser) return;
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`/api/messages/${selectedUser._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(response.data.chatHistory);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [selectedUser]);

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    const token = localStorage.getItem("token");
    const decodedUser = JSON.parse(atob(token.split(".")[1]));

    // Update payload to match the backend's expected format
    const payload = { message: newMessage };

    try {
      // Send POST request to /api/messages/{contactId}
      await axios.post(`/api/messages/${selectedUser._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Prepare data for socket emission
      const socketMessageData = {
        from: decodedUser.id,
        to: selectedUser._id,
        text: newMessage,
      };
      socket.emit("sendMessage", socketMessageData);

      // Add the new message to the local state
      setMessages((prev) => [
        ...prev,
        { ...socketMessageData, createdAt: new Date() },
      ]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F7F4F3]">
      <div className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <button
          onClick={() => navigate("/home")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Home
        </button>
        <button
          onClick={() => navigate("/profile")}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Account
        </button>
        <button
          onClick={() => navigate("/paint")}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        >
          Paint
        </button>
      </div>
      <div className="flex flex-1">
        <div className="w-1/3 bg-white shadow-md p-4 overflow-y-auto border-r">
          <h2 className="text-xl font-bold mb-4 text-[#5B2333]">Chats</h2>
          {contacts.length === 0 ? (
            <p className="text-gray-500">No contacts found</p>
          ) : (
            <ul>
              {contacts.map((contact) => (
                <li
                  key={contact._id}
                  className={`p-3 flex items-center rounded cursor-pointer transition-colors ${
                    selectedUser?._id === contact._id
                      ? "bg-gray-300"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() => setSelectedUser(contact)}
                >
                  <img
                    src={contact.profilePic || "/default-avatar.png"}
                    alt={contact.name || contact.userId}
                    className="w-12 h-12 rounded-full object-cover mr-3"
                  />
                  <div>
                    <div className="font-semibold text-[#5B2333]">
                      {contact.userId}
                    </div>
                    {contact.lastChat && (
                      <div className="text-sm text-gray-600">
                        {contact.lastChat.text}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="w-2/3 flex flex-col bg-white">
          <div className="p-4 border-b">
            {selectedUser ? (
              <h2 className="text-xl font-bold text-[#5B2333]">
                {selectedUser.userId}
              </h2>
            ) : (
              <h2 className="text-xl text-gray-500">
                Select a contact to chat
              </h2>
            )}
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center">No messages yet</p>
            ) : (
              <div className="flex flex-col space-y-3">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-3 max-w-md rounded-lg ${
                      msg.from === selectedUser?._id
                        ? "bg-gray-200 self-start"
                        : "bg-blue-500 text-white self-end"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>
            )}
          </div>
          {selectedUser && (
            <div className="p-4 border-t flex">
              <input
                type="text"
                className="flex-1 border p-3 rounded-l focus:outline-none focus:ring-2 focus:ring-[#5B2333]"
                placeholder="Type a message..."
                value={newMessage}
                onChange={handleInputChange}
              />
              <button
                className="bg-blue-500 text-white px-6 py-3 rounded-r hover:bg-blue-600 transition-colors"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
