import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { motion, Reorder, useDragControls } from 'motion/react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  GripVertical,
  Moon,
  Sun,
} from 'lucide-react';
import { useEffectiveReducedMotion } from '../motion-ui';

// Interaction adaptations of the user's supplied examples. See MOTION-MAP.md.
export function GlassRadioGroup({
  items,
  value,
  onChange,
  label,
}: {
  items: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  label: string;
}) {
  const id = useId();
  return (
    <div
      className="glass-radio-group"
      role="group"
      aria-label={label}
      style={
        {
          '--segments': items.length,
          '--selected': Math.max(
            0,
            items.findIndex((item) => item.id === value),
          ),
        } as React.CSSProperties
      }
    >
      {items.map((item) => (
        <label key={item.id} className="glass-option">
          <input
            type="radio"
            name={id}
            value={item.id}
            checked={value === item.id}
            onChange={() => onChange(item.id)}
          />
          <span>{item.label}</span>
        </label>
      ))}
      <span aria-hidden="true" className="glass-glider" />
    </div>
  );
}

export function SkyToggle({
  light,
  onChange,
}: {
  light: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="sky-toggle">
      <input
        type="checkbox"
        aria-label="светлая тема"
        checked={light}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="sky-scene" aria-hidden="true">
        <i className="sky-stars">✦ · ✧</i>
        <i className="sky-clouds" />
        <i className="sky-orb">
          {light ? <Sun size={20} /> : <Moon size={20} />}
        </i>
      </span>
    </label>
  );
}

export type ThemeMode = 'dark' | 'light' | 'system';
export function ThemePreviews({
  value,
  onChange,
}: {
  value: ThemeMode;
  onChange: (mode: ThemeMode) => void;
}) {
  const id = useId();
  return (
    <fieldset className="theme-previews">
      <legend>оформление</legend>
      {(['dark', 'light', 'system'] as const).map((mode, i) => (
        <label key={mode}>
          <input
            type="radio"
            name={id}
            value={mode}
            checked={value === mode}
            onChange={() => onChange(mode)}
          />
          <span
            className={`theme-preview theme-preview-${mode}`}
            aria-hidden="true"
          >
            <i />
            <b />
            <b />
            <b />
            {value === mode && <Check size={15} />}
          </span>
          <span>{['тёмное', 'светлое', 'как в системе'][i]}</span>
        </label>
      ))}
    </fieldset>
  );
}

export function ElasticGallery({
  items,
  onOpen,
}: {
  items: { id: string; title: string; color: string }[];
  onOpen: (id: string) => void;
}) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div className="elastic-gallery" onPointerLeave={() => setActive(null)}>
      {items.map((item, i) => (
        <button
          key={item.id}
          className="elastic-item"
          data-expanded={active === item.id || undefined}
          style={{ '--mood-color': item.color } as React.CSSProperties}
          onPointerEnter={(e) => {
            if (e.pointerType === 'mouse') setActive(item.id);
          }}
          onFocus={() => setActive(item.id)}
          onBlur={() => setActive(null)}
          onClick={() => onOpen(item.id)}
        >
          <span className={`mood-shape mood-shape-${i}`} aria-hidden="true" />
          <strong>{item.title}</strong>
          <span className="elastic-caption">открыть подборку →</span>
        </button>
      ))}
    </div>
  );
}

export function VinylReveal({
  children,
  label,
  playing = false,
}: {
  children: ReactNode;
  label: string;
  playing?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const reduced = useEffectiveReducedMotion();
  return (
    <motion.div
      className="vinyl-reveal"
      data-open={open || undefined}
      onHoverStart={() => setOpen(true)}
      onHoverEnd={() => setOpen(false)}
    >
      <motion.div
        aria-hidden="true"
        className={`reveal-record ${playing ? 'record-playing' : ''}`}
        animate={{
          x: open && !reduced ? '12%' : '0%',
          rotate: open && !reduced ? 180 : 0,
        }}
        transition={{ type: 'spring', stiffness: 80, damping: 15 }}
      >
        <span>{label}</span>
      </motion.div>
      <motion.button
        className="vinyl-front"
        aria-label="показать пластинку"
        aria-pressed={open}
        onFocus={(event) => {
          if (event.currentTarget.matches(':focus-visible')) setOpen(true);
        }}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((s) => !s)}
        animate={{
          x: open && !reduced ? -8 : 0,
          rotate: open && !reduced ? -4 : 0,
        }}
        transition={{ type: 'spring', stiffness: 150, damping: 20 }}
      >
        {children}
      </motion.button>
    </motion.div>
  );
}

