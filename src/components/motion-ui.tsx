/**
 * Adapted animation mechanisms from Motion Primitives and Arc components
 * published on 21st.dev. See ../../THIRD_PARTY_NOTICES.md for source links
 * and MIT notices. Native controls and dialog/scroll lifecycles are local
 * adaptations, rather than verbatim upstream implementations.
 */
import {
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  createContext,
  useContext,
} from 'react';
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  type MotionValue,
  useIsPresent,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';

const morphSpring = { type: 'spring' as const, stiffness: 340, damping: 34 };
const dockSpring = { mass: 0.1, stiffness: 150, damping: 12 };
const enterEase = [0.16, 1, 0.3, 1] as const;

const MotionPreferencesContext = createContext(false);
export function MotionPreferences({
  reduced,
  children,
}: {
  reduced: boolean;
  children: ReactNode;
}) {
  return (
    <MotionPreferencesContext.Provider value={reduced}>
      {children}
    </MotionPreferencesContext.Provider>
  );
}
export function useEffectiveReducedMotion() {
  const setting = useContext(MotionPreferencesContext);
  const system = useReducedMotion();
  return setting || Boolean(system);
}

type DockItem = { id: string; label: string; icon: ReactNode };

function SpringDockItem({
  item,
  active,
  onChange,
  mouseX,
  reduced,
}: {
  item: DockItem;
  active: boolean;
  onChange: (id: string) => void;
  mouseX: MotionValue<number>;
  reduced: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  // One shared pointer value drives the same distance-based falloff as
  // Motion Primitives' dock, using viewport coordinates consistently.
  const distance = useTransform(mouseX, (x) => {
    const rect = ref.current?.getBoundingClientRect();
    return rect ? x - rect.left - rect.width / 2 : Infinity;
  });
  const targetWidth = useTransform(distance, [-140, 0, 140], [48, 70, 48]);
  const width = useSpring(targetWidth, dockSpring);

  return (
    <motion.button
      ref={ref}
      type="button"
      className="dock-item"
      data-active={active || undefined}
      aria-current={active ? 'page' : undefined}
      aria-label={item.label}
      onClick={() => onChange(item.id)}
      style={{ width: reduced ? 48 : width, flexShrink: 0 }}
      whileTap={reduced ? undefined : { scale: 0.94 }}
    >
      <span aria-hidden="true" className="dock-icon">
        {item.icon}
      </span>
      <span className="dock-label">{item.label}</span>
    </motion.button>
  );
}

export function SpringDock({
  items,
  active,
  onChange,
  className,
}: {
  items: DockItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  const mouseX = useMotionValue(Infinity);
  const reduced = useEffectiveReducedMotion();

  useEffect(() => {
    if (reduced) mouseX.set(Infinity);
  }, [mouseX, reduced]);

  return (
    <nav
      className={['spring-dock', className].filter(Boolean).join(' ')}
      aria-label="основная навигация"
      onPointerMove={(event) => {
        if (!reduced && event.pointerType === 'mouse') {
          mouseX.set(event.clientX);
        }
      }}
      onPointerLeave={() => mouseX.set(Infinity)}
    >
      {items.map((item) => (
        <SpringDockItem
          key={item.id}
          item={item}
          active={active === item.id}
          onChange={onChange}
          mouseX={mouseX}
          reduced={reduced}
        />
      ))}
    </nav>
  );
}

export function AnimatedTabs({
  items,
  value,
  onChange,
  id,
}: {
  items: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  id?: string;
}) {
  const instanceId = useId();
  const groupId = id ?? instanceId;
  const reduced = useEffectiveReducedMotion();
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const focusId = items.some((item) => item.id === value)
    ? value
    : items[0]?.id;

  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex: number;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % items.length;
    else if (event.key === 'ArrowLeft') {
      nextIndex = (index - 1 + items.length) % items.length;
    } else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = items.length - 1;
    else return;

    event.preventDefault();
    const next = items[nextIndex];
    if (!next) return;
    onChange(next.id);
    buttons.current.get(next.id)?.focus();
  }

  return (
    <LayoutGroup id={groupId}>
      <div
        className="animated-tabs"
        role="tablist"
        aria-label="категории музыки"
      >
        {items.map((item, index) => (
          <button
            key={item.id}
            ref={(node) => {
              if (node) buttons.current.set(item.id, node);
              else buttons.current.delete(item.id);
            }}
            id={`${groupId}-tab-${item.id}`}
            type="button"
            role="tab"
            className="tab-item"
            aria-selected={value === item.id}
            tabIndex={focusId === item.id ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {value === item.id && (
              <motion.span
                className="tab-indicator"
                layoutId="selection"
                transition={reduced ? { duration: 0 } : morphSpring}
                aria-hidden="true"
              />
            )}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </LayoutGroup>
  );
}

export function MotionDialog({
  open,
  onClose,
  title,
  children,
  id,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  id: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const openRef = useRef(open);
  const [visible, setVisible] = useState(false);
  const reduced = useEffectiveReducedMotion();
  const titleId = `${id}-title`;

  useLayoutEffect(() => {
    openRef.current = open;
    const node = dialog.current;
    if (!node) return;
    if (open) {
      if (!node.open) {
        opener.current =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        node.showModal();
      }
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [open]);

  function finishClosing() {
    if (openRef.current) return;
    dialog.current?.close();
    if (opener.current?.isConnected)
      opener.current.focus({ preventScroll: true });
  }

  return (
    <dialog
      ref={dialog}
      id={id}
      className="motion-dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        // Keep the native modal/focus trap active until its exit finishes.
        event.preventDefault();
        onClose();
      }}
      onClose={() => {
        if (openRef.current) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <AnimatePresence initial={false} onExitComplete={finishClosing}>
        {visible && (
          <motion.div
            key={id}
            className="dialog-surface"
            initial={
              reduced
                ? false
                : { opacity: 0, y: 16, scale: 0.95, filter: 'blur(4px)' }
            }
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.98 }}
            transition={
              reduced ? { duration: 0 } : { duration: 0.2, ease: enterEase }
            }
          >
            <div className="dialog-heading">
              <h2 id={titleId}>{title}</h2>
              <button
                type="button"
                className="dialog-close"
                onClick={onClose}
                aria-label="закрыть окно"
                autoFocus
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </dialog>
  );
}

export function AlbumRail({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const gesture = useRef<{
    pointerId: number;
    startX: number;
    startScroll: number;
    dragging: boolean;
  } | null>(null);
  const suppressClick = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [edges, setEdges] = useState({ previous: false, next: false });
  const reduced = useEffectiveReducedMotion();
  const trackId = useId();

  const updateEdges = useCallback(() => {
    const node = track.current;
    if (!node) return;
    const max = Math.max(0, node.scrollWidth - node.clientWidth);
    const next = {
      previous: node.scrollLeft > 1,
      next: node.scrollLeft < max - 1,
    };
    setEdges((current) =>
      current.previous === next.previous && current.next === next.next
        ? current
        : next,
    );
  }, []);

  useLayoutEffect(() => {
    const node = track.current;
    if (!node) return;
    const observer = new ResizeObserver(updateEdges);
    observer.observe(node);
    Array.from(node.children).forEach((child) => observer.observe(child));
    node.addEventListener('scroll', updateEdges, { passive: true });
    updateEdges();
    return () => {
      observer.disconnect();
      node.removeEventListener('scroll', updateEdges);
    };
  }, [children, updateEdges]);

  function scroll(direction: number) {
    const node = track.current;
    if (!node) return;
    node.scrollBy({
      left: direction * node.clientWidth * 0.8,
      behavior: reduced ? 'instant' : 'smooth',
    });
  }

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    // Touch and pen retain native scrolling. Mouse clicks still activate
    // cards unless the pointer actually crosses the drag threshold.
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    if (
      event.target instanceof Element &&
      event.target.closest("input, textarea, select, [contenteditable='true']")
    )
      return;
    const node = event.currentTarget;
    suppressClick.current = false;
    if (node.scrollWidth <= node.clientWidth) return;
    gesture.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScroll: node.scrollLeft,
      dragging: false,
    };
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const delta = event.clientX - current.startX;
    if (!current.dragging && Math.abs(delta) < 6) return;
    if (!current.dragging) {
      current.dragging = true;
      suppressClick.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
    }
    event.preventDefault();
    event.currentTarget.scrollLeft = current.startScroll - delta;
  }

  function finishDrag(event: PointerEvent<HTMLDivElement>) {
    if (gesture.current?.pointerId !== event.pointerId) return;
    gesture.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <section className="album-rail" aria-label={label}>
      <div className="rail-arrows">
        <button
          type="button"
          disabled={!edges.previous}
          aria-label={`${label}: предыдущие альбомы`}
          aria-controls={trackId}
          onClick={() => scroll(-1)}
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          disabled={!edges.next}
          aria-label={`${label}: следующие альбомы`}
          aria-controls={trackId}
          onClick={() => scroll(1)}
        >
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
      <div
        ref={track}
        id={trackId}
        className="rail-track"
        data-dragging={dragging || undefined}
        tabIndex={0}
        role="group"
        aria-label={label}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onLostPointerCapture={finishDrag}
        onPointerLeave={(event) => {
          if (!gesture.current?.dragging) finishDrag(event);
        }}
        onDragStart={(event) => event.preventDefault()}
        onClickCapture={(event) => {
          if (suppressClick.current && event.detail > 0) {
            event.preventDefault();
            event.stopPropagation();
            suppressClick.current = false;
          }
        }}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            scroll(event.key === 'ArrowLeft' ? -1 : 1);
          }
        }}
      >
        {children}
      </div>
    </section>
  );
}

function PageSurface({
  children,
  reduced,
}: {
  children: ReactNode;
  reduced: boolean;
}) {
  const present = useIsPresent();
  return (
    <motion.div
      className="page-transition"
      inert={!present}
      aria-hidden={!present || undefined}
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
      transition={
        reduced ? { duration: 0 } : { duration: 0.2, ease: enterEase }
      }
    >
      {children}
    </motion.div>
  );
}

export function PageTransition({
  page,
  children,
}: {
  page: string;
  children: ReactNode;
}) {
  const reduced = useEffectiveReducedMotion();
  return (
    <AnimatePresence initial={false} mode="wait">
      <PageSurface key={page} reduced={reduced}>
        {children}
      </PageSurface>
    </AnimatePresence>
  );
}
