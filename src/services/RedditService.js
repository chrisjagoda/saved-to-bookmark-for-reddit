import { convertSavedToBookmark, toUrlParams } from "../utils";
import { API_URL, SSL_URL } from "../constants";

export async function login(username, password) {
  const url = `${API_URL}api/login`;
  const body = toUrlParams({
    user: username,
    passwd: password,
    rem: true,
    api_type: "json"
  });
  const headers = { "content-type": "application/x-www-form-urlencoded" };
  const method = "POST";
  let response;
  try {
    response = await fetch(url, { body, headers, method });
  } catch {
    throw new Error("Error logging in to reddit account.");
  }
  if (
    response.status !== 200 ||
    (await response.json()).json.data === undefined
  ) {
    throw new Error("Invalid username or password.");
  }
}

export async function getMe() {
  const url = `${SSL_URL}/prefs/update`;
  const response = await fetch(url);

  if (response.status === 200) {
    const text = await response.text();
    const dom = new DOMParser().parseFromString(text, "text/html");
    try {
      const users = dom.getElementsByClassName("user");
      const usernameElement = users[0].firstChild;
      const username = usernameElement.innerText;
      const emailElement = dom.getElementsByName("email")[0];
      const email = emailElement.defaultValue;
      return { email, username };
    } catch {
      throw new Error("Unable to retrieve user info.");
    }
  }
}

export async function getAllSaved(username) {
  const options = { limit: 100 };
  let allSaved = [];

  while (true) {
    const parameters = toUrlParams(options);
    const url = `${API_URL}user/${username}/saved.json?${parameters}`;
    const response = await fetch(url);
    const json = await response.json();
    const saved = json.data.children;
    const savedLength = saved.length;

    if (savedLength > 0) {
      allSaved = allSaved.concat(convertSavedToBookmark(saved));
      options.after = saved[savedLength - 1].data.name;
    } else {
      break;
    }
  }
  return allSaved;
}
