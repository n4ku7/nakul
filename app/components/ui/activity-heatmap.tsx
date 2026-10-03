"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import styles from "./activity-heatmap.module.css";

export interface ActivityDay { date: string; count: number; }
export interface ActivityHeatmapProps {
  days: ActivityDay[]; label: string; period: string;
  unit?: { one: string; other: string }; thresholds?: [number, number, number];
  weekStartsOn?: 0 | 1; selectedDate?: string | null; onSelectDate?: (date: string) => void;
  actions?: ReactNode; locale?: string; className?: string;
}

type Model = { start: number; length: number; lead: number; weeks: number; total: number; counts: number[]; levels: number[]; thresholds: [number, number, number]; months: { col: number; label: string }[]; perLevel: number[]; };
const DAY = 86400000;
const toUtc = (date: string) => Date.parse(`${date}T00:00:00Z`);
const toIso = (time: number) => new Date(time).toISOString().slice(0, 10);
const noun = (count: number, unit: { one: string; other: string }) => count === 1 ? unit.one : unit.other;

function buildModel(days: ActivityDay[], weekStartsOn: 0 | 1, thresholds: [number, number, number] | undefined, locale: string): Model {
  const dates = days.map(day => toUtc(day.date)).filter(Number.isFinite);
  const start = dates.length ? Math.min(...dates) : toUtc("2025-01-01");
  const length = dates.length ? Math.round((Math.max(...dates) - start) / DAY) + 1 : 0;
  const counts = new Array<number>(length).fill(0);
  days.forEach(day => { const index = Math.round((toUtc(day.date) - start) / DAY); if (index >= 0 && index < length) counts[index] += Math.max(0, day.count); });
  const max = Math.max(0, ...counts);
  const bounds = thresholds ?? [Math.max(1, Math.ceil(max * .25)), Math.max(2, Math.ceil(max * .5)), Math.max(3, Math.ceil(max * .75))];
  const levels = counts.map(count => count <= 0 ? 0 : count <= bounds[0] ? 1 : count <= bounds[1] ? 2 : count <= bounds[2] ? 3 : 4);
  const lead = (new Date(start).getUTCDay() - weekStartsOn + 7) % 7;
  const weeks = Math.max(1, Math.ceil((lead + length) / 7));
  const formatter = new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" });
  const months: Model["months"] = [];
  for (let index = 0; index < length; index++) { const date = new Date(start + index * DAY); if (index === 0 || date.getUTCDate() === 1) months.push({ col: Math.floor((lead + index) / 7), label: formatter.format(date) }); }
  if (months.length > 1 && months[1].col - months[0].col < 3) months.shift();
  const perLevel = [0, 0, 0, 0, 0]; levels.forEach(level => perLevel[level]++);
  return { start, length, lead, weeks, total: counts.reduce((a, b) => a + b, 0), counts, levels, thresholds: bounds, months, perLevel };
}

