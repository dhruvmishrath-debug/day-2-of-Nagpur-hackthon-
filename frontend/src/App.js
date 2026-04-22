import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import BookingStatus from "@/pages/BookingStatus";
import { EVProvider } from "@/context/EVContext";

function App() {
  return (
    <EVProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-stone-50 text-stone-900">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/bookings" element={<BookingStatus />} />
          </Routes>
          <Toaster position="top-right" richColors />
        </div>
      </BrowserRouter>
    </EVProvider>
  );
}

export default App;
