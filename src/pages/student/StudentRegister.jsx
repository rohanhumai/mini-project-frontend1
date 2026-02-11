import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar";
import LoadingButton from "../../components/LoadingButton";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function StudentRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    rollNumber: "",
    email: "",
    department: "",
    year: "1",
    section: "",
  });

  useEffect(() => {
    if (localStorage.getItem("studentToken")) navigate("/student/scan");
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/student/register`, {
        ...form,
        year: parseInt(form.year),
      });
      if (res.data.success) {
        localStorage.setItem("studentToken", res.data.token);
        localStorage.setItem("studentData", JSON.stringify(res.data.student));
        toast.success(res.data.message);
        navigate("/student/scan");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const ic =
    "w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-gray-100 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all";

  const departments = [
    "Computer Science",
    "Electronics",
    "Mechanical",
    "Civil",
    "Electrical",
    "IT",
  ];

  return (
    <>
      <Navbar>
        <Link
          to="/teacher/login"
          className="px-4 py-2 text-sm font-semibold text-gray-200 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 transition-all"
        >
          Teacher Login
        </Link>
      </Navbar>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📱</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-100">
                Student Registration
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Fill details to mark attendance
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={ic}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Roll Number *
                </label>
                <input
                  type="text"
                  placeholder="CS2024001"
                  value={form.rollNumber}
                  onChange={(e) =>
                    setForm({ ...form, rollNumber: e.target.value })
                  }
                  className={ic}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  placeholder="student@college.edu"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={ic}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Department *
                  </label>
                  <select
                    value={form.department}
                    onChange={(e) =>
                      setForm({ ...form, department: e.target.value })
                    }
                    className={ic}
                    required
                  >
                    <option value="">Select</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Year *
                  </label>
                  <select
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className={ic}
                    required
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Section
                </label>
                <input
                  type="text"
                  placeholder="A, B, C (optional)"
                  value={form.section}
                  onChange={(e) =>
                    setForm({ ...form, section: e.target.value })
                  }
                  className={ic}
                />
              </div>
              <LoadingButton
                type="submit"
                loading={loading}
                loadingText="Registering..."
                className="w-full px-6 py-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
              >
                ✅ Register & Continue
              </LoadingButton>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
