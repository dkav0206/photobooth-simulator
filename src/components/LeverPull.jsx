// LeverPull.jsx (Vite + SVGR imports shown; adjust to your setup)
import Lever1 from "../assets/lever1.svg?react";
import Lever2 from "../assets/lever2.svg?react";
import Lever3 from "../assets/lever3.svg?react";
import Lever4 from "../assets/lever4.svg?react";
import './leverpull.css'
import { useEffect, useRef, useState } from "react";

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


export default function LeverPull({
    onPulled,         // function to call after frame 4
    stepMs = 120,     // time between frames
    holdOnFour = false, // if true, stays on frame 4 instead of resetting to 1
    className = "",
    props,
    }) {
    const frames = [Lever1, Lever2, Lever3, Lever4];
    const [frame, setFrame] = useState(0); // 0..3
    const [disabled, setDisabled] = useState(false); // track button state
    const animating = useRef(false);
    const timeouts = useRef([]);
    const frameRef = useRef(null);

    function clearAll() {
        timeouts.current.forEach(clearTimeout);
        timeouts.current = [];
    }

    const playSequence = () => {
        if (animating.current) return;
        animating.current = true;
        setDisabled(true); // disable immediately after click

        // advance to 2,3,4 automatically
        for (let i = 1; i < frames.length; i++) {
        timeouts.current.push(
            setTimeout(() => setFrame(i), i * stepMs)
        );
        }

        // after last frame -> fire callback -> reset (optional)
        timeouts.current.push(
        setTimeout(() => {
            try { onPulled && onPulled(); } finally {
            if (!holdOnFour) setFrame(0);
            animating.current = false;
            clearAll();
            }
        }, frames.length * stepMs)
        );
    };

    const Frame = frames[frame];

    useEffect(() => {
        const makeWiggly = (host) => {
        if (!host) return;
        const svg = host.tagName?.toLowerCase() === "svg" ? host : host.querySelector("svg");
        if (svg) applyWiggle(svg);
        };

        makeWiggly(frameRef.current);
    }, []);



    return (
        <button
        type="button"
        onClick={playSequence}
        disabled={disabled} // disable interaction
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && playSequence()}
        aria-label="Pull lever"
        className='frame'
        style={{ lineHeight: 0 }}
        ref={frameRef}
        >
        <Frame width="100%" height="100%" preserveAspectRatio="xMidYMid meet" />
        </button>
    );
    }
