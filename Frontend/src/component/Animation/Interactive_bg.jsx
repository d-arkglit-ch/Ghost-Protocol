/* eslint-disable no-unused-vars */
import React from 'react'
import  {motion , useMotionValue, useTransform , useSpring} from 'framer-motion';

function Interactive_bg() {

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Create smoothed motion (spring)
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 50 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 50 });

  // Slight parallax translation
  const translateX = useTransform(smoothX, [0, window.innerWidth], [-50, 50]);
  const translateY = useTransform(smoothY, [0, window.innerHeight], [-50, 50]);

  // Mouse move handler
  const handleMouseMove = (e) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };
  return (
    <div
    onMouseMove={handleMouseMove} className='absolute inset-0 overflow-hidden'>
         <motion.div
        style={{ x: translateX, y: translateY }}
        className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-blue-500 to-pink-500 opacity-30 blur-3xl top-[-10%] left-[-10%]"
      />
      <motion.div
        style={{ x: translateX, y: translateY }}
        className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 opacity-30 blur-3xl bottom-[-10%] right-[-10%]"
      />
    </div>
  )
}

export default Interactive_bg