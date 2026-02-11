import { Link } from "react-router-dom";

export default function Navbar({ children }) {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
      <Link
        to="/"
        className="text-xl font-bold text-indigo-400 flex items-center gap-2"
      >
        <span className="text-2xl">📋</span>
        QR Attendance
      </Link>
      <div className="flex items-center gap-3">{children}</div>
    </nav>
  );
}
