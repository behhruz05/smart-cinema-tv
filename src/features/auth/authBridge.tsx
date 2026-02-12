let logoutHandler: (() => void) | null = null;

export const setLogoutHandler = (fn: () => void) => {
  logoutHandler = fn;
};

export const triggerLogout = () => {
  logoutHandler?.();
};
