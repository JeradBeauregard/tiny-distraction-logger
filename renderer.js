let currentSession = null;
let timerInterval = null;
let isPaused = false;
let elapsedSeconds = 0;
let savedSessions = JSON.parse(localStorage.getItem("sessions")) || [];

const motivationQuotes = [
  "Back to it, warrior ⚔️",
  "Your focus is your superpower 🧠",
  "One slip? No sweat. You're still crushing it.",
  "That was just a blip. Get back in the zone.",
  "Distractions fear your determination 💥",
  "Don't let the gremlins win 👾",
  "You're building discipline with every click.",
  "Awareness is the first step. Proud of you."
];

const switchTab = (tabId) => {
  document.querySelectorAll(".tabView").forEach((tab) => tab.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
};

document.getElementById("theme-select").addEventListener("change", (e) => {
  document.body.className = "theme-" + e.target.value;
});

document.querySelectorAll('input[name="timerType"]').forEach((el) => {
  el.addEventListener("change", (e) => {
    document.getElementById("countdownMinutes").disabled = e.target.value !== "countdown";
  });
});

function startSession() {
  const name = document.getElementById("sessionName").value.trim();
  const type = document.querySelector('input[name="timerType"]:checked').value;
  const countdown = parseInt(document.getElementById("countdownMinutes").value);

  if (!name) return alert("Please enter a session name.");

  currentSession = {
    name,
    type,
    countdown: type === "countdown" && !isNaN(countdown) ? countdown * 60 : null,
    startTime: new Date().toISOString(),
    distractions: []
  };

  elapsedSeconds = 0;
  isPaused = false;

  document.getElementById("currentSessionName").textContent = name;
  document.getElementById("distractionList").innerHTML = "";
  document.getElementById("timer").textContent = "00:00";
  document.getElementById("distractionInput").value = "";

  clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);

  switchTab("currentSession");
}

function updateTimer() {
  if (isPaused || !currentSession) return;

  elapsedSeconds++;

  if (currentSession.type === "countdown") {
    const remaining = currentSession.countdown - elapsedSeconds;
    if (remaining <= 0) {
      endSession();
      return;
    }
    document.getElementById("timer").textContent = formatTime(remaining);
  } else {
    document.getElementById("timer").textContent = formatTime(elapsedSeconds);
  }
}

function formatTime(totalSeconds) {
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function logDistraction() {
  const input = document.getElementById("distractionInput");
  const text = input.value.trim();
  if (!text || !currentSession) return;

  const entry = `${formatTime(elapsedSeconds)} — ${text}`;
  currentSession.distractions.push(entry);

  const li = document.createElement("li");
  li.textContent = entry;
  document.getElementById("distractionList").appendChild(li);

  input.value = "";

  const quote = motivationQuotes[Math.floor(Math.random() * motivationQuotes.length)];
  const popup = document.getElementById("quotePopup");
  popup.textContent = quote;
  popup.classList.add("show");
  setTimeout(() => popup.classList.remove("show"), 3000);
}

function pauseResumeTimer() {
  isPaused = !isPaused;
  document.getElementById("pauseBtn").textContent = isPaused ? "Resume" : "Pause";
}

function endSession() {
  clearInterval(timerInterval);
  if (!currentSession) return;

  currentSession.duration = elapsedSeconds;
  savedSessions.unshift(currentSession);
  localStorage.setItem("sessions", JSON.stringify(savedSessions));

  currentSession = null;
  renderSessionHistory();
  switchTab("previousSessions");
}

function renderSessionHistory() {
  const container = document.getElementById("sessionHistory");
  container.innerHTML = "";

  savedSessions.forEach((session, index) => {
    const box = document.createElement("div");
    box.className = "session-container";

    const header = document.createElement("div");
    header.className = "session-header";
    header.textContent = `Session ${index + 1}: ${session.name} — ${new Date(session.startTime).toLocaleString()} (${session.distractions.length} distractions)`;

    const details = document.createElement("div");
    details.className = "session-details";
    details.innerHTML = `
      <p><strong>Started:</strong> ${new Date(session.startTime).toLocaleString()}</p>
      <p><strong>Duration:</strong> ${formatTime(session.duration)}</p>
      <p><strong>Distractions:</strong></p>
      <ul>${session.distractions.map(d => `<li>${d}</li>`).join("")}</ul>
    `;

    header.onclick = () => {
      details.style.display = details.style.display === "block" ? "none" : "block";
    };

    box.appendChild(header);
    box.appendChild(details);
    container.appendChild(box);
  });
}

renderSessionHistory();
