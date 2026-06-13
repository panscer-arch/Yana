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
