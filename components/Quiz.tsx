"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { QuizBook } from "@/lib/catalog";

type SectionLite = { slug: string; label: string; fiction: boolean };
type Option = { id: string; label: string; note: string };
type Answers = { mood?: string; goal?: string; time?: string; picks: string[]; form?: string };

const STORAGE_KEY = "quarto.quiz.v1";
const EMPTY: Answers = { picks: [] };

const MOODS: Option[] = [
  { id: "gripped", label: "Gripped", note: "Keep me turning pages." },
  { id: "moved", label: "Moved", note: "Make me feel something." },
  { id: "curious", label: "Curious", note: "Show me how things work." },
  { id: "steady", label: "Steady", note: "Calm, perspective, a long breath." },
  { id: "restless", label: "Restless", note: "Push me to act." },
];
const GOALS: Option[] = [
  { id: "escape", label: "Escape for a while", note: "Another life, another place." },
  { id: "understand", label: "Understand the world", note: "History, science, how societies work." },
  { id: "improve", label: "Change a habit", note: "Practical, usable this week." },
  { id: "faith", label: "Reflect on faith and meaning", note: "Belief, purpose, the inner life." },
  { id: "work", label: "Get better at work and money", note: "Decisions, companies, careers." },
];
const TIMES: Option[] = [
  { id: "short", label: "An evening or two", note: "Under about 250 pages." },
  { id: "medium", label: "A week of commutes", note: "Roughly 250–450 pages." },
  { id: "long", label: "A long project", note: "Happy inside a big book." },
  { id: "any", label: "Doesn’t matter", note: "Length is no object." },
];
const FORMS: Option[] = [
  { id: "stories", label: "Stories", note: "Novels and thrillers." },
  { id: "true", label: "True things", note: "Non-fiction, real lives, ideas." },
  { id: "either", label: "Either", note: "Whatever fits best." },
];

const MOOD_WEIGHTS: Record<string, Record<string, number>> = {
  gripped: { thriller: 3, "true-story": 2.5, history: 1, fiction: 1 },
  moved: { fiction: 3, biography: 2.5, "true-story": 1, islamic: 1 },
  curious: { science: 3, history: 2.5, "non-fiction": 2.5, business: 1, philosophy: 1 },
  steady: { philosophy: 3, islamic: 2.5, "self-help": 2, biography: 0.5 },
  restless: { "self-help": 3, business: 2.5, biography: 1, "true-story": 0.5 },
};
const GOAL_WEIGHTS: Record<string, Record<string, number>> = {
  escape: { thriller: 2.5, fiction: 2.5, "true-story": 1.5 },
  understand: { history: 2.5, science: 2.5, "non-fiction": 2, philosophy: 1 },
  improve: { "self-help": 3, business: 1, philosophy: 1 },
  faith: { islamic: 3.5, philosophy: 2, biography: 0.5 },
  work: { business: 3, "self-help": 1.5, "non-fiction": 1 },
};
const SECTION_WHY: Record<string, string> = {
  thriller: "a thriller with real pull, the kind that eats an evening",
  fiction: "a novel that stays with you after the last page",
  "non-fiction": "a clear argument about how people and societies actually work",
  islamic: "a widely read book for thinking about faith, the Prophet’s life, and the inner life",
  "true-story": "a true story told with a novelist’s pace",
  "self-help": "practical enough to change something this week",
  business: "useful thinking about decisions, companies, and money",
  history: "history told as a story, not a list of dates",
  science: "big science explained without talking down",
  biography: "a whole life, close up",
  philosophy: "a steadying book about how to think and how to live",
};
const GOAL_PHRASE: Record<string, string> = {
  escape: "get out of your own head for a while",
  understand: "understand how the world got this way",
  improve: "change a habit",
  faith: "reflect on faith and meaning",
  work: "get better at work and money",
};

function lengthFit(time: string | undefined, pages: number | null) {
  if (!time || time === "any" || !pages) return 0;
  if (time === "short") return pages <= 260 ? 1.6 : pages > 450 ? -1.6 : -0.3;
  if (time === "medium") return pages >= 230 && pages <= 460 ? 1.2 : pages > 650 ? -1 : 0;
  return pages >= 400 ? 1.6 : pages < 220 ? -0.6 : 0.2;
}