export default function ActivityHeatmap({ days, label, period, unit = { one: "contribution", other: "contributions" }, thresholds, weekStartsOn = 0, selectedDate = null, onSelectDate, actions, locale = "en-US", className }: ActivityHeatmapProps) {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null); const gridRef = useRef<HTMLDivElement>(null); const plotRef = useRef<HTMLDivElement>(null); const scrollerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(plotRef, { once: true, amount: .35 });
  const model = useMemo(() => buildModel(days, weekStartsOn, thresholds, locale), [days, locale, thresholds, weekStartsOn]);
  const formatter = useMemo(() => new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }), [locale]);
  const number = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const [reveal, setReveal] = useState(false); const [focusIndex, setFocusIndex] = useState<number | null>(null); const [highlight, setHighlight] = useState<number | null>(null); const [tip, setTip] = useState<{ index: number; x: number; y: number } | null>(null);
  const selectedIndex = selectedDate ? Math.round((toUtc(selectedDate) - model.start) / DAY) : -1;
  const hasSelection = selectedIndex >= 0 && selectedIndex < model.length;
  const tabIndexDay = focusIndex !== null ? focusIndex : hasSelection ? selectedIndex : Math.max(0, model.length - 1);
  useEffect(() => { if (inView || reduced) setReveal(true); }, [inView, reduced]);
  const showTip = (index: number, target: HTMLElement) => { const root = rootRef.current; if (!root) return; const box = root.getBoundingClientRect(); const cell = target.getBoundingClientRect(); setTip({ index, x: cell.left - box.left + cell.width / 2, y: cell.top - box.top }); };
  const focusDay = (index: number) => gridRef.current?.querySelector<HTMLElement>(`[data-index="${index}"]`)?.focus();
  const indexFromEvent = (event: { target: EventTarget | null }) => { const element = event.target as HTMLElement; const cell = element.closest<HTMLElement>("[data-index]"); return cell ? Number(cell.dataset.index) : null; };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => { const index = indexFromEvent(event); if (index === null) return; const moves: Record<string, number> = { ArrowUp: index - 1, ArrowDown: index + 1, ArrowLeft: index - 7, ArrowRight: index + 7, Home: 0, End: model.length - 1 }; if (event.key in moves) { event.preventDefault(); focusDay(Math.min(Math.max(moves[event.key], 0), model.length - 1)); } else if ((event.key === "Enter" || event.key === " ") && onSelectDate) { event.preventDefault(); onSelectDate(toIso(model.start + index * DAY)); } };
  const weekdayLabels = useMemo(() => ["", "Tue", "", "Thu", "", "Sat", ""].map((text, index) => ({ text, index })), []);
  const cells = useMemo(() => Array.from({ length: 7 }, (_, row) => <div key={row} role="row" className={styles.row}>{Array.from({ length: model.weeks }, (_, col) => { const index = col * 7 + row - model.lead; if (index < 0 || index >= model.length) return <span key={col} className={styles.cell} aria-hidden="true" />; const date = new Date(model.start + index * DAY); return <span key={col} role="gridcell" tabIndex={index === tabIndexDay ? 0 : -1} className={styles.cell} data-index={index} data-level={model.levels[index]} aria-selected={onSelectDate ? index === selectedIndex : undefined} aria-label={`${model.counts[index] ? number.format(model.counts[index]) : "No"} ${noun(model.counts[index], unit)}, ${formatter.format(date)}`} onClick={() => onSelectDate?.(toIso(date.getTime()))} />; })}</div>), [formatter, model, number, onSelectDate, selectedIndex, tabIndexDay, unit]);
  const [a, b, c] = model.thresholds;
  const ranges = ["no activity", a === 1 ? `1 ${unit.one}` : `1 to ${a} ${unit.other}`, `${a + 1} to ${b} ${unit.other}`, `${b + 1} to ${c} ${unit.other}`, `${c + 1} or more ${unit.other}`];
  const caption = highlight === null ? "" : `${number.format(model.perLevel[highlight])} ${model.perLevel[highlight] === 1 ? "day" : "days"} with ${ranges[highlight]}`;
  return <div ref={rootRef} className={[styles.root, className].filter(Boolean).join(" ")}>
    <div className={styles.header}><p className={styles.summary}><span className={styles.total}>{number.format(model.total)} {noun(model.total, unit)}</span> <span className={styles.period}>in {period}</span></p>{actions && <div className={styles.actions}>{actions}</div>}</div>
    <div ref={scrollerRef} className={styles.scroller}><div className={styles.canvas} style={{ "--weeks": model.weeks } as CSSProperties}><div className={styles.months} aria-hidden="true">{model.months.map((month, index) => <span key={`${month.label}-${index}`} className={styles.month} style={{ "--col": month.col } as CSSProperties}>{month.label}</span>)}</div><div className={styles.weekdays} aria-hidden="true">{weekdayLabels.map(({ text, index }) => <span key={index} className={styles.weekday}>{text}</span>)}</div><div ref={plotRef} className={styles.plot}><div ref={gridRef} role="grid" aria-label={label} aria-describedby={`${label}-legend`} className={styles.grid} data-reveal={reveal ? "revealing" : "hidden"} data-highlight={highlight ?? undefined} onPointerOver={event => { const index = indexFromEvent(event); const target = (event.target as HTMLElement).closest<HTMLElement>("[data-index]"); if (index !== null && target) showTip(index, target); }} onFocus={event => { const index = indexFromEvent(event); const target = (event.target as HTMLElement).closest<HTMLElement>("[data-index]"); if (index !== null && target) { setFocusIndex(index); showTip(index, target); } }} onBlur={event => { if (!gridRef.current?.contains(event.relatedTarget as Node)) setTip(null); }} onKeyDown={onKeyDown}>{cells}</div>{hasSelection && <span className={styles.ring} data-shown="true" style={{ "--col": Math.floor((selectedIndex + model.lead) / 7), "--row": (selectedIndex + model.lead) % 7 } as CSSProperties} aria-hidden="true" />}</div></div></div>
    <div className={styles.legend}><span className={styles.caption} aria-live="polite">{caption}</span><span className={styles.scale}><span className={styles.legendText}>Less</span><span className={styles.swatches} role="group" aria-label="Highlight days by level" onKeyDown={event => { if (event.key === "Escape") setHighlight(null); }}>{[0, 1, 2, 3, 4].map(level => <button key={level} type="button" className={styles.swatch} data-level={level} aria-pressed={highlight === level} aria-label={`Highlight days with ${ranges[level]}`} onClick={() => setHighlight(current => current === level ? null : level)} onPointerEnter={() => setHighlight(level)} onPointerLeave={() => setHighlight(null)} />)}</span><span className={styles.legendText}>More</span></span></div>
    {tip && <motion.div className={styles.tip} style={{ x: tip.x, y: tip.y }} initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }}><div className={styles.bubble}><span className={styles.tipPrimary}>{model.counts[tip.index] ? `${number.format(model.counts[tip.index])} ${noun(model.counts[tip.index], unit)}` : `No ${unit.other}`}</span><span className={styles.tipSecondary}>{formatter.format(new Date(model.start + tip.index * DAY))}</span></div></motion.div>}
    <span id={`${label}-legend`} className={styles.srOnly}>Darker squares mean more {unit.other}. Levels: {ranges.join(", ")}.</span>
  </div>;
}
