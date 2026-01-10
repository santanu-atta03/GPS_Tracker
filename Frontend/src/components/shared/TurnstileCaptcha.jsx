import { useEffect, useRef } from "react";

const TurnstileCaptcha = ({ onVerify }) => {
  const ref = useRef(null);
const SITE_KEY =
  window.location.hostname === "localhost"
    ? "0x4AAAAAACLpDPvIpoBRPbMe"
    : "0x4AAAAAACLoq3Wk-omggzWD";

  useEffect(() => {
    if (!window.turnstile) return;

    const widgetId = window.turnstile.render(ref.current, {
      sitekey: SITE_KEY,
      callback: (token) => {
        onVerify(token);
      },
    });

    return () => {
      if (window.turnstile) {
        window.turnstile.remove(widgetId);
      }
    };
  }, []);

  return <div ref={ref}></div>;
};

export default TurnstileCaptcha;
