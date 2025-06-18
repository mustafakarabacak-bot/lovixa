// ui-loader.js
(async () => {
  const top = await fetch("/topbar.html").then(r => r.text());
  const bot = await fetch("/bottom-nav.html").then(r => r.text());

  const topDiv = document.createElement("div");
  topDiv.innerHTML = top;
  document.body.prepend(topDiv);

  const botDiv = document.createElement("div");
  botDiv.innerHTML = bot;
  document.body.appendChild(botDiv);
})();