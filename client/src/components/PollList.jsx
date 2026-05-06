import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { request, getToken } from "../api";
import Swal from "sweetalert2";

export default function PollList() {
  const [polls, setPolls] = useState([]);
  const [voted, setVoted] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("latest");
  const navigate = useNavigate();
  const token = getToken();

  let userId = null;

  try {
    if (token) {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      userId = decoded.id;
    }
  } catch {
    userId = null;
  }

  // FETCH POLLS
  const fetchPolls = async (pageNum = 1) => {
    try {
      setLoading(true);

      const res = await fetch(
        `https://polling-systemm-client1.onrender.com/polls?page=${pageNum}&limit=5&search=${search}&filter=${filter}`,
      );
      const data = await res.json();

      setPolls(data?.polls || []);
      setPage(data?.page || 1);
      setTotalPages(data?.totalPages || 1);
    } catch (err) {
      console.log(err);
      setPolls([]);
      Swal.fire("Error", "Failed to load polls", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls(1);
  }, [search, filter]);

  // VOTE
  const vote = async (pollId, optionIndex) => {
    if (!token) return navigate("/login");

    try {
      await request("/poll/vote", "POST", {
        pollId,
        optionIndex,
      });
      setVoted((prev) => ({ ...prev, [pollId]: optionIndex }));

      fetchPolls(page);
    } catch (err) {
      Swal.fire("Error", "Voting failed", "error");
    }
  };

  // DELETE
  const handleDelete = async (pollId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
    });

    if (!result.isConfirmed) return;

    try {
      await request(`/poll/${pollId}`, "DELETE");
      fetchPolls(page);
    } catch (err) {
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  return (
    <div className="poll-container">
      <h2>Live Polls</h2>

      <div className="top-bar">
        <input
          type="text"
          placeholder="Search polls..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
          <option value="mostVotes">Most Votes</option>
        </select>
      </div>
      {polls.map((p) => (
        <div className="poll-card" key={p._id}>
          <div className="poll-header">
            <h3>{p.question}</h3>

            {p.createdBy === userId && (
              <div>
                <button
                  className="edit-btn"
                  onClick={() => navigate(`/edit/${p._id}`)}
                >
                  Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(p._id)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="poll-options">
            {p.options.map((opt, i) => (
              <div className="option-row" key={i}>
                <div className="option-text">
                  {opt.text}
                  <span className="votes"> ({opt.votes})</span>
                </div>

                {!token ? (
                  <button
                    className="vote-btn"
                    onClick={() => navigate("/login")}
                  >
                    Login to Vote
                  </button>
                ) : (
                  <button
                    className={`vote-btn $
                      {voted[p._id] === i ? "selected" : ""} 
                    ${!token ? "login" : ""}`}
                    onClick={() => vote(p._id, i)}
                  >
                    {!token
                      ? "Login to Vote"
                      : voted[p._id] === i
                        ? "Selected"
                        : "Vote"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="pagination">
        <button disabled={page === 1} onClick={() => fetchPolls(page - 1)}>
          Prev
        </button>

        <span className="page-info">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => fetchPolls(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
