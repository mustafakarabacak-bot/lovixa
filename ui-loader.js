// ui-loader.js
async function loadComponent(url) {
  const res = await fetch(url);
  const html = await res.text();
  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.insertAdjacentElement("afterbegin", container);
}

// Üst menü (topbar)
loadComponent("./topbar.html").then(() => {
  const spacer = document.createElement("div");
  spacer.style.height = "56px";
  document.body.insertBefore(spacer, document.body.firstChild.nextSibling);
});

// Alt menü (bottom nav)
loadComponent("./bottom-nav.html").then(() => {
  const spacer = document.createElement("div");
  spacer.style.height = "56px";
  document.body.appendChild(spacer);
});