import { useCallback, useEffect, useRef, useState } from 'react';
import { getTrack } from '../lib/catalog';

export function useDemoAudio(
  trackId: string,
  onEnd: () => void,
  selectionKey = 0,
) {
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [volume, setVolume] = useState(35);
  const [error, setError] = useState('');
  const context = useRef<AudioContext | null>(null);
  const gain = useRef<GainNode | null>(null);
  const nodes = useRef<OscillatorNode[]>([]);
  const noteTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const ticker = useRef<ReturnType<typeof setInterval> | null>(null);
  const request = useRef(0);
  const positionRef = useRef(0);
  const currentId = useRef(trackId);
  const currentSelection = useRef(selectionKey);
  const running = useRef(false);
  const end = useRef(onEnd);
  end.current = onEnd;
  const volumeRef = useRef(volume);
  volumeRef.current = volume;
  const stopNotes = useCallback(() => {
    if (noteTimer.current) clearInterval(noteTimer.current);
    noteTimer.current = null;
    nodes.current.forEach((n) => {
      try {
        n.stop();
      } catch {
        /* already stopped */
      }
    });
    nodes.current = [];
  }, []);
  const pause = useCallback(() => {
    request.current++;
    running.current = false;
    stopNotes();
    if (ticker.current) clearInterval(ticker.current);
    ticker.current = null;
    setPlaying(false);
  }, [stopNotes]);
  const startNotes = useCallback(() => {
    stopNotes();
    let beat = Math.floor(positionRef.current * 2);
    const note = () => {
      const c = context.current,
        g = gain.current;
      if (!c || !g) return;
      const track = getTrack(currentId.current),
        t = c.currentTime;
      const oscillator = c.createOscillator(),
        envelope = c.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.value = track.notes[beat % 4];
      envelope.gain.setValueAtTime(0, t);
      envelope.gain.linearRampToValueAtTime(0.12, t + 0.03);
      envelope.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      oscillator.connect(envelope);
      envelope.connect(g);
      oscillator.start(t);
      oscillator.stop(t + 0.6);
      nodes.current.push(oscillator);
      oscillator.onended = () => {
        nodes.current = nodes.current.filter((n) => n !== oscillator);
        oscillator.disconnect();
        envelope.disconnect();
      };
      beat++;
    };
    note();
    noteTimer.current = setInterval(note, 500);
  }, [stopNotes]);
  const start = useCallback(async () => {
    if (running.current) return;
    const ticket = ++request.current;
    try {
      if (!context.current) {
        const Audio = window.AudioContext;
        if (!Audio) throw new Error('audio unsupported');
        context.current = new Audio();
        gain.current = context.current.createGain();
        gain.current.connect(context.current.destination);
      }
      await context.current.resume();
      if (ticket !== request.current) return;
      if (context.current.state !== 'running')
        throw new Error('audio suspended');
      gain.current!.gain.value = volumeRef.current / 100;
      if (positionRef.current >= getTrack(currentId.current).duration) {
        positionRef.current = 0;
        setPosition(0);
      }
      running.current = true;
      setPlaying(true);
      setError('');
      startNotes();
      if (ticker.current) clearInterval(ticker.current);
      ticker.current = setInterval(() => {
        positionRef.current = Math.min(
          getTrack(currentId.current).duration,
          positionRef.current + 0.25,
        );
        setPosition(positionRef.current);
        if (positionRef.current >= getTrack(currentId.current).duration) {
          pause();
          end.current();
        }
      }, 250);
    } catch {
      if (ticket !== request.current) return;
      pause();
      setError(
        'звук недоступен. проверь настройки браузера и попробуй ещё раз.',
      );
    }
  }, [pause, startNotes]);
  const seek = useCallback(
    (value: number) => {
      positionRef.current = Math.max(
        0,
        Math.min(getTrack(currentId.current).duration, value),
      );
      setPosition(positionRef.current);
      if (running.current) startNotes();
    },
    [startNotes],
  );
  const play = useCallback(() => {
    if (running.current) {
      pause();
      return Promise.resolve();
    }
    return start();
  }, [pause, start]);
  useEffect(() => {
    if (
      currentId.current === trackId &&
      currentSelection.current === selectionKey
    )
      return;
    pause();
    currentId.current = trackId;
    currentSelection.current = selectionKey;
    seek(0);
  }, [trackId, selectionKey, pause, seek]);
  useEffect(() => {
    if (gain.current) gain.current.gain.value = volume / 100;
  }, [volume]);
  useEffect(
    () => () => {
      request.current++;
      stopNotes();
      if (ticker.current) clearInterval(ticker.current);
      if (context.current) {
        void context.current.close();
        context.current = null;
      }
    },
    [stopNotes],
  );
  return {
    playing,
    position,
    volume,
    error,
    play,
    start,
    pause,
    seek,
    setVolume,
  };
}
