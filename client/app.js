//-------------------------------------------------------------
//Constants
//-------------------------------------------------------------
const storageKey = "savedAccount";

//-------------------------------------------------------------
// Router
//-------------------------------------------------------------

const routes = {
  "/login": { title: "My Account", templateId: "login" },
  "/dashboard": { title: "Login", templateId: "dashboard", init: refresh },
};

function navigate(path) {
  window.history.pushState({}, path, path);
  updateRoute();
}

function updateRoute() {
  const path = window.location.pathname;
  const route = routes[path];

  if (!route) {
    return navigate("/dashboard");
  }

  const template = document.getElementById(route.templateId);
  const view = template.content.cloneNode(true);
  const app = document.getElementById("app");
  app.innerHTML = "";
  app.appendChild(view);

  if (typeof route.init === "function") {
    route.init();
  }
}

//-------------------------------------------------------------
//API Interactions
//-------------------------------------------------------------

async function getAccount(user) {
  try {
    const response = await fetch(
      "//localhost:5000/api/accounts/" + encodeURIComponent(user)
    );
    return await response.json();
  } catch (error) {
    return { error: error.message || "Unknown error" };
  }
}

async function createAccount(account) {
  try {
    const response = await fetch("http://localhost:5000/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: account,
    });
    return await response.json();
  } catch (error) {
    return { error: error.message || "Unknown error" };
  }
}

function createTransactionRow(transaction) {
  const template = document.getElementById("transaction");
  const transactionRow = template.content.cloneNode(true);
  const tr = transactionRow.querySelector("tr");
  tr.children[0].textContent = transaction.date;
  tr.children[1].textContent = transaction.object;
  tr.children[2].textContent = transaction.amount.toFixed(2);
  return transaction;
}

//-------------------------------------------------------------
//Global States
//-------------------------------------------------------------

let state = Object.freeze({
  account: null,
});

function updateState(property, newData) {
  state = Object.freeze({
    ...state,
    [property]: newData,
  });
  localStorage.setItem(storageKey, JSON.stringify(state.account));
  console.log(state);
}

//-------------------------------------------------------------
//login/register
//-------------------------------------------------------------

async function login() {
  const loginForm = document.getElementById("loginForm");
  const user = loginForm.user.value;
  const data = await getAccount(user);

  if (data.error) {
    return updateElement("loginError", data.error);
  }
  updateState("account", data);
  navigate("/dashboard");
}

async function register() {
  const registerForm = document.getElementById("registerForm");
  const formData = new FormData(registerForm);
  const data = Object.fromEntries(formData);
  const jsonData = JSON.stringify(data);
  const result = await createAccount(jsonData);

  if (result.error) {
    return updateElement("registerError", result.error);
  }
  console.log("Account created: ", result);

  updateState("account", result);
  navigate("/dashboard");
}

//-------------------------------------------------------------
//Dashboard
//-------------------------------------------------------------

async function updateAccountData() {
  const account = state.account;
  if (!account) {
    return logout();
  }

  const data = await getAccount(account.user);
  if (data.error) {
    return logout();
  }

  updateState("account", data);
}

async function refresh() {
  await updateAccountData();
  updateDashboard();
}

function updateDashboard() {
  const account = state.account;
  if (!account) {
    return logout();
  }

  updateElement("description", account.description);
  updateElement("balance", account.balance.toFixed(2));
  updateElement("currency", account.currency);
  updateElement("transactions", transactionsRows);

  // Update transactions
  const transactionsRows = document.createDocumentFragment();
  for (const transaction of account.transactions) {
    const transactionRow = createTransactionRow(transaction);
    transactionsRows.appendChild(transactionRow);
  }
}

function createTransactionRow(transaction) {
  const template = document.getElementById("transaction");
  const transactionRow = template.content.cloneNode(true);
  const tr = transactionRow.querySelector("tr");
  tr.children[0].textContent = transaction.date;
  tr.children[1].textContent = transaction.object;
  tr.children[2].textContent = transaction.amount.toFixed(2);
  return transaction;
}

function logout() {
  updateState("account", null);
  navigate("/login");
}

//-------------------------------------------------------------
//Utils
//-------------------------------------------------------------

function updateElement(id, textOrNode) {
  const element = document.getElementById(id);
  element.textContent = ""; //Removes all children
  element.append(textOrNode);
}

function onLinkClick(event) {
  event.preventDefault();
  navigate(event.target.href);
}

//-------------------------------------------------------------
//Init
//-------------------------------------------------------------

function init() {
  //Restore State
  const savedAccount = localStorage.getItem(storageKey);
  if (savedAccount) {
    updateState("account", JSON.parse(savedAccount));
  }

  //Update route for browser back/next buttons
  window.onpopstate = () => updateRoute();
  updateRoute();
}

init();
