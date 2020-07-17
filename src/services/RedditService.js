import { convertSavedToBookmark, toUrlParams } from "../utils";
import { API_URL, SSL_URL } from "../constants";

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
