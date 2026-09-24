import { registerSW } from "virtual:pwa-register";
import "./styles/main.css";
import { loadCatalog } from "./domain/catalog";
import { createBallEngine, type RNG, type StorageAdapter } from "./domain/engine";
import { createBallUi, type UiState } from "./ui";

const STORAGE_KEY = "enhanced-magic-8-ball/v1";
const SHAKE_MS = 1000;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

const rng: RNG = {
  nextFloat() {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return buffer[0] / 4294967296;
  }
};

const storage: StorageAdapter = {
  load: () => localStorage.getItem(STORAGE_KEY),
  save: (value) => {
    localStorage.setItem(STORAGE_KEY, value);
  }
};

const engine = createBallEngine({ catalog: loadCatalog(), rng, storage });

const ball = document.getElementById("ball")!;
const answerWindow = document.getElementById("answer-window")!;
const answerText = document.getElementById("answer-text")!;
const shakeBtn = document.getElementById("shake-btn") as HTMLButtonElement;
const askAgainBtn = document.getElementById("ask-again-btn") as HTMLButtonElement;
const liveRegion = document.getElementById("live-region")!;

function applyState(state: UiState): void {
  const shaking = state.mode === "shaking";
  const revealed = state.mode === "revealed";

  ball.classList.toggle("ball--shaking", shaking);
  answerWindow.hidden = !revealed;
  answerText.textContent = revealed ? state.answer : "";
  shakeBtn.hidden = revealed;
  shakeBtn.disabled = shaking;
  shakeBtn.textContent = shaking ? "Shaking" : "Shake the Ball";
  askAgainBtn.hidden = !revealed;

  if (revealed) {
    liveRegion.textContent = state.answer;
    askAgainBtn.focus();
  } else if (state.mode === "idle") {
    liveRegion.textContent = "";
  }
}

const ui = createBallUi({ onState: applyState });

function onShake(): void {
  ui.shake();
  const answer = engine.draw();
  const delay = window.matchMedia(REDUCED_MOTION).matches ? 0 : SHAKE_MS;
  window.setTimeout(() => {
    ui.reveal(answer);
  }, delay);
}

function onAskAgain(): void {
  ui.askAgain();
  shakeBtn.focus();
}

shakeBtn.addEventListener("click", onShake);
askAgainBtn.addEventListener("click", onAskAgain);

registerSW({ immediate: true });
applyState({ mode: "idle" });
