// frontent live : https://polling-systemm-client1.onrender.com
// backend live : https://polling-systemm-server.onrender.com
// local host : http://localhost:5000
import Swal from "sweetalert2";

export const getToken = () => localStorage.getItem("token");

const BASE_URL = "http://localhost:5000";

export const request = async (url, method = "GET", body) => {
  try {
    const token = getToken();

    const res = await fetch(BASE_URL + url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: method !== "GET" && body ? JSON.stringify(body) : null,
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = {};
    }
    if (res.status === 401) {
      localStorage.removeItem("token");

      if (!window.__alertShown) {
        window.__alertShown = true;

        await Swal.fire({
          icon: "warning",
          text:
            data.msg === "No token"
              ? "Please login to continue"
              : "Session expired. Please login again",
        });

        window.__alertShown = false;
      }

      window.location.replace("/login");
      return null;
    }
    if (!res.ok) {
      Swal.fire({
        icon: "error",
        text: data.msg || "Something went wrong",
      });
      return null;
    }

    if (method !== "GET" && data.msg) {
      Swal.fire({
        icon: "success",
        text: data.msg,
      });
    }

    return data;
  } catch (err) {
    console.error("API error:", err);

    Swal.fire({
      icon: "error",
      text: err.message || "Server not reachable",
    });
  }
};
