const prompts = [
  "What would you tell your future self?",
  "Describe your happiest memory so far.",
  "What are your dreams and goals right now?",
  "Who are you grateful for today?",
  "What's one lesson you've recently learned?"
];

const BASE_URL = "https://time-capsule-backend-uq0s.onrender.com";


function getToken() {
  return localStorage.getItem("authToken");
}

function setToken(token) {
  localStorage.setItem("authToken", token);
}

function logoutUser(showAlert = true) {
  localStorage.removeItem("authToken");
  updateAuthUI(); // Hide UI immediately
  if (showAlert) alert("Logged out.");
  setTimeout(() => {
    window.location.reload(); // 🔁 Full reset after short delay
  }, 50); // Short delay ensures UI updates first
}


async function registerUser() {
  const email = document.getElementById("emailInput").value;
  const password = document.getElementById("passwordInput").value;
  if (!email || !password) return alert("Email and password required");
  try {
    const res = await fetch(`${BASE_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    alert("Registered!");
  } catch (err) {
    alert("Error: " + err.message);
  }
}

async function loginUser() {
  const email = document.getElementById("emailInput").value;
  const password = document.getElementById("passwordInput").value;

  if (!email || !password) {
    return alert("Email and password required");
  }

  try {
    const res = await fetch(`${BASE_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");

    setToken(data.token);          // ✅ save token first
    updateAuthUI();                // ✅ update UI using token
    showEntries();                 // ✅ fetch user’s entries
    alert("Logged in!");
  } catch (err) {
    alert("Error: " + err.message);
  }
}




function authFetch(url, options = {}) {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
}


function saveEntry() {
  if (!getToken()) {
    alert("You must be logged in to save an entry.");
    return;
  }

  const message = document.getElementById("message").value;
  const title = document.getElementById("entryTitle").value || "Untitled Entry";
  const unlockDate = document.getElementById("unlockDate").value;

  if (!unlockDate) {
    alert("Please select a valid unlock date.");
    return;
  }

  const now = new Date();
  const unlock = new Date(unlockDate);
  if (unlock.getTime() < now.getTime() - 60000) {
    alert("Unlock date must be in the future or within the last minute.");
    return;
  }

  const entry = {
    id: Date.now(),
    title,
    message,
    unlockDate
  };

  authFetch(`${BASE_URL}/api/register`, {
    method: "POST",
    body: JSON.stringify(entry)
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to save entry.");
      return res.json();
    })
    .then(() => {
      document.getElementById("message").value = "";
      document.getElementById("entryTitle").value = "";
      document.getElementById("unlockDate").value = new Date().toISOString().slice(0, 16);
      confetti?.();
      showEntries();
    })
    .catch((err) => console.error(err));
}



function showEntries() {
  authFetch(`${BASE_URL}/api/entries`)
    .then((res) => {
      if (!res.ok) throw new Error("Not logged in or error");
      return res.json();
    })
    .then((entries) => renderEntries(entries))
    .catch((err) => {
      console.warn("Could not load entries:", err);
      renderEntries([]); // Show empty state even if fetch fails
    });
}

function renderEntries(entries) {
  const container = document.getElementById("entries");
  const filter = document.getElementById("filterSelect")?.value || "all";
  const searchQuery = document.getElementById("searchBar")?.value.toLowerCase() || "";
  const now = new Date();

  container.innerHTML = "";

  if (entries.length === 0) {
    const emptyMessage = document.createElement("div");
    emptyMessage.className = "no-entries";
    emptyMessage.innerHTML = `<p>No entries yet. Write your first one above!</p>`;
    container.appendChild(emptyMessage);
    return;
  }

  let hasVisibleEntries = false;

  for (let entry of entries) {
    const isUnlocked = new Date(entry.unlockDate) <= now;
    const inTitle = entry.title.toLowerCase().includes(searchQuery);
    const inMessage = entry.message.toLowerCase().includes(searchQuery);
    if (!inTitle && !inMessage) continue;
    if ((filter === "locked" && isUnlocked) || (filter === "unlocked" && !isUnlocked)) continue;

    hasVisibleEntries = true;

    const div = document.createElement("div");
    div.className = "entry";

    const titleBar = document.createElement("div");
    titleBar.className = "entry-header";
    titleBar.innerHTML = `
      <strong>${entry.title}</strong>
      <span class="timestamp">${new Date(entry.unlockDate).toLocaleDateString(undefined, {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
      })}</span>
      <button class="delete-btn" onclick="deleteEntry(${entry.id})">Delete</button>
      <span class='arrow'>▶</span>
    `;

    titleBar.onclick = (e) => {
      if (!e.target.classList.contains("delete-btn")) {
        div.classList.toggle("active");
      }
    };

    const content = document.createElement("div");
    content.className = "content";

    if (isUnlocked) {
      const p = document.createElement("p");
      const icon = document.createElement("svg");
      icon.classList.add("key-slide");
      icon.setAttribute("width", "20");
      icon.setAttribute("height", "20");
      const use = document.createElement("use");
      use.setAttribute("href", "#key-icon");
      icon.appendChild(use);

      const em = document.createElement("em");
      em.textContent = `Unlocked on ${new Date(entry.unlockDate).toLocaleString()}:`;

      p.appendChild(icon);
      p.appendChild(em);
      p.appendChild(document.createElement("br"));
      const text = document.createElement("span");
      text.textContent = entry.message;
      p.appendChild(text);
      content.appendChild(p);
      content.appendChild(document.createElement("hr"));
    } else {
      const p = document.createElement("p");
      const icon = document.createElement("svg");
      icon.setAttribute("width", "20");
      icon.setAttribute("height", "20");
      const use = document.createElement("use");
      use.setAttribute("href", "#lock-icon");
      icon.appendChild(use);

      const em = document.createElement("em");
      em.textContent = `Will unlock on ${new Date(entry.unlockDate).toLocaleString()}`;
      p.appendChild(icon);
      p.appendChild(em);
      content.appendChild(p);
      content.appendChild(document.createElement("hr"));
    }

    div.appendChild(titleBar);
    div.appendChild(content);
    container.appendChild(div);
  }

  // If filter removed all entries
  if (!hasVisibleEntries && entries.length > 0) {
    const emptyMessage = document.createElement("div");
    emptyMessage.className = "no-entries";
    emptyMessage.innerHTML = `<p>No entries match your current filters or search.</p>`;
    container.appendChild(emptyMessage);
  }
}






function deleteEntry(id) {
  const confirmDelete = confirm("Are you sure you want to delete this entry?");
  if (!confirmDelete) return;

  authFetch(`${BASE_URL}/api/entries/${id}`, {
    method: "DELETE"
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to delete entry.");
      return res.json();
    })
    .then(() => showEntries())
    .catch(err => console.error(err));
}




function toggleAllEntries() {
  const all = document.querySelectorAll(".entry");
  all.forEach(entry => entry.classList.toggle("active"));
}

async function clearEntries() {
  if (confirm("Are you sure you want to delete all entries?")) {
    try {
      const res = await authFetch(`${BASE_URL}/api/register`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete all entries");
      showEntries(); // Refresh the list
    } catch (e) {
      console.error("Clear all failed:", e);
    }
  }
}


function toggleDarkMode() {
  const body = document.body;
  const toggleBtn = document.getElementById("themeToggle");
  body.classList.toggle("dark-mode");
  toggleBtn.textContent = body.classList.contains("dark-mode")
    ? "Toggle Light Mode"
    : "Toggle Dark Mode";
}

let promptIndex = 0;
function givePrompt() {
  const prompt = prompts[promptIndex % prompts.length];
  document.getElementById("message").placeholder = prompt;
  promptIndex++;
}

function filterEntries() {
  showEntries();
}

window.onload = function () {
  updateAuthUI();
  showEntries();
  document.getElementById("unlockDate").value = new Date().toISOString().slice(0, 16);
  const searchBar = document.getElementById("searchBar");
  if (searchBar) {
    searchBar.addEventListener("input", showEntries);
  }
};
function updateAuthUI() {
  const token = getToken();
  const isLoggedIn = !!token;
  const authPanel = document.getElementById("authPanel");
  const loggedInMessage = document.getElementById("loggedInMessage");
  const logoutTopBtn = document.getElementById("logoutTopBtn");

  if (!token) {
    authPanel.style.display = "block";
    loggedInMessage.style.display = "none";
    if (logoutTopBtn) logoutTopBtn.style.display = "none";
    return;
    
  }

  // 🔐 Ping to check token validity
  fetch(`${BASE_URL}/api/ping`, {
  headers: { Authorization: `Bearer ${token}` }
})
  .then((res) => {
    if (!res.ok) throw new Error("Invalid token");
    authPanel.style.display = "none";
    loggedInMessage.style.display = "block";
    if (logoutTopBtn) logoutTopBtn.style.display = "inline-block";
  })
  .catch(() => {
    logoutUser(false); // ⛔ Bad token, auto-logout silently
  });

}

