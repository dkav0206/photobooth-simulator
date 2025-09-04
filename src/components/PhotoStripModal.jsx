import { useEffect, useMemo, useRef, useState } from "react";
import './photoStripModal.css'

import { useNavigate } from "react-router-dom";
export default function PhotoStripModal({
  open,
  onClose,
  images = [],
  panelWidth = 600,          // width of each photo area (px)
  gapRatio = 0.03,           // gap between photos (relative to panelWidth)
  borderRatio = 0.06,        // outer border thickness (relative to panelWidth)
  panelAspect = 2 / 3,       // width/height ratio of each photo (default 4:5)
  paperColor = "#fff",       // strip background color
  paperBgSize = "cover",     // how to render template texture
  downloadName = "photostrip.png",
}) {
  const navigate = useNavigate();
  const stripRef = useRef(null);
  const firstFocus = useRef(null);
  const modalRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [paperBgImage, setPaperBgImage] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPaperBgImage(reader.result); // <-- Base64 string (data URL)
    };
    reader.readAsDataURL(file); // Convert file to Base64
  };


  const dims = useMemo(() => {
    const panels = Math.min(images.length, 4); // keep ≤4 like your original
    const w = Math.round(panelWidth);
    const gap = Math.round(w * gapRatio);
    const border = Math.round(w * borderRatio);
    const panelH = Math.round(w / panelAspect);
    const stripW = w + border * 2;
    const stripH = panels * panelH + (panels - 1) * gap + border * 2;
    return { panels, w, gap, border, panelH, stripW, stripH };
  }, [images.length, panelWidth, gapRatio, borderRatio, panelAspect]);

   const { panels, w, gap, border, panelH, stripW } = dims;

  // Focus management + esc + tab trap
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "Tab" && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    setTimeout(() => firstFocus.current?.focus(), 0);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  
  const download = async () => {
    if (!stripRef.current) return;

    // Save inline styles so we can restore them
    const el = stripRef.current;
    const prevTransform   = el.style.transform;
    const prevAnimation   = el.style.animation;
    const prevTransition  = el.style.transition;

    try {
      setDownloading(true);
      console.log("1")
      // Temporarily remove rotation/animation for a clean, vertical export
      el.style.transform  = "none";
      el.style.animation  = "none";
      el.style.transition = "none";

      // Measure to avoid odd crops on rotated layouts
      const rect = el.getBoundingClientRect();
      const exportWidth  = Math.ceil(rect.width);
      const exportHeight = Math.ceil(rect.height);
      console.log("1")

      const { toPng } = await import("html-to-image");
      console.log("1")
      console.log(el)
      const dataUrl = await toPng(el, {
        pixelRatio: 2,
        cacheBust: true,
        width: exportWidth,
        height: exportHeight,
        style: {
          transform: "none",
          animation: "none",
          transition: "none",
        },
     });
     console.log("1")

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = downloadName;
      a.click();
      console.log("1")
    } catch (err) {
      console.error(err);
      alert("Could not export image. Make sure 'html-to-image' is installed.");
    } finally {
      // Restore original styles
      el.style.transform  = prevTransform;
      el.style.animation  = prevAnimation;
      el.style.transition = prevTransition;
      setDownloading(false);
    }
};


  if (!open) return null;

  return (
    <div className="psm-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
        <div className="psm-strip-container">
          <label className="psm-strip-button">
            <input
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />
          </label>

            <div
              className="psm-strip"
              ref={stripRef}
              style={{
                backgroundColor: paperColor,
              }}
            >
              {images.slice(0, panels).map((src, i) => (
                <div
                  key={i}
                  className="psm-img"
                  style={{
                    backgroundImage: `url(${src})`,
                  }}
                  aria-label={`Photostrip image ${i + 1}`}
                />
              ))}
              {paperBgImage && (
                <img
                  className="psm-strip-cover"
                  src={paperBgImage}
                  alt=""
                  crossOrigin="anonymous"
                />
              )}
            </div>

      </div>

        <div className="psm-actions">
            <button className="psm-btn" onClick={download} disabled={downloading || panels === 0}>{downloading ? "Đang lưu…" : "Tải dìe"}</button>
            <button className="psm-btn psm-secondary" onClick={onClose}>Hong Tải</button>
            <button className="psm-btn psm-secondary" onClick={() => {
                navigate("/photobooth-simulator");         
                window.location.reload();
            }}>Chụp Lại</button>
        </div>
    </div>
  );
}
