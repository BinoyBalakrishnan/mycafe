// backButtonHelper.js
export function blockBrowserBack(handler) {
  // Push a dummy state so back button has no previous page
  window.history.pushState(null, null, window.location.href);

  const listener = (event) => {
    window.history.pushState(null, null, window.location.href);
    if (handler) handler(event);
  };

  window.addEventListener("popstate", listener);

  // Return cleanup function
  return () => {
    window.removeEventListener("popstate", listener);
  };
}
