import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "QR Attendance System",
  description: "Smart QR Code Based Attendance System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen font-sans">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1f2937",
              color: "#f3f4f6",
              border: "1px solid #374151",
              borderRadius: "12px",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "#10b981", secondary: "#f3f4f6" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#f3f4f6" },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
