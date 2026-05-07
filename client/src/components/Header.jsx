import { useNavigate } from "react-router-dom";
import { getToken } from "../api";
import Swal from "sweetalert2";

export default function Header() {
  const navigate = useNavigate();
  const token = getToken();

  const logout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "You will be logged out",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
    });

    if (result.isConfirmed) {
      localStorage.removeItem("token");

      await Swal.fire({
        icon: "success",
        text: "Logged out successfully",
        timer: 1000,
        showConfirmButton: false,
      });

      navigate("/login");
    }
  };

  return (
    <nav className="navbar">
      {/* LEFT */}
      {/* <div className="logo" onClick={() => navigate("/polls")}>
        <img src="/logo.webp" alt="Logo" />
      </div> */}

      {/* RIGHT */}
      <div className="nav-actions">
        {token ? (
          <>
            <button className="btn primary" onClick={() => navigate("/create")}>
              + Create
            </button>

            <button className="btn danger" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button className="btn" onClick={() => navigate("/login")}>
              Login
            </button>
            <button
              className="btn primary"
              onClick={() => navigate("/register")}
            >
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
