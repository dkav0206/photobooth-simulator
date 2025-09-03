// App.jsx
import { Fragment } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Home from './pages/Home'
import HomeTemplate from './template/HomeTemplate'
import PhotoPage from './pages/PhotoPage'

const page = {
  initial: { opacity: 0, scale: 1.2 },  // start smaller & transparent
  animate: { opacity: 1, scale: 1 },    // zoom to full size
  exit:    { opacity: 0, scale: 1.2 },  // shrink back & fade out
  transition: { duration: 0.4, ease: "easeInOut" }
};
export default function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path=""
          element={
            <motion.div {...page}>
              <HomeTemplate />
            </motion.div>
          }
        >
          <Route
            index
            element={
              <motion.div {...page}>
                <Home />
              </motion.div>
            }
          />
        </Route>

        <Route
          path="/photo"
          element={
            <motion.div {...page}>
              <PhotoPage />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}