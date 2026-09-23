import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Lightbox from "./components/Lightbox";
import { LightboxProvider } from "./components/LightboxContext";
import HomePage from "./pages/HomePage";
import WorkPage from "./pages/WorkPage";
import SeriesPage from "./pages/SeriesPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";

/** Reset scroll to the top on every real navigation. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  // The /work filter lives ABOVE the pages so selecting a category, opening
  // a series, and coming back restores exactly the group the user had.
  const [workFilter, setWorkFilter] = useState<string>("all");

  return (
    <LightboxProvider>
      <ScrollToTop />
      <Header />

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/work"
            element={
              <WorkPage filter={workFilter} onFilterChange={setWorkFilter} />
            }
          />
          <Route path="/work/:seriesId" element={<SeriesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      <Footer />

      {/* Shared, non-route overlay usable from every photo surface. */}
      <Lightbox />
    </LightboxProvider>
  );
}
