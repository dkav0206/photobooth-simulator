import './home.css'
import Phototemplate from '../assets/Phototemplate.svg?react'
import Curtain from '../assets/Curtain.svg?react'
import Discount from '../assets/Discount.svg?react'
import K from '../assets/K.svg?react'
import R from '../assets/R.svg?react'
import PhotoButton from '../assets/Button.svg?react'
import { useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";

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


export default function Home(props) { 
    const navigate = useNavigate();
    const photoRef = useRef(null);
    const curtainRef = useRef(null);
    const discountRef = useRef(null);
    const KRef = useRef(null);
    const RRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        const makeWiggly = (host) => {
        if (!host) return;
        const svg = host.tagName?.toLowerCase() === "svg" ? host : host.querySelector("svg");
        if (svg) applyWiggle(svg);
        };

        makeWiggly(photoRef.current);
        makeWiggly(curtainRef.current);
        makeWiggly(discountRef.current);
        makeWiggly(KRef.current);
        makeWiggly(RRef.current);
        makeWiggly(buttonRef.current);
    }, []);




    return(
        <div className="container">
            <div className='photoContainer'>
                <div ref={photoRef} className='photobooth'>
                    <Phototemplate  width="100%" height="100%" preserveAspectRatio="xMidYMid meet"
                    {...props}/>
                 </div>
                
                 <div  ref={discountRef} className='discount'>
                    <Discount width="100%" height="100%" preserveAspectRatio="xMidYMid meet"
                    {...props}/>
                 </div>
                 <div  ref={KRef} className='Khoa'>
                    <K width="100%" height="100%" preserveAspectRatio="xMidYMid meet"
                    {...props}/>
                 </div>
                 <div ref={RRef} className='Rachel'>
                    <R width="100%" height="100%" preserveAspectRatio="xMidYMid meet"
                    {...props}/>
                 </div>
                 <div ref={buttonRef} className='photoButton' onClick={() => navigate("/photobooth-simulator/photo")}>
                    <PhotoButton width="100%" height="100%" preserveAspectRatio="xMidYMid meet"
                    {...props}/>
                 </div>

                  <div  ref={curtainRef} className='curtain'>
                    <Curtain width="100%" height="100%" preserveAspectRatio="xMidYMid meet"
                    {...props}/>
                 </div>
            </div>
        </div>
    )
}