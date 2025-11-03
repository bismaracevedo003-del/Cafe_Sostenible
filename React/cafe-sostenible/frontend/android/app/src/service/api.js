const API_BASE = import.meta.env.VITE_API_URL;

export async function login(username, password) {
  const formData = new FormData();
  formData.append("username", username);
  formData.append("password", password);

  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    body: formData,
    credentials: "include" // muy importante para sesiones/cookies
  });
  return response.json();
}

export async function getUser() {
  const response = await fetch(`${API_BASE}/user`, {
    method: "GET",
    credentials: "include"
  });
  return response.json();
}

export async function logout() {
  const response = await fetch(`${API_BASE}/logout`, {
    method: "POST",
    credentials: "include"
  });
  return response.json();
}
