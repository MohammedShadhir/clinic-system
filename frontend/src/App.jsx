import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "../src/components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import NewVisit from "./pages/NewVisit";
import VisitDetail from "./pages/VisitDetail";
import Patients from "./pages/Patients";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/visits/:id" element={<VisitDetail />} />
        </Route>
        {/* NewVisit has its own full-screen wizard layout */}
        <Route path="/visits/new" element={<NewVisit />} />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: "DM Sans, sans-serif",
            fontSize: "0.875rem",
            borderRadius: "6px",
          },
          success: { iconTheme: { primary: "#0d7c6b", secondary: "white" } },
        }}
      />
    </BrowserRouter>
  );
}
