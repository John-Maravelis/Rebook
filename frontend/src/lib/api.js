export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const TOKEN_KEY = "access_token";

function parseErrorDetail(data) {
  const detail = data?.detail;
  if (!detail) return "Κάτι πήγε στραβά";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    // Pydantic validation errors: [{ msg: "Value error, ...", loc: [...], ... }, ...]
    return detail
      .map((item) => (typeof item.msg === "string" ? item.msg.replace(/^Value error,\s*/, "") : String(item)))
      .join(" ");
  }
  return "Κάτι πήγε στραβά";
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    let detail = "Κάτι πήγε στραβά";
    try {
      const data = await response.json();
      detail = parseErrorDetail(data);
    } catch {
      // το response δεν είχε JSON body, κρατάμε το γενικό μήνυμα
    }
    throw new Error(detail);
  }

  if (response.status === 204) {
    return null;
  }
  return response.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" }),
  uploadPhoto: async (file) => {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/listings/upload-photo`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      let detail = "Η μεταφόρτωση της φωτογραφίας απέτυχε";
      try {
        detail = parseErrorDetail(await response.json());
      } catch {
        // κρατάμε το γενικό μήνυμα αν το response δεν έχει JSON body
      }
      throw new Error(detail);
    }

    return response.json();
  },
};

/** Το /auth/login περιμένει form-urlencoded (OAuth2 standard), όχι JSON. */
export async function login(institutionalEmail, password) {
  const body = new URLSearchParams({ username: institutionalEmail, password });
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(parseErrorDetail(data));
  }
  return response.json(); // { access_token, token_type }
}
