export const saveUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem("user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch (error) {
    return null;
  }
};

// Get the token saved after login
export const getToken = () => {
  const user = getUser();
  return user?.token || null;
};

export const logout = () => {
  localStorage.removeItem("user");
};

export const isLoggedIn = () => {
  return Boolean(getToken());
};