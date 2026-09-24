export type UiState =
  | { mode: "idle" }
  | { mode: "shaking" }
  | { mode: "revealed"; answer: string };

export interface BallUi {
  shake(): void;
  reveal(answer: string): void;
  askAgain(): void;
  state(): UiState;
}

export function createBallUi(handlers: {
  onState: (state: UiState) => void;
}): BallUi {
  let state: UiState = { mode: "idle" };

  function setState(next: UiState): void {
    state = next;
    handlers.onState(state);
  }

  return {
    shake() {
      if (state.mode !== "idle") return;
      setState({ mode: "shaking" });
    },
    reveal(answer) {
      if (state.mode !== "shaking") return;
      setState({ mode: "revealed", answer });
    },
    askAgain() {
      if (state.mode !== "revealed") return;
      setState({ mode: "idle" });
    },
    state() {
      return state;
    }
  };
}
