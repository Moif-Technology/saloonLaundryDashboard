import { useEffect, useRef, useState } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { IconRefresh } from '../components/Icon';

const THRESHOLD = 72;

/* The header button and the pull gesture both live in the shell, which has no
 * handle on the active page's fetch. They talk over window events rather than
 * a context that only two files would ever read. */
export const REFRESH_EVENT = 'app:refresh';
export const REFRESH_BUSY_EVENT = 'app:refresh-busy';

/**
 * Page side. One line per page: registers that page's fetch as what a refresh
 * means while it is mounted, and reports busy state back to the shell.
 */
export function useRefreshHandler(onRefresh: () => void | Promise<void>) {
  const latest = useRef(onRefresh);
  latest.current = onRefresh;

  useEffect(() => {
    let busy = false;
    const run = async () => {
      if (busy) return;
      busy = true;
      window.dispatchEvent(new CustomEvent(REFRESH_BUSY_EVENT, { detail: true }));
      try {
        await latest.current();
      } finally {
        busy = false;
        window.dispatchEvent(new CustomEvent(REFRESH_BUSY_EVENT, { detail: false }));
      }
    };
    window.addEventListener(REFRESH_EVENT, run);
    return () => window.removeEventListener(REFRESH_EVENT, run);
  }, []);
}

/**
 * Shell side. Mounted once by Layout: owns the gesture and the badge, and asks
 * whichever page is mounted to refresh itself. Touch listeners sit on the
 * window because .canvas has no overflow of its own — the document scrolls.
 */
export function PullToRefresh({ busy }: { busy: boolean }) {
  const [pull, setPull] = useState(0);
  const startY = useRef<number | null>(null);
  const armed = useRef(false);
  const busyRef = useRef(busy);
  busyRef.current = busy;

  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      if (busyRef.current || window.scrollY > 0) return;
      startY.current = e.touches[0].clientY;
      armed.current = false;
    };

    const onMove = (e: TouchEvent) => {
      if (startY.current === null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0 || window.scrollY > 0) {
        startY.current = null;
        setPull(0);
        return;
      }
      /* Non-passive so this can suppress the WebView's own reload gesture. */
      e.preventDefault();
      const distance = Math.min(dy * 0.5, 96);
      setPull(distance);
      if (!armed.current && distance >= THRESHOLD) {
        armed.current = true;
        Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
      }
    };

    const onEnd = () => {
      const shouldFire = armed.current;
      startY.current = null;
      armed.current = false;
      setPull(0);
      if (shouldFire) window.dispatchEvent(new Event(REFRESH_EVENT));
    };

    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
    };
  }, []);

  if (!pull && !busy) return null;
  const offset = busy ? THRESHOLD : pull;
  return (
    <div
      className={`ptr${busy ? ' is-busy' : ''}`}
      style={{
        transform: `translate(-50%, ${offset}px) rotate(${busy ? 0 : pull * 3}deg)`,
        opacity: busy ? 1 : Math.min(pull / THRESHOLD, 1),
      }}
      aria-hidden="true"
    >
      <IconRefresh size={18} />
    </div>
  );
}