function recommend(pool: QuizBook[], sections: SectionLite[], a: Answers) {
  const fictionBySection = new Map(sections.map((s) => [s.slug, s.fiction]));
  const scored = pool.map((book) => {
    const fiction = fictionBySection.get(book.section) ?? false;
    let score = (MOOD_WEIGHTS[a.mood ?? ""]?.[book.section] ?? 0) + (GOAL_WEIGHTS[a.goal ?? ""]?.[book.section] ?? 0);
    if (a.picks.length) score += a.picks.includes(book.section) ? 3 : -2;
    if ((a.form === "stories" && !fiction) || (a.form === "true" && fiction)) score -= 6;
    score += lengthFit(a.time, book.pages);
    score += book.mustRead ? 1.2 : 0;
    score += book.weight * 0.35;
    return { book, score };
  });
  scored.sort((x, y) => y.score - x.score);
  const perSection = new Map<string, number>();
  const picks: QuizBook[] = [];
  for (const { book } of scored) {
    const n = perSection.get(book.section) ?? 0;
    if (n >= 2) continue;
    perSection.set(book.section, n + 1);
    picks.push(book);
    if (picks.length === 5) break;
  }
  return picks;
}

function reasons(book: QuizBook, a: Answers, sectionLabel: string) {
  const out: string[] = [];
  const moodHit = MOOD_WEIGHTS[a.mood ?? ""]?.[book.section] ?? 0;
  const goalHit = GOAL_WEIGHTS[a.goal ?? ""]?.[book.section] ?? 0;
  const mood = MOODS.find((m) => m.id === a.mood)?.label.toLowerCase();
  if (moodHit >= goalHit && moodHit > 0 && mood) out.push(`You want to feel ${mood}. This is ${SECTION_WHY[book.section]}.`);
  else if (goalHit > 0 && a.goal) out.push(`You said you want to ${GOAL_PHRASE[a.goal]}. This is ${SECTION_WHY[book.section]}.`);
  else out.push(`It’s ${SECTION_WHY[book.section]}.`);
  if (a.picks.includes(book.section)) out.push(`From ${sectionLabel}, one of the sections you picked.`);
  const fit = lengthFit(a.time, book.pages);
  if (book.pages && fit > 0) {
    const time = TIMES.find((t) => t.id === a.time)?.label.toLowerCase();
    out.push(`About ${book.pages} pages, which suits ${time}.`);
  }
  out.push(
    book.mustRead
      ? `A Quarto must-read: the full ${book.minutes}-minute essay is ready.`
      : "Start with the card: one line and three ideas, about a minute.",
  );
  return out.slice(0, 3);
}

function OptionGrid({
  options,
  selected,
  onPick,
  multi = false,
}: {
  options: Option[];
  selected: string[];
  onPick: (id: string) => void;
  multi?: boolean;
}) {
  return (
    <div className={multi ? "quiz-options multi" : "quiz-options"} role={multi ? "group" : "radiogroup"}>
      {options.map((option, i) => {
        const on = selected.includes(option.id);
        return (
          <button
            type="button"
            key={option.id}
            className={on ? "quiz-option on" : "quiz-option"}
            aria-pressed={on}
            onClick={() => onPick(option.id)}
          >
            <span className="quiz-key">{multi ? (on ? "✓" : "+") : String.fromCharCode(65 + i)}</span>
            <strong>{option.label}</strong>
            {option.note ? <small>{option.note}</small> : null}
          </button>
        );
      })}
    </div>
  );
}

