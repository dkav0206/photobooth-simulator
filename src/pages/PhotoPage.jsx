import { useEffect, useRef, useState } from 'react';
import Instruction from '../assets/Instruction.svg?react'
import BoothFrame from '../assets/BoothFrame.svg?react'
import Output from '../assets/Output.svg?react'
import Strip from "../assets/strip.svg?react";
import './photopage.css'
import LeverPull from '../components/LeverPull';
import PhotoStripModal from '../components/PhotoStripModal';

function applyWiggle(svg) {
  if (!svg || svg.dataset.wiggled) return; // avoid double-inject
  svg.dataset.wiggled = "true";

  const svgns = "http://www.w3.org/2000/svg";
  const defs = document.createElementNS(svgns, "defs");
  const filter = document.createElementNS(svgns, "filter");
  const turb = document.createElementNS(svgns, "feTurbulence");
  const anim = document.createElementNS(svgns, "animate");
  const disp = document.createElementNS(svgns, "feDisplacementMap");

  const fid = "wiggle-" + Math.random().toString(36).slice(2);
  filter.setAttribute("id", fid);

  turb.setAttribute("type", "fractalNoise");
  turb.setAttribute("baseFrequency", "0.01");
  turb.setAttribute("numOctaves", "3");
  turb.setAttribute("seed", "2");
  turb.setAttribute("result", "noise");

  anim.setAttribute("attributeName", "seed");
  anim.setAttribute("values", "2;120;2"); // seamless loop
  anim.setAttribute("dur", "50s");         // adjust speed (you had 50s = very slow)
  anim.setAttribute("repeatCount", "indefinite");
  turb.appendChild(anim);

  disp.setAttribute("in", "SourceGraphic");
  disp.setAttribute("in2", "noise");
  disp.setAttribute("scale", "5");        // wiggle strength (2–8 is nice)
  disp.setAttribute("xChannelSelector", "R");
  disp.setAttribute("yChannelSelector", "G");

  filter.appendChild(turb);
  filter.appendChild(disp);
  defs.appendChild(filter);

  svg.insertBefore(defs, svg.firstChild);
  svg.setAttribute("filter", `url(#${fid})`);
}

const RATIO_W = 200;
const RATIO_H = 250;
const interval = 100;
const photoNo = 4;


