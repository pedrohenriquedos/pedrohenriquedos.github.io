const state = {
  night: 1,
  hour: 12,
  battery: 100,
  doors: {
    left: false,
    right: false,
  },
  robots: [
    { id: "alpha", name: "Alpha", positionIndex: 0, threat: "Baixa" },
    { id: "beta", name: "Beta", positionIndex: 1, threat: "Média" },
    { id: "gamma", name: "Gamma", positionIndex: 2, threat: "Baixa" },
    { id: "delta", name: "Delta", positionIndex: 3, threat: "Alta" },
  ],
  running: true,
};

const positions = [
  "Palco principal",
  "Corredor oeste",
  "Sala de suprimentos",
  "Corredor leste",
  "Porta esquerda",
  "Porta direita",
  "Sala de segurança",
];

const nightEl = document.getElementById("night");
const timeEl = document.getElementById("time");
const batteryEl = document.getElementById("battery");
const instructionsEl = document.getElementById("instructions");
const victoryEl = document.getElementById("victory-message");
const defeatEl = document.getElementById("defeat-message");
const leftDoorEl = document.querySelector(".door-left");
const rightDoorEl = document.querySelector(".door-right");
const leftButton = document.getElementById("toggle-left-door");
const rightButton = document.getElementById("toggle-right-door");
const robotCards = document.querySelectorAll(".robot-status");

function updateHud() {
  nightEl.textContent = `Noite ${state.night}`;
  const hourLabel = `${state.hour === 0 ? 12 : state.hour}:00 AM`;
  timeEl.textContent = hourLabel;
  batteryEl.textContent = `${Math.max(state.battery, 0)}%`;
}

function updateDoors() {
  updateDoorState(leftDoorEl, state.doors.left, "esquerda");
  updateDoorState(rightDoorEl, state.doors.right, "direita");
}

function updateDoorState(container, closed, sideLabel) {
  const indicator = container.querySelector(".door-indicator");
  const button = container.querySelector(".door-button");
  indicator.textContent = closed ? "Fechada" : "Aberta";
  indicator.dataset.state = closed ? "closed" : "open";
  button.textContent = closed
    ? `Abrir porta ${sideLabel}`
    : `Fechar porta ${sideLabel}`;
}

function updateRobots() {
  robotCards.forEach((card, index) => {
    const robot = state.robots[index];
    if (!robot) return;
    card.querySelector(".robot-position").textContent = positions[robot.positionIndex];
    card.querySelector(".robot-threat").textContent = robot.threat;
  });
}

function showDefeat(message) {
  state.running = false;
  defeatEl.querySelector("p").textContent = message;
  defeatEl.hidden = false;
  instructionsEl.hidden = true;
}

function showVictory() {
  state.running = false;
  victoryEl.hidden = false;
  instructionsEl.hidden = true;
}

function advanceTime() {
  if (!state.running) return;
  if (state.hour === 6) {
    showVictory();
    return;
  }
  state.hour = state.hour + 1;
  if (state.hour === 7) {
    showVictory();
  }
}

function drainBattery() {
  if (!state.running) return;
  let drain = 1;
  if (state.doors.left) drain += 1;
  if (state.doors.right) drain += 1;
  state.battery = Math.max(state.battery - drain, 0);
  if (state.battery === 0) {
    showDefeat("A bateria acabou. Você não conseguiu manter o sistema ligado.");
  }
}

function moveRobots() {
  if (!state.running) return;
  state.robots.forEach((robot) => {
    const moveChance = robot.threat === "Alta" ? 0.7 : robot.threat === "Média" ? 0.5 : 0.3;
    if (Math.random() < moveChance) {
      robot.positionIndex = Math.min(robot.positionIndex + 1, positions.length - 1);
    }
  });
  const leftThreat = state.robots.some((robot) => positions[robot.positionIndex] === "Porta esquerda");
  const rightThreat = state.robots.some((robot) => positions[robot.positionIndex] === "Porta direita");
  const reachedSecurity = state.robots.some((robot) => positions[robot.positionIndex] === "Sala de segurança");

  if (reachedSecurity) {
    showDefeat("Um robô entrou na sala de segurança.");
    return;
  }

  if (leftThreat && !state.doors.left) {
    showDefeat("A porta esquerda estava aberta quando o robô chegou.");
  }

  if (rightThreat && !state.doors.right) {
    showDefeat("A porta direita estava aberta quando o robô chegou.");
  }
}

leftButton.addEventListener("click", () => {
  state.doors.left = !state.doors.left;
  updateDoors();
});

rightButton.addEventListener("click", () => {
  state.doors.right = !state.doors.right;
  updateDoors();
});

updateHud();
updateDoors();
updateRobots();

setInterval(() => {
  if (!state.running) return;
  drainBattery();
  updateHud();
}, 1000);

setInterval(() => {
  if (!state.running) return;
  moveRobots();
  updateRobots();
}, 2000);

setInterval(() => {
  if (!state.running) return;
  advanceTime();
  updateHud();
}, 8000);
