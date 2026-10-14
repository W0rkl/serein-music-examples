import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Shuffle } from 'lucide-react';
import { useEffectiveReducedMotion } from '../motion-ui';
import type { Album } from '../../lib/catalog';

export function ShuffleLauncher({
  covers,
  selection,
  picked,
  onPick,
}: {
  covers: Album[];
  selection: number;
  picked: boolean;
  onPick: () => void;
}) {
  const reduced = useEffectiveReducedMotion();
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="shuffle-launcher" data-expanded={expanded || undefined}>
      <div className="shuffle-sleeves" aria-hidden="true">
        {covers.map((cover, i) => (
          <motion.div
            className="shuffle-sleeve"
            key={`${selection}-${i}`}
            style={{ backgroundColor: cover.color }}
            initial={reduced ? false : { y: 34, rotate: 0, opacity: 0 }}
            animate={{
              x: (i - 1) * (expanded && !reduced ? 90 : 65),
              y: expanded && !reduced ? -24 : 0,
              rotate: (i - 1) * (expanded && !reduced ? 19 : 12),
              opacity: 1,
            }}
            transition={
              reduced
                ? { duration: 0 }
                : {
                    type: 'spring',
                    stiffness: 160,
                    damping: 18,
                    delay: i * 0.04,
                  }
            }
          >
            <img
              src={cover.image}
              alt=""
              onError={(e) => {
                e.currentTarget.style.visibility = 'hidden';
              }}
            />
            <span>{cover.title}</span>
          </motion.div>
        ))}
      </div>
      <motion.button
        className="shuffle-key"
        aria-label="выбрать случайный трек"
        onClick={onPick}
        onPointerEnter={() => setExpanded(true)}
        onPointerLeave={() => setExpanded(false)}
        onFocus={() => setExpanded(true)}
        onBlur={() => setExpanded(false)}
        whileTap={reduced ? undefined : { y: 8, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 420, damping: 24 }}
      >
        <span className="shuffle-key-top">
          <span>на удачу</span>
          <ArrowUpRight size={22} />
        </span>
        <Shuffle className="shuffle-glyph" size={70} strokeWidth={1.5} />
        <span className="shuffle-key-label">
          {picked ? 'ещё один' : 'включить музыку'}
        </span>
      </motion.button>
      <span className="shuffle-key-caption">каждое нажатие — новый выбор</span>
    </div>
  );
}