export default function PhotoPage(props) { 
    const [open, setOpen] = useState(false); // photos = array of dataURLs
    const [animate, setAnimate] = useState(false);
    const instructionRef = useRef(null);
    const boothFrameRef = useRef(null);
    const outputRef = useRef(null);
    const videoRef = useRef(null);
    const [cameraOn, setCameraOn] = useState(false);
    const canvasRef = useRef(null);
    const stripRef = useRef(null);
    const [photos, setPhotos] = useState([]);
    const [countDown, setCountDown] = useState(5);



    const startCamera = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        const video = videoRef.current;
        video.srcObject = stream;

        // wait until metadata loads so videoWidth/Height are valid
        await new Promise((resolve) => {
            if (video.readyState >= 2) return resolve(); // HAVE_CURRENT_DATA
            const onCanPlay = () => { video.removeEventListener("loadedmetadata", onCanPlay); resolve(); };
            video.addEventListener("loadedmetadata", onCanPlay);
        });

        await video.play();
        return stream; // optional
    };

    // Take 4 photos at intervals
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    const takeFourPhotos = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current || document.createElement("canvas");
        if (!canvasRef.current) canvasRef.current = canvas;

        // --- target ratio: 200:250 (i.e., 4:5) ---
        const targetAspect = 300 / 200; // 0.8 (width/height)

        // Choose an output size that keeps 4:5 ratio (tweak if you want)
        const OUTPUT_H = Math.min(video.videoHeight || 1000, 1000); // cap to 1000px tall
        const OUTPUT_W = Math.round(OUTPUT_H * targetAspect);       // 4:5 ratio
        canvas.width = OUTPUT_W;
        canvas.height = OUTPUT_H;

        const ctx = canvas.getContext("2d");

        // Compute centered crop from the video to match 4:5 ratio
        const vW = video.videoWidth || 1280;
        const vH = video.videoHeight || 720;
        const videoAspect = vW / vH;

        let sx, sy, sWidth, sHeight;
        if (videoAspect > targetAspect) {
            // Video is wider than target -> crop horizontally
            sHeight = vH;
            sWidth = Math.round(sHeight * targetAspect);
            sx = Math.round((vW - sWidth) / 2);
            sy = 0;
        } else {
            // Video is taller/narrower than target -> crop vertically
            sWidth = vW;
            sHeight = Math.round(sWidth / targetAspect);
            sx = 0;
            sy = Math.round((vH - sHeight) / 2);
        }

        const shots = [];
        for (let i = 0; i < photoNo; i++) {
            // 4-second countdown (4,3,2,1)
            for (let a = 0; a < 4; a++) {
            await sleep(interval);
            setCountDown(4 - a);
            }

            // draw mirrored, cropped frame into 4:5 canvas
            ctx.clearRect(0, 0, OUTPUT_W, OUTPUT_H);
            ctx.save();
            // Mirror horizontally (selfie-style):
            ctx.scale(-1, 1);
            // Because X is flipped, draw at negative dest-x to land at (0,0)
            ctx.drawImage(
            video,
            sx, sy, sWidth, sHeight, // source crop rect in the video
            -OUTPUT_W, 0, OUTPUT_W, OUTPUT_H // destination on flipped canvas
            );
            ctx.restore();

            shots.push(canvas.toDataURL("image/png"));
            setPhotos(shots); // update your state with the growing array
        }

        setCountDown(5); // whatever sentinel you use after the sequence
        };


    useEffect(() => {
        const makeWiggly = (host) => {
        if (!host) return;
        const svg = host.tagName?.toLowerCase() === "svg" ? host : host.querySelector("svg");
        if (svg) applyWiggle(svg);
        };
        makeWiggly(instructionRef.current);
        makeWiggly(boothFrameRef.current);
        makeWiggly(outputRef.current);
        makeWiggly(stripRef.current);
    }, []);
    


    return (
        <div className="secondContainer">
            <div className='innerContainer'>
                <div  ref={instructionRef} className='instruction'>
                    <Instruction width="100%" height="100%" preserveAspectRatio="xMidYMid meet"
                    {...props}/>
                </div>
                <div className='boothFrameContainer'>
                    <div className='cameraContainer'>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                transform: "scaleX(-1)"
                            }}
                        /> 
                    </div>

                    {countDown == 5 ? 
                        <div className='bigg-ahh-rec'>
                        </div>
                        :<div className='countDown'>
                            <p>{countDown}</p>
                        </div>
                    }
                    
                    <div ref={boothFrameRef} className='boothFrame'>
                        <BoothFrame width="100%" height="100%" preserveAspectRatio="xMidYMid meet"
                        {...props}/>
                    </div>
                    
                </div>
                <div className='bottomRow'>
                    <div className='outputContainer'>
                        <div  ref={outputRef} className='outputRow'>
                            <Output width="100%" height="100%" preserveAspectRatio="xMidYMid meet"
                            {...props}/>
                        </div>

                        <div ref={stripRef} className={`strip ${animate ? "animate" : ""}`}>
                            <Strip width="100%" height="100%" preserveAspectRatio="xMidYMid meet"
                            {...props}/>
                        </div>
                        
                        <div ref={stripRef} className={`strip2 ${animate ? "animate" : ""}`}
                            onClick={() => {setOpen(true)}}>
                                <Strip width="100%" height="100%" preserveAspectRatio="xMidYMid meet"
                                {...props}/>
                        </div>
                     </div>
                    <div className='buttonPressContainer'>
                        <LeverPull
                            stepMs={140}
                            onPulled={async () => {
                                try {
                                    await startCamera();
                                    await takeFourPhotos();
                                    await setAnimate(true);
                                } catch (e) {
                                    console.error(e);
                                    alert("Camera failed. Check permissions/HTTPS.");
                                }
                            }}
                            holdOnFour={true}
                            />
                    </div>

                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    {photos.map((src, i) => (
                        <img className="pre-photo" key={i} src={src} alt={`photo-${i}`} style={{ border: "5px solid #000000ff" }} />
                    ))}
                </div>
                <PhotoStripModal
                    open={open}
                    onClose={() => setOpen(false)}
                    images={photos}                 // pass your 4 captured dataURLs
                    panelWidth={600}                // adjust strip size
                    downloadName="okokokok.png"
                />
            </div>
        </div>
    )
}