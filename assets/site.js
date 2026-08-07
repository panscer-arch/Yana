(function () {
  if (!("serviceWorker" in navigator)) return;
  if (location.protocol !== "https:" && location.hostname !== "localhost" && location.hostname !== "127.0.0.1") return;

  const currentScript = document.currentScript;
  const workerUrl = new URL("../sw.js", currentScript ? currentScript.src : location.href);

  window.addEventListener("load", () => {
    navigator.serviceWorker.register(workerUrl)
      .then((registration) => registration.update())
      .catch((error) => {
        console.warn("Service worker was not registered", error);
      });
  });
})();

(function () {
  const panel = document.querySelector(".today-panel");
  if (!panel || document.querySelector("#birthdayDays")) return;

  const style = document.createElement("style");
  style.textContent = `
    .today-card.birthday-card {
      position: relative;
      overflow: hidden;
      border-color: rgba(255, 114, 173, .42);
      background:
        radial-gradient(circle at 90% 12%, rgba(255, 212, 92, .55) 0 18%, transparent 19%),
        linear-gradient(135deg, rgba(255, 114, 173, .22), rgba(142, 103, 255, .16), rgba(84, 184, 255, .15)),
        rgba(255, 253, 247, .98);
    }

    .today-card.birthday-card::after {
      content: "";
      position: absolute;
      right: 14px;
      bottom: 12px;
      width: 58px;
      height: 58px;
      border: 3px solid rgba(36, 31, 53, .16);
      border-radius: 50% 50% 46% 46%;
      background:
        linear-gradient(90deg, transparent 45%, rgba(255, 255, 255, .86) 45% 55%, transparent 55%),
        linear-gradient(135deg, #ff72ad, #ffd45c);
      box-shadow: 0 10px 0 rgba(36, 31, 53, .08);
      opacity: .78;
      pointer-events: none;
    }
  `;
  document.head.append(style);

  const card = document.createElement("article");
  card.className = "today-card birthday-card";
  card.innerHTML = `
    <span>День рождения</span>
    <strong id="birthdayDays">23 октября</strong>
    <p id="birthdayText">Сайт каждый день напомнит, сколько осталось.</p>
  `;
  panel.append(card);

  function getDayWord(number) {
    const lastTwo = number % 100;
    const last = number % 10;
    if (lastTwo >= 11 && lastTwo <= 14) return "дней";
    if (last === 1) return "день";
    if (last >= 2 && last <= 4) return "дня";
    return "дней";
  }

  function updateBirthdayCountdown() {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    let birthday = new Date(today.getFullYear(), 9, 23);

    if (birthday < todayStart) {
      birthday = new Date(today.getFullYear() + 1, 9, 23);
    }

    const daysLeft = Math.round((birthday - todayStart) / 86400000);
    const title = document.querySelector("#birthdayDays");
    const text = document.querySelector("#birthdayText");
    if (!title || !text) return;

    if (daysLeft === 0) {
      title.textContent = "Сегодня!";
      text.textContent = "У Яны день рождения 23 октября. Самый праздничный день!";
      return;
    }

    const dayWord = getDayWord(daysLeft);
    title.textContent = `${daysLeft} ${dayWord}`;
    text.textContent = `До дня рождения Яны 23 октября осталось ${daysLeft} ${dayWord}.`;
  }

  updateBirthdayCountdown();
})();
