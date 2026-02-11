import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar";
import LoadingButton from "../../components/LoadingButton";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function TeacherLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/teacher/login`, form);
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem(
          "teacherData",
          JSON.stringify(res.data.teacher)
        );
        toast.success("Login successful!");
        navigate("/teacher/dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const ic =
    "w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-gray-100 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all";

  return (
    <>
      <Navbar>
        <Link
          to="/student/register"
          className="px-4 py-2 text-sm font-semibold text-gray-200 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 transition-all"
        >
          Student Register
        </Link>
      </Navbar>

      <div className="flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md">
          <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎓</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-100">
                Teacher Login
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Sign in to manage attendance
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="teacher@college.edu"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className={ic}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className={ic}
                  required
                />
              </div>
              <LoadingButton
                type="submit"
                loading={loading}
                loadingText="Signing in..."
                className="w-full px-6 py-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
              >
                Sign In
              </LoadingButton>
            </form>

            <div className="mt-6 p-4 bg-gray-950/50 rounded-xl border border-gray-800/50">
              <p className="text-xs text-gray-400 text-center">
                <span className="font-semibold text-gray-300">Demo:</span>{" "}
                admin@college.edu / admin123
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}