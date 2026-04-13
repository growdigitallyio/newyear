import { useRef, useState, useEffect } from "react";

export default function MusicPlayer() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);

  useEffect(() => {
    setShowGreeting(true);
  }, []);

  const playFromGreeting = async () => {
    if (!audioRef.current) return;

    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.log("Playback blocked");
    } finally {
      setShowGreeting(false);
    }
  };

  // BUTTON TOGGLE
  const toggleMusic = async () => {
    const audio = audioRef.current;

    if (!audio) return;

    if (audio.paused) {
      await audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  return (
    <>
      {showGreeting && (
        <div className="newyear-greeting-overlay" role="dialog" aria-modal="true" aria-label="New Year Greeting">
          <div className="newyear-greeting-card">
            <h2 className="newyear-greeting-title">සුභ සිංහල දෙමළ අලුත් අවුරුද්දක් වේවා 2026</h2>
            <button className="newyear-greeting-button" onClick={playFromGreeting}>
              එසේම වේවා
            </button>
          </div>
        </div>
      )}

      <audio ref={audioRef} loop preload="auto">
        <source src="/music/background.mp3" type="audio/mp3" />
      </audio>

      <button
        onClick={toggleMusic}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          border: "none",
          background: "#111",
          color: "#fff",
          fontSize: "20px",
          cursor: "pointer",
          zIndex: 9999,
        }}
      >
        {isPlaying ? "🔊" : "🔇"}
      </button>
    </>
  );
}