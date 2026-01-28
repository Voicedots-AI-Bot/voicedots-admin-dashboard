import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  MoreHorizontal,
} from "lucide-react";
import WaveSurfer from "wavesurfer.js";

interface ConversationAudioPlayerProps {
  audioUrl: string;
}

export function ConversationAudioPlayer({
  audioUrl,
}: ConversationAudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const waveRef = useRef<WaveSurfer | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    waveRef.current?.destroy();

    waveRef.current = WaveSurfer.create({
      container: containerRef.current,
      height: 36,
      waveColor: "#D1D5DB",
      progressColor: "#111827",
      cursorColor: "#111827",
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      normalize: true,

      // 🔑 THIS IS CRITICAL
      fetchParams: {
        mode: "cors",
      },
    });

    waveRef.current.load(audioUrl);

    waveRef.current.on("ready", () => {
      setDuration(waveRef.current!.getDuration());
      setReady(true);
    });

    waveRef.current.on("timeupdate", () => {
      setCurrent(waveRef.current!.getCurrentTime());
    });

    waveRef.current.on("finish", () => {
      setPlaying(false);
    });

    return () => {
      waveRef.current?.destroy();
    };
  }, [audioUrl]);

  const togglePlay = async () => {
    if (!waveRef.current || !ready) return;
    await waveRef.current.playPause();
    setPlaying(waveRef.current.isPlaying());
  };

  const rewind = () => waveRef.current?.skip(-5);
  const forward = () => waveRef.current?.skip(5);

  const format = (t: number) =>
    `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

  return (
    <div className="w-[420px]">
      <div
        ref={containerRef}
        className="mb-2 w-full"
        style={{ minHeight: 36 }}
      />

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            disabled={!ready}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black text-white disabled:opacity-40"
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>

          <span className="font-medium">1.0x</span>

          <button onClick={rewind} className="opacity-70">
            <RotateCcw size={14} />
          </button>

          <button onClick={forward} className="opacity-70">
            <RotateCw size={14} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span>
            {format(current)} / {format(duration)}
          </span>
          <MoreHorizontal size={14} className="opacity-60" />
        </div>
      </div>
    </div>
  );
}
