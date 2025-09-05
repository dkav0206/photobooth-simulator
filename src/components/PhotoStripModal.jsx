import { useEffect, useMemo, useRef, useState } from "react";
import './photoStripModal.css'
import { useNavigate } from "react-router-dom";
import { Button, ColorPicker } from 'antd';
import { UploadOutlined } from "@ant-design/icons";
import custom1 from '../assets/custom/custom1/custom1.png';
import avatar1 from '../assets/custom/custom1/avatar1.png';
import Tooltip from '@mui/material/Tooltip';

export default function PhotoStripModal({
  open,
  onClose,
  images = [],
  panelWidth = 600,          
  gapRatio = 0.03,         
  borderRatio = 0.06,       
  panelAspect = 2 / 3,      
  downloadName = "photostrip.png",
}) {
  const navigate = useNavigate();
  const stripRef = useRef(null);
  const firstFocus = useRef(null);
  const modalRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [paperBgImage, setPaperBgImage] = useState("");
  const [filter, setFilter] = useState(null)
  const [click, setClick] = useState(false)
  const [color, setColor] = useState('#fff');
  const [activeFrame, setActiveFrame] = useState(null);
  const bgColor = useMemo(() => (typeof color === 'string' ? color : color.toHexString()), [color]);

  const frames = [
    { id: "color", type: "color", tooltip:"Color Picker"},
    { id: "custom1", type: "custom1" , path:custom1, avatar:avatar1, tooltip:"Custom Frame 1"},
    { id: "upload", type: "upload",tooltip:"Upload File" },
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPaperBgImage(reader.result);

      setFilter("upload");
      setColor("#fff");
    };
    reader.readAsDataURL(file);

  };

  const dims = useMemo(() => {
    const panels = Math.min(images.length, 4);
    const w = Math.round(panelWidth);
    const gap = Math.round(w * gapRatio);
    const border = Math.round(w * borderRatio);
    const panelH = Math.round(w / panelAspect);
    const stripW = w + border * 2;
    const stripH = panels * panelH + (panels - 1) * gap + border * 2;
    return { panels, w, gap, border, panelH, stripW, stripH };
  }, [images.length, panelWidth, gapRatio, borderRatio, panelAspect]);

  const { panels, w, gap, border, panelH, stripW } = dims;

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

    const el = stripRef.current;
    const prevTransform = el.style.transform;
    const prevAnimation = el.style.animation;
    const prevTransition = el.style.transition;

    try {
      setDownloading(true);
      el.style.transform = "none";
      el.style.animation = "none";
      el.style.transition = "none";
      const rect = el.getBoundingClientRect();
      const exportWidth = Math.ceil(rect.width);
      const exportHeight = Math.ceil(rect.height);
      const { toPng } = await import("html-to-image");
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
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = downloadName;
      a.click();
    } catch (err) {
      console.error(err);
    } finally {
      // Restore original styles
      el.style.transform = prevTransform;
      el.style.animation = prevAnimation;
      el.style.transition = prevTransition;
      setDownloading(false);
    }
  };


  if (!open) return null;

  return (
    <div className="psm-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="psm-strip-container">
        <div className={`psm-strip-button ${click ? "psm-clicked" : ""}`} onClick={() => setClick(!click)}></div>
        <div
          className="psm-strip"
          ref={stripRef}
          style={{
            backgroundColor: filter === "color" ? bgColor : "#fff",
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

      {click ? <div className="filterContainer">
        <h1>Frame</h1>
        <div className="frameContainer">
          {frames.map((frame) => {
            if (frame.type === "color") {
              return (
                
                  <ColorPicker key={frame.id} value={color} onChange={setColor}>
                    <Tooltip title={frame.tooltip} placement="top">
                      <Button
                        className={`psm-frame ${activeFrame === frame.id ? "active-frame" : ""}`}
                        type="primary"
                        style={{ backgroundColor: bgColor, padding: 0 }}
                        onClick={() => {
                          setActiveFrame(frame.id);
                          setFilter("color");
                          setPaperBgImage("");
                        }}
                      />
                    </Tooltip>
                  </ColorPicker>
                
              );
            }else if (frame.type === "upload") {
              return (
                <Tooltip key={frame.id} title={frame.tooltip} placement="top">
                  <label
                    className={`psm-frame ${activeFrame === frame.id ? "active-frame" : ""}`}
                    style={{ backgroundColor: "#394c8eff" }}
                    onClick={() => setActiveFrame(frame.id)}
                  >
                    <UploadOutlined className="uploadIcon" style={{ color: "white" }} />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onClick={(e) => { e.currentTarget.value = null; }}
                      style={{ display: "none" }}
                      onChange={handleFileUpload}
                    />
                  </label>
                </Tooltip>
              );
            } else {
              return (
              <Tooltip key={frame.id} title={frame.tooltip} placement="top">
                <button 
                  className={`psm-frame ${activeFrame === frame.id ? "active-frame" : ""}`}
                  style={{
                      backgroundColor: "transparent",
                      backgroundImage: frame.avatar ? `url(${frame.avatar})` : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  onClick={() => {
                    setActiveFrame(frame.id); 
                    setPaperBgImage(frame.path); 
                    setFilter("custom");
                    setColor("#fff");
                  }
                  }>
                </button>
              </Tooltip>
              )
            }
          })}

        </div>
      </div> : <></>}

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
