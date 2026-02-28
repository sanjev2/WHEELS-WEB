export const ACTIVE_CAR_ID_KEY = "activeCarId";

export function getActiveCarId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACTIVE_CAR_ID_KEY);
}

export function setActiveCarId(id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_CAR_ID_KEY, id);
}

export function clearActiveCarId() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACTIVE_CAR_ID_KEY);
}