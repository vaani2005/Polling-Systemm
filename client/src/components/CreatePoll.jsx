import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { request, getToken } from "../api";
import Swal from "sweetalert2";

export default function CreatePoll() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  useEffect(() => {
    if (!getToken()) {
      Swal.fire({
        icon: "warning",
        text: "Please login first",
      }).then(() => {
        window.location.href = "/login";
      });
    }

    if (id) fetchPoll();
  }, [id]);

  const fetchPoll = async () => {
    try {
      const data = await request(`/poll/${id}`);
      if (!data) return;

      setQuestion(data.question);
      setOptions(data.options.map((opt) => opt.text));
    } catch (err) {
      Swal.fire({
        icon: "error",
        text: "Error fetching poll",
      });
    }
  };

  const submit = async () => {
    const clean = options.map((o) => o.trim()).filter((o) => o);

    // Validation
    if (!question || clean.length < 2) {
      return Swal.fire({
        icon: "error",
        text: "Question + at least 2 options required",
      });
    }

    const uniqueOptions = new Set(clean);
    if (uniqueOptions.size !== clean.length) {
      return Swal.fire({
        icon: "error",
        text: "Options must be unique (no duplicates)",
      });
    }

    try {
      if (id) {
        await request(`/poll/${id}`, "PUT", {
          question,
          options: clean,
        });
      } else {
        await request("/poll", "POST", {
          question,
          options: clean,
        });
      }

      // Success alert
      await Swal.fire({
        icon: "success",
        text: id ? "Poll updated successfully" : "Poll created successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/polls");
    } catch (err) {
      Swal.fire({
        icon: "error",
        text: err?.msg || "Error saving poll",
      });
    }
  };

  return (
    <div className="create-container">
      <div className="create-box">
        <h2>{id ? "Edit Poll" : "Create Poll"}</h2>

        <input
          value={question}
          placeholder="Enter poll question"
          onChange={(e) => setQuestion(e.target.value)}
        />

        {options.map((o, i) => (
          <input
            key={i}
            value={o}
            placeholder={`Option ${i + 1}`}
            onChange={(e) => {
              const copy = [...options];
              copy[i] = e.target.value;
              setOptions(copy);
            }}
          />
        ))}

        <button
          onClick={() => {
            if (options[options.length - 1].trim() === "") {
              return Swal.fire({
                icon: "warning",
                text: "Fill current option first",
              });
            }
            setOptions([...options, ""]);
          }}
        >
          Add Option
        </button>

        <button onClick={submit}>{id ? "Update Poll" : "Create"}</button>
      </div>
    </div>
  );
}
