import { describe, expect, it } from "vitest";
import { createBallUi, type UiState } from "../src/ui";

function setup(onState: (s: UiState) => void = () => {}) {
  const calls: UiState[] = [];
  const ui = createBallUi({
    onState: (s) => {
      calls.push(s);
      onState(s);
    },
  });
  return { ui, calls };
}

describe("createBallUi", () => {
  it("starts idle with an idle state()", () => {
    const { ui } = setup();
    expect(ui.state()).toEqual({ mode: "idle" });
  });

  it("transitions idle -> shaking on shake() and notifies once", () => {
    const { ui, calls } = setup();
    ui.shake();
    expect(ui.state()).toEqual({ mode: "shaking" });
    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual({ mode: "shaking" });
  });

  it("ignores a second shake() while shaking (no-op)", () => {
    const { ui, calls } = setup();
    ui.shake();
    ui.shake();
    expect(ui.state()).toEqual({ mode: "shaking" });
    expect(calls).toHaveLength(1);
  });

  it("ignores shake() from revealed (no-op)", () => {
    const { ui, calls } = setup();
    ui.shake();
    ui.reveal("It is certain");
    ui.shake();
    expect(ui.state()).toEqual({ mode: "revealed", answer: "It is certain" });
    expect(calls).toHaveLength(2);
  });

  it("transitions shaking -> revealed with the answer via reveal(answer)", () => {
    const { ui, calls } = setup();
    ui.shake();
    ui.reveal("My sources say no");
    expect(ui.state()).toEqual({ mode: "revealed", answer: "My sources say no" });
    expect(calls).toHaveLength(2);
    expect(calls[1]).toEqual({ mode: "revealed", answer: "My sources say no" });
  });

  it("ignores reveal() from idle (no-op)", () => {
    const { ui, calls } = setup();
    ui.reveal("Yes");
    expect(ui.state()).toEqual({ mode: "idle" });
    expect(calls).toHaveLength(0);
  });

  it("transitions revealed -> idle via askAgain() and notifies once", () => {
    const { ui, calls } = setup();
    ui.shake();
    ui.reveal("Very doubtful");
    ui.askAgain();
    expect(ui.state()).toEqual({ mode: "idle" });
    expect(calls).toHaveLength(3);
    expect(calls[2]).toEqual({ mode: "idle" });
  });

  it("ignores askAgain() from idle and from shaking (no-ops)", () => {
    const { ui, calls } = setup();
    ui.askAgain();
    expect(ui.state()).toEqual({ mode: "idle" });
    expect(calls).toHaveLength(0);

    ui.shake();
    ui.askAgain();
    expect(ui.state()).toEqual({ mode: "shaking" });
    expect(calls).toHaveLength(1);
  });

  it("invokes onState exactly once per successful transition with the new state, and state() mirrors it", () => {
    const seen: Array<UiState["mode"]> = [];
    const { ui } = setup((s) => seen.push(s.mode));
    expect(ui.state().mode).toBe("idle");

    ui.shake();
    ui.shake();
    ui.reveal("Ask again later");
    ui.reveal("Duplicated");
    ui.askAgain();
    ui.askAgain();

    expect(seen).toEqual(["shaking", "revealed", "idle"]);
    expect(ui.state()).toEqual({ mode: "idle" });
  });

  it("reveals again after a full idle cycle (repeatable Ask Again flow)", () => {
    const { ui, calls } = setup();
    ui.shake();
    ui.reveal("Outlook good");
    ui.askAgain();
    ui.shake();
    ui.reveal("Reply hazy, try again");
    expect(ui.state()).toEqual({ mode: "revealed", answer: "Reply hazy, try again" });
    expect(calls.map((s) => s.mode)).toEqual(["shaking", "revealed", "idle", "shaking", "revealed"]);
  });
});
