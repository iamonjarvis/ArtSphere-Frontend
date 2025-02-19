import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginSignup";
import ProfilePage from "./pages/ProfilePage";
import PublicProfilePage from "./pages/PublicProfilePage";
import PublicPostPage from "./pages/PublicPostPage"; // New component for public post detail
import PaintPage from "./pages/PaintPage";
import AdvancedPaintEditor from "./pages/AdvancedPaintEditor";
import UploadPost from "./pages/UploadPost";
import ChatPage from "./pages/ChatPage";
import CollaborationRequestsPage from "./pages/CollaboratePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/paint" element={<PaintPage />} />
        <Route path="/paint/editor" element={<AdvancedPaintEditor />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:userId" element={<PublicProfilePage />} />
        <Route path="/paint/collaboration" element={<CollaborationRequestsPage />} />
        <Route path="/post/:postId" element={<PublicPostPage />} />
        <Route path="/uploadpost" element={<UploadPost />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </Router>
  );
}

export default App;
