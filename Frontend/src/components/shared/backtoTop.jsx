import { useEffect, useState } from "react";

const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() =>
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
      style={{
        position: "fixed",
        bottom: "30px",
        right:"100px",
        padding: "10px 25px",
        fontSize: "25px",
        borderRadius: "6px",
        border: "none",
        backgroundColor: "var(--color-purple-500)",
        color: "#fff",
        cursor: "pointer",
        zIndex: 1000,
        borderRadius:"50%"
      }}
      aria-label="Back to top"
    >
      ↑
    </button>
  );
};

export default BackToTop;