export function Quiz({ pool, sections }: { pool: QuizBook[]; sections: SectionLite[] }) {
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
      if (saved?.answers) {
        setAnswers({ ...EMPTY, ...saved.answers });
        setDone(Boolean(saved.done));
        setStep(saved.done ? 4 : Math.min(saved.step ?? 0, 4));
      }
    } catch {
      // A corrupt or blocked localStorage just means starting fresh.
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, step, done }));
    } catch {
      // Private mode can refuse writes; the quiz still works for this visit.
    }
  }, [answers, step, done, restored]);

  const sectionOptions: Option[] = sections.map((s) => ({ id: s.slug, label: s.label, note: "" }));
  const labelFor = (slug: string) => sections.find((s) => s.slug === slug)?.label ?? slug;

  const questions = [
    { key: "mood", title: "How do you want to feel?", options: MOODS },
    { key: "goal", title: "What is this book for?", options: GOALS },
    { key: "time", title: "How much time do you have?", options: TIMES },
    { key: "picks", title: "Any shelves you already like?", options: sectionOptions, multi: true },
    { key: "form", title: "Stories or true things?", options: FORMS },
  ] as const;

  const results = useMemo(() => (done ? recommend(pool, sections, answers) : []), [done, pool, sections, answers]);

  function choose(key: "mood" | "goal" | "time" | "form", id: string) {
    setAnswers((prev) => ({ ...prev, [key]: id }));
    window.setTimeout(() => {
      if (step === questions.length - 1) setDone(true);
      else setStep((s) => Math.min(s + 1, questions.length - 1));
    }, 160);
  }

  function togglePick(id: string) {
    setAnswers((prev) => {
      const has = prev.picks.includes(id);
      const picks = has ? prev.picks.filter((p) => p !== id) : [...prev.picks, id].slice(-3);
      return { ...prev, picks };
    });
  }

  function restart() {
    setAnswers(EMPTY);
    setStep(0);
    setDone(false);
  }

  if (done) {
    const summary = [
      MOODS.find((m) => m.id === answers.mood)?.label,
      GOALS.find((g) => g.id === answers.goal)?.label,
      TIMES.find((t) => t.id === answers.time)?.label,
      ...answers.picks.map(labelFor),
      FORMS.find((f) => f.id === answers.form)?.label,
    ].filter(Boolean);
    return (
      <section className="quiz" id="quiz" aria-live="polite">
        <div className="quiz-head">
          <p className="quiz-kicker">
            <span className="tag">Your shortlist</span> Five books, picked from your answers
          </p>
          <div className="quiz-actions">
            <button type="button" className="quiz-link" onClick={() => { setDone(false); setStep(0); }}>
              Change answers
            </button>
            <button type="button" className="quiz-link" onClick={restart}>
              Start over
            </button>
          </div>
        </div>
        <h2 className="quiz-title">Start with one of these.</h2>
        <p className="quiz-summary">
          {summary.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </p>
        <ol className="quiz-results">
          {results.map((book, i) => (
            <li key={book.slug}>
              <Link href={`/books/${book.slug}`} className="quiz-result">
                <span className="quiz-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="quiz-thumb" style={{ background: book.wash, color: book.ink }}>
                  {book.thumbUrl ? <img src={book.thumbUrl} alt="" loading="lazy" /> : <b>{book.title}</b>}
                </span>
                <span className="quiz-result-copy">
                  <span className="quiz-result-meta">
                    {labelFor(book.section)}
                    {book.mustRead ? <em className="badge">Essay</em> : <em className="badge quiet">Card</em>}
                  </span>
                  <strong>{book.title}</strong>
                  <span className="quiz-result-by">{book.author}</span>
                  <span className="quiz-hook">{book.hook}</span>
                  <span className="quiz-why">
                    <b>Why it fits</b>
                    <span>
                      {reasons(book, answers, labelFor(book.section)).map((r) => (
                        <span key={r}>{r}</span>
                      ))}
                    </span>
                  </span>
                </span>
                <span className="arrow" aria-hidden>
                  →
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  const q = questions[step];
  const selected =
    q.key === "picks" ? answers.picks : answers[q.key] ? [answers[q.key] as string] : [];

  return (
    <section className="quiz" id="quiz">
      <div className="quiz-head">
        <p className="quiz-kicker">
          <span className="tag">Find your next book</span> Five questions · under a minute · no sign-up
        </p>
        <p className="quiz-count">
          {String(step + 1).padStart(2, "0")} <span>/ {String(questions.length).padStart(2, "0")}</span>
        </p>
      </div>
      <div className="quiz-progress" aria-hidden>
        {questions.map((item, i) => (
          <i key={item.key} className={i <= step ? "on" : ""} />
        ))}
      </div>
      <h2 className="quiz-title">{q.title}</h2>
      {q.key === "picks" ? (
        <>
          <p className="quiz-hint">Pick up to three, or skip.</p>
          <OptionGrid options={q.options} selected={selected} onPick={togglePick} multi />
        </>
      ) : (
        <OptionGrid
          options={q.options as readonly Option[] as Option[]}
          selected={selected}
          onPick={(id) => choose(q.key as "mood" | "goal" | "time" | "form", id)}
        />
      )}
      <div className="quiz-foot">
        <button type="button" className="quiz-link" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          ← Back
        </button>
        {q.key === "picks" ? (
          <button type="button" className="quiz-next" onClick={() => setStep(step + 1)}>
            {answers.picks.length ? "Next →" : "Skip →"}
          </button>
        ) : selected.length ? (
          <button
            type="button"
            className="quiz-next"
            onClick={() => (step === questions.length - 1 ? setDone(true) : setStep(step + 1))}
          >
            {step === questions.length - 1 ? "Show my books →" : "Next →"}
          </button>
        ) : null}
      </div>
    </section>
  );
}