export function ScrambleNote({ text }: { text: string }) {
  const reduced = useEffectiveReducedMotion();
  const [display, setDisplay] = useState(text);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );
  function animate() {
    if (reduced) return;
    if (timer.current) clearInterval(timer.current);
    let frame = 0;
    timer.current = setInterval(() => {
      frame++;
      setDisplay(
        [...text]
          .map((letter, i) =>
            i < frame / 2
              ? letter
              : letter === ' '
                ? ' '
                : 'абвгде0123456789'[Math.floor(Math.random() * 16)],
          )
          .join(''),
      );
      if (frame >= text.length * 2) {
        if (timer.current) clearInterval(timer.current);
        timer.current = null;
        setDisplay(text);
      }
    }, 25);
  }
  return (
    <span className="scramble-note" aria-label={text} onPointerEnter={animate}>
      <span aria-hidden="true">{display}</span>
    </span>
  );
}

export function ProfileCard({ children }: { children: ReactNode }) {
  const reduced = useEffectiveReducedMotion();
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  return (
    <motion.div
      className="profile-tilt"
      animate={tilt}
      onPointerMove={(e) => {
        if (reduced || e.pointerType !== 'mouse') return;
        const r = e.currentTarget.getBoundingClientRect();
        setTilt({
          rotateX: (-(e.clientY - r.top - r.height / 2) / r.height) * 8,
          rotateY: ((e.clientX - r.left - r.width / 2) / r.width) * 8,
        });
      }}
      onPointerLeave={() => setTilt({ rotateX: 0, rotateY: 0 })}
      transition={{ type: 'spring', stiffness: 250, damping: 22 }}
    >
      {children}
    </motion.div>
  );
}

type Playlist = { id: string; title: string; color: string };
function SortItem({
  item,
  index,
  total,
  move,
}: {
  item: Playlist;
  index: number;
  total: number;
  move: (index: number, direction: number) => void;
}) {
  const controls = useDragControls();
  const reduced = useEffectiveReducedMotion();
  return (
    <Reorder.Item
      value={item.id}
      className="sort-playlist"
      dragListener={false}
      dragControls={controls}
      transition={
        reduced
          ? { duration: 0 }
          : { type: 'spring', duration: 0.38, bounce: 0.16 }
      }
      whileDrag={reduced ? undefined : { scale: 1.03, zIndex: 2 }}
    >
      <button
        className="sort-handle icon-button"
        aria-label={`перетащить ${item.title}; alt и стрелки меняют порядок`}
        onPointerDown={(e) => controls.start(e)}
        onKeyDown={(e) => {
          if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
            e.preventDefault();
            move(index, e.key === 'ArrowUp' ? -1 : 1);
          }
        }}
      >
        <GripVertical size={20} />
      </button>
      <span className="sort-art" style={{ background: item.color }} />
      <strong>{item.title}</strong>
      <button
        className="icon-button"
        aria-label={`поднять ${item.title}`}
        disabled={index === 0}
        onClick={() => move(index, -1)}
      >
        <ArrowUp size={18} />
      </button>
      <button
        className="icon-button"
        aria-label={`опустить ${item.title}`}
        disabled={index === total - 1}
        onClick={() => move(index, 1)}
      >
        <ArrowDown size={18} />
      </button>
    </Reorder.Item>
  );
}

export function PlaylistOrder({
  items,
  render,
  onNotice,
}: {
  items: Playlist[];
  render: (id: string) => ReactNode;
  onNotice: (text: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [order, setOrder] = useState<string[]>(() => {
    const ids = items.map((p) => p.id);
    try {
      const saved: unknown = JSON.parse(
        localStorage.getItem('music-playlist-order') ?? 'null',
      );
      return Array.isArray(saved) &&
        saved.length === ids.length &&
        new Set(saved).size === ids.length &&
        saved.every((id) => ids.includes(id))
        ? saved
        : ids;
    } catch {
      return ids;
    }
  });
  function update(next: string[]) {
    setOrder(next);
    try {
      localStorage.setItem('music-playlist-order', JSON.stringify(next));
    } catch {
      onNotice('порядок сохранён только до закрытия вкладки');
    }
  }
  function move(index: number, direction: number) {
    const next = [...order],
      target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    update(next);
    onNotice(`позиция ${target + 1} из ${next.length}`);
  }
  return (
    <>
      <div className="order-toolbar">
        <p className="secondary">твои подборки</p>
        <button
          className="text-button"
          aria-pressed={editing}
          onClick={() => setEditing((s) => !s)}
        >
          {editing ? 'готово' : 'изменить порядок'}
        </button>
      </div>
      {editing ? (
        <Reorder.Group
          axis="y"
          values={order}
          onReorder={update}
          className="playlist-sort"
          aria-label="порядок плейлистов"
        >
          {order.map((id, index) => (
            <SortItem
              key={id}
              item={items.find((p) => p.id === id)!}
              index={index}
              total={order.length}
              move={move}
            />
          ))}
        </Reorder.Group>
      ) : (
        <div className="playlist-grid">
          {order.map((id) => (
            <div key={id}>{render(id)}</div>
          ))}
        </div>
      )}
    </>
  );
}
