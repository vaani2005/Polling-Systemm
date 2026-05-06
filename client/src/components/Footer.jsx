import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="footer">
      {/* LEFT */}
      <div className="footer-left">
        <h3 onClick={() => navigate("/polls")}>PollApp</h3>
        <p>Simple & fast polling system</p>
      </div>

      {/* CENTER */}
      <div className="footer-links">
        <span onClick={() => navigate("/create")}>Create Poll</span>
        <span onClick={() => navigate("/login")}>Login</span>
      </div>

      {/* RIGHT */}
      <div className="footer-right">
        <p>© {new Date().getFullYear()} PollApp</p>
      </div>
    </footer>
  );
}
