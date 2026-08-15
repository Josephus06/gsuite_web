import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// A client-side route change keeps the browser's scroll position, so following a footer link
// lands you halfway down the next page. Reset it on every navigation.
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
