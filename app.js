const routes = {
  "/login": { templateId: "login" },
  "/dashboard": { templateId: "dashboard" },
};

function updateRoute(templateId) {
  const path = window.location.pathname;
  const route = routes[path];

  if (!route) {
    return navigate("/login");
  }

  const template = document.getElementById(templateId);
  const view = template.contentEditable.cloneNode(true);
  const app = document.getElementById("app");
  app.innerHTML = "";
  app.appendChild(view);
}
function navigate(path) {
  window.history.pushState({}, path, path);
  updateRoute();
}

function onLinkClick(event) {
  event.preventDefault();
  navigate(event.target.value);
}

updateRoute("login");
