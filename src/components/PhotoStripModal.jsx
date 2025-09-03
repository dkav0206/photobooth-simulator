import { useEffect, useMemo, useRef, useState } from "react";
import './photoStripModal.css'

import { useNavigate } from "react-router-dom";
export default function PhotoStripModal({
  open,
  onClose,
  images = [],            
  panelWidth = 600,      
  gapRatio = 0.03,        
  borderRatio = 0.06,    
  downloadName = "photostrip.png",
}) {
  const navigate = useNavigate();
  const [stripUrl, setStripUrl] = useState(null);
  const firstFocus = useRef(null);
  const modalRef = useRef(null);

  const buildStrip = useMemo(() => {
    return (urls) => {
      if (!urls?.length) return null;

      const panels = urls.length;
      const w = panelWidth;
      const gap = Math.round(w * gapRatio);
      const border = Math.round(w * borderRatio);

      const panelH = Math.round((w * 5) / 4);
      const stripW = w + border * 2;
      const stripH = panels * panelH + (panels - 1) * gap + border * 2;

      const c = document.createElement("canvas");
      c.width = stripW;
      c.height = stripH;
      const ctx = c.getContext("2d");

      // Paper background
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, stripW, stripH);

      let y = border;

      const drawOne = (i) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            // Fit image to panel (cover)
            const vidW = img.width;
            const vidH = img.height;
            const targetAspect = w / panelH;
            const srcAspect = vidW / vidH;
            let sx, sy, sWidth, sHeight;
            if (srcAspect > targetAspect) {
              // crop horizontally
              sHeight = vidH;
              sWidth = sHeight * targetAspect;
              sx = (vidW - sWidth) / 2;
              sy = 0;
            } else {
              // crop vertically
              sWidth = vidW;
              sHeight = sWidth / targetAspect;
              sx = 0;
              sy = (vidH - sHeight) / 2;
            }
            ctx.drawImage(img, sx, sy, sWidth, sHeight, border, y, w, panelH);
            y += panelH + (i < panels - 1 ? gap : 0);
            resolve();
          };
          img.src = urls[i];
        });

      return (async () => {
        for (let i = 0; i < panels; i++) {
        
          await drawOne(i);
        }
        return c.toDataURL("image/png");
      })();
    };
  }, [panelWidth, gapRatio, borderRatio]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const url = await buildStrip(images.slice(0, 4)); 
      setStripUrl(url);
      setTimeout(() => firstFocus.current?.focus(), 0);
    })();
  }, [open, images, buildStrip]);

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
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const download = () => {
    if (!stripUrl) return;
    const a = document.createElement("a");
    a.href = stripUrl;
    a.download = downloadName;
    a.click();
  };

  if (!open) return null;

  return (
    <div className="psm-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
         {stripUrl ? (
              <img className="psm-img" src={stripUrl} alt="Photobooth strip" />
            ) : <></>}
    
        <div className="psm-actions">
            <button className="psm-btn" onClick={download} disabled={!stripUrl}>Tải dìe</button>
            <button className="psm-btn psm-secondary" onClick={onClose}>Hong Tải</button>
            <button className="psm-btn psm-secondary" onClick={() => {
                navigate("/photobooth-simulator");         
                window.location.reload();
            }}>Chụp Lại</button>
        </div>
    </div>
  );
}
