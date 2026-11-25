"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/Language";

function clock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  const minutes = Math.floor(whole / 60);
  const rest = whole % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

export function EssayAudio({ slug, title }: { slug: string; title: string }) {
  const { lang } = useLanguage();
  const audioRef = useRef<HTMLAudioElement>(null);
  const seeking = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);

  const src = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/audio/${slug}.mp3`;
  const bn = lang === "bn";

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const syncDuration = () => {
      if (Number.isFinite(audio.duration)) setDuration(audio.duration);
    };
    const syncTime = () => {
      if (!seeking.current) setCurrent(audio.currentTime);
    };
    syncDuration();
    audio.addEventListener("loadedmetadata", syncDuration);
    audio.addEventListener("durationchange", syncDuration);
    audio.addEventListener("timeupdate", syncTime);
    return () => {
      audio.removeEventListener("loadedmetadata", syncDuration);
      audio.removeEventListener("durationchange", syncDuration);
      audio.removeEventListener("timeupdate", syncTime);
    };
  }, [src]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setError(true);
      }
    } else {
      audio.pause();
    }
  };

  return (
    <div className="listen">
      <button
        type="button"
        className="play"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? (bn ? "বিরতি" : "Pause") : bn ? `${title} শুনুন` : `Play ${title}`}
      >
        {playing ? (bn ? "বিরতি" : "Pause") : bn ? "শুনুন" : "Play"}
      </button>
      <div className="listen-main">
        <p className="kicker">{bn ? "প্রবন্ধের ইংরেজি পাঠ" : "Listen · English reading"}</p>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={Math.min(current, duration || 0)}
          aria-label={bn ? "শোনার অগ্রগতি" : "Playback progress"}
          disabled={error || !duration}
          onPointerDown={() => {
            seeking.current = true;
          }}
          onPointerUp={() => {
            seeking.current = false;
          }}
          onChange={(event) => {
            const next = Number(event.target.value);
            setCurrent(next);
            if (audioRef.current) audioRef.current.currentTime = next;
          }}
        />
      </div>
      <span className="time">
        {clock(current)} / {clock(duration)}
      </span>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setCurrent(duration);
        }}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => {
          if (!seeking.current) setCurrent(event.currentTarget.currentTime);
        }}
        onError={() => setError(true)}
      />
      {error ? <p className="listen-error">{bn ? "অডিও এখন চালানো যাচ্ছে না।" : "The reading could not be played."}</p> : null}
    </div>
  );
}
