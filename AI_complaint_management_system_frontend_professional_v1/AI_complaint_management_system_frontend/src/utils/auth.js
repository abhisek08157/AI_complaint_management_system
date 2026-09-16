export const saveUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem("user");

  if (!user) {
    return null;
  }

  return JSON.parse(user);
};

export const logout = () => {
  localStorage.removeItem("user");
};

export const isLoggedIn = () => {
  return localStorage.getItem("user") !== null;
};