"use client";

import { useCallback, useEffect, useState } from "react";

const MOVES = ["rock", "paper", "scissors"] as const;
type Move = (typeof MOVES)[number];
type Outcome = "win" | "tie" | "loss";

const BEATS: Record<Move, Move> = {
  rock: "scissors",
  paper: "rock",
  scissors: "paper",
};

const KEYS: Record<string, Move> = {
  r: "rock",
  p: "paper",
  s: "scissors",
};

type Round = {
  id: number;
  player: Move;
  computer: Move;
  outcome: Outcome;
};

function getOutcome(player: Move, computer: Move): Outcome {
  if (player === computer) return "tie";
  return BEATS[player] === computer ? "win" : "loss";
}

function resultLine(round: Round) {
  if (round.outcome === "tie") return `We tied. I chose ${round.computer}.`;
  if (round.outcome === "win") return `You win! I chose ${round.computer}.`;
  return `You lose, haha! I chose ${round.computer}.`;
}

export function RockPaperScissorsGame() {
  const [rounds, setRounds] = useState<Round[]>([]);

  const play = useCallback((player: Move) => {
    const computer = MOVES[Math.floor(Math.random() * MOVES.length)];
    const round: Round = {
      id: Date.now() + Math.random(),
      player,
      computer,
      outcome: getOutcome(player, computer),
    };

    setRounds((current) => [round, ...current].slice(0, 8));
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
      const target = event.target as HTMLElement | null;
      if (
        target?.isContentEditable ||
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT"
      ) return;
      const move = KEYS[event.key.toLowerCase()];
      if (move) play(move);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [play]);

  const score = rounds.reduce(
    (totals, round) => ({ ...totals, [round.outcome]: totals[round.outcome] + 1 }),
    { win: 0, tie: 0, loss: 0 },
  );
  const latest = rounds[0];

  return (
    <section className="mt-14 md:mt-20" aria-labelledby="play-rock-paper-scissors">
      <div className="mx-auto w-full max-w-3xl px-5 sm:px-8">
        <h2
          id="play-rock-paper-scissors"
          className="text-2xl font-semibold tracking-tight text-fg"
        >
          Play it here
        </h2>
        <p className="mt-3 text-base leading-relaxed text-fg-muted">
          Choose a move or press <kbd className="font-mono text-fg">R</kbd>,{" "}
          <kbd className="font-mono text-fg">P</kbd>, or{" "}
          <kbd className="font-mono text-fg">S</kbd>.
        </p>

        <div className="mt-6 border-y border-border-default py-7">
          <fieldset>
            <legend className="text-base font-semibold text-fg">Choose your move</legend>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {MOVES.map((move) => (
                <button
                  key={move}
                  type="button"
                  onClick={() => play(move)}
                  className="btn btn-outline h-12 w-full justify-between bg-bg"
                  aria-label={`Play ${move}`}
                >
                  <span className="capitalize">{move}</span>
                  <kbd className="font-mono text-xs font-normal text-fg-faint">
                    {move[0].toUpperCase()}
                  </kbd>
                </button>
              ))}
            </div>
          </fieldset>

          <div
            className="mt-7 border-l-2 border-accent pl-4"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <p className="text-sm text-fg-muted">Result</p>
            <p className="mt-1 text-lg font-medium text-fg">
              {latest ? resultLine(latest) : "Make a choice to start."}
            </p>
            {latest ? (
              <p className="mt-1 text-sm text-fg-muted">
                You chose <span className="capitalize">{latest.player}</span>; the computer chose{" "}
                <span className="capitalize">{latest.computer}</span>.
              </p>
            ) : null}
          </div>

          <div className="mt-7 flex flex-wrap items-end justify-between gap-5">
            <dl className="flex gap-7 text-sm">
              <div><dt className="text-fg-muted">Wins</dt><dd className="mt-1 text-xl font-semibold text-fg">{score.win}</dd></div>
              <div><dt className="text-fg-muted">Ties</dt><dd className="mt-1 text-xl font-semibold text-fg">{score.tie}</dd></div>
              <div><dt className="text-fg-muted">Losses</dt><dd className="mt-1 text-xl font-semibold text-fg">{score.loss}</dd></div>
            </dl>
            {rounds.length > 0 ? (
              <button
                type="button"
                onClick={() => setRounds([])}
                className="link border-0 bg-transparent p-0 text-sm"
              >
                Reset score
              </button>
            ) : null}
          </div>
        </div>

        {rounds.length > 1 ? (
          <details className="mt-5 border-b border-border-default pb-5">
            <summary className="cursor-pointer text-sm text-fg-muted">
              Round history ({rounds.length})
            </summary>
            <ol className="mt-4 space-y-2 text-sm text-fg-muted">
              {rounds.map((round) => (
                <li key={round.id}>
                  You: {round.player} · Computer: {round.computer} · {round.outcome}
                </li>
              ))}
            </ol>
          </details>
        ) : null}
      </div>
    </section>
  );
}
