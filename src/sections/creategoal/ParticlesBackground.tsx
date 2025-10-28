// src/components/ParticlesBackground.jsx

import React, { useCallback } from "react";
import Particles from "react-tsparticles";
// IMPORTANT: For the "bubbles" preset specifically, loadBubblesPreset is used.
// If you were just using generic particles with bubble shapes, you'd use loadFull.
import { loadBubblesPreset } from "tsparticles-preset-bubbles";

const ParticlesBackground = () => {
  const particlesInit = useCallback(async (engine) => {
    // This loads the preset for the engine.
    // If you want to use the "bubbles" preset in your options, this line is required.
    await loadBubblesPreset(engine);
  }, []);

  const particlesOptions = {
    fullScreen: { enable: false, zIndex: -1 }, // Managed by component's fixed inset-0
    background: {
      color: { value: "transparent" }, // Allow main component's gradient to show
    },
    // Use the "bubbles" preset as a base
    preset: "bubbles", 

    // Customizations to make them LOTS and BIGGER
    particles: {
      // Significantly increase the number of bubbles
      number: { 
        value: 150, // From 30 to 150 - many more bubbles
        density: { enable: true, area: 1000 } // Adjust area for density distribution
      },
      // Define a range of colors for a richer look
      color: { 
        value: ["#8b5cf6", "#a78bfa", "#c4b5fd", "#e0e7ff", "#ffffff"] // Array of purples, indigos, whites
      },
      // Adjust opacity for subtlety, still random
      opacity: { 
        value: 0.15, // Slightly less opaque overall
        random: true, 
        anim: { enable: true, speed: 0.3, opacity_min: 0.05, sync: false } // Slower, more subtle fade
      },
      // Increase default size and randomize it more
      size: { 
        value: { min: 8, max: 25 }, // Bubbles will range from 8px to 25px
        random: true, 
        anim: { enable: true, speed: 0.5, size_min: 5, sync: false } // Slower size animation
      },
      // Movement for an elegant rising/floating effect
      move: {
        direction: "top", // Gentle upward movement
        enable: true,
        speed: 0.15, // VERY slow movement for a calm, mesmerizing effect
        random: true,
        straight: false,
        outModes: { default: "out" },
        warp: true, // Allows particles to wrap around the screen edges
      },
      // Add a slight "wobble"
      wobble: {
        enable: true,
        distance: 5, // How far they wobble
        speed: 0.5, // How fast they wobble
      },
      // Optional: Enhance the bubble appearance further
      collisions: {
        enable: false, // Usually want bubbles to pass through each other
      },
      stroke: {
        width: 0, // No border for a softer look
      },
    },
    // Mouse Interaction: Keep a subtle hover effect if desired
    interactivity: {
      events: {
        onHover: { enable: true, mode: "bubble", parallax: { enable: true, smooth: 10, factor: 5 } }, // Adds parallax on hover
        onClick: { enable: false }, // No click interaction
      },
      modes: {
        bubble: { distance: 150, size: 30, duration: 2, opacity: 0.6, divs: { enable: false } }, // Bigger hover bubble
        repulse: { distance: 100, duration: 0.4 }, // Option for repulse if you want to push them away
      }
    },
    detectRetina: true, // Optimize for high-DPI screens
  };

  return (
    <Particles
      id="tsparticles-background"
      init={particlesInit}
      options={particlesOptions}
      className="fixed inset-0 z-0" // Ensure it's fixed and at the bottom layer
    />
  );
};

export default ParticlesBackground;