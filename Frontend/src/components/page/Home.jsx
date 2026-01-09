import React, { useEffect } from "react";
import BusSearch from "./BusSearch";
import SupportPopover from "./SupportPopover";

const Home = () => {
  useEffect(() => {
    // Inject styles
    const style = document.createElement("style");
    style.innerHTML = `
      .circle-container {
        position: fixed;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 9999;
      }

      .circle {
        position: absolute;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: rgba(0, 255, 120, 0.8);
        box-shadow: 0 0 12px rgba(0, 255, 120, 0.6);
        transform-origin: center;
      }
    `;
    document.head.appendChild(style);

    // Create container
    const container = document.createElement("div");
    container.className = "circle-container";
    document.body.appendChild(container);

    // Create circles
    const circleCount = 30;
    const circles = [];

    for (let i = 0; i < circleCount; i++) {
      const circle = document.createElement("div");
      circle.className = "circle";
      circle.x = 0;
      circle.y = 0;
      container.appendChild(circle);
      circles.push(circle);
    }

    const coords = { x: 0, y: 0 };

    const handleMouseMove = (e) => {
      coords.x = e.clientX;
      coords.y = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const animateCircles = () => {
      let x = coords.x;
      let y = coords.y;

      circles.forEach((circle, index) => {
        circle.style.left = `${x - 12}px`;
        circle.style.top = `${y - 12}px`;
        circle.style.transform = `scale(${(circles.length - index) / circles.length})`;

        const nextCircle = circles[index + 1] || circles[0];
        circle.x = x;
        circle.y = y;

        x += (nextCircle.x - x) * 0.3;
        y += (nextCircle.y - y) * 0.3;
      });

      requestAnimationFrame(animateCircles);
    };

    animateCircles();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.head.removeChild(style);
      container.remove();
    };
  }, []);

  return (
    <>
      <BusSearch />
      <SupportPopover />
    </>
  );
};

export default Home;
