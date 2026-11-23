const KEY = "wrapped-admin-pw";
export const getAdminPw = () => (typeof window === "undefined" ? "" : sessionStorage.getItem(KEY) ?? "");
export const setAdminPw = (pw: string) => sessionStorage.setItem(KEY, pw);
export const clearAdminPw = () => sessionStorage.removeItem(KEY);
