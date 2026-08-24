// ────────────────────────────────────────────────────────────
// 點陣類共用隨機引擎：非洲土占／西方土占都用這一份邏輯。
//
// 傳統做法：隨機戳出一連串的點（現代常用擲筆或亂數代替），每一條線最後
// 只看「單點／雙點」（傳統上是看點數的奇偶：奇數＝單點，偶數＝雙點）。
// 4 條線組成一個「Mother 圖形」，隨機產生 4 個 Mother 之後，剩下的
// Daughters／Nieces／Witnesses／Judge 全部是機械式規則推算出來的，
// 不需要、也不應該再摻入額外的隨機性——跟 I Ching 從變爻推出之卦是
// 同一種「先隨機、再機械推算」的邏輯（見 ichingEngine.ts 的 resolveHexagram）。
//
// 隨機的部分沿用 coinFlipHeads()（跟 I Ching 起卦引擎判斷正反面用的是
// 同一個函式），不重新發明一套隨機邏輯。
//
// 這裡故意不附上每個圖形的傳統拉丁文名稱（Via／Populus…）——16 個名稱各自
// 對應哪一組單點／雙點組合，不同文獻的呈現順序不完全一致，與其憑記憶附上
// 可能有誤的對照表，不如把「單點／雙點」這個客觀、可驗證的圖形本身完整交給
// AI，由 AI 自己用它的傳統對照知識判斷名稱——這是解讀的一部分，不是隨機生成
// 的一部分，本來就該交給 AI。
//
// 重要：這個檔案完全不接觸「使用者的問題文字」，任何函式都不會、也不應該
// 收到 question 這個參數，確保產生的圖形不受問題內容影響。
// ────────────────────────────────────────────────────────────
import type { DrawResult, ReadingResult } from "@/types/randomDraw";
import { coinFlipHeads } from "./shuffle";

export type GeomancyLine = "single" | "double";
export type GeomancyFigure = readonly [GeomancyLine, GeomancyLine, GeomancyLine, GeomancyLine];

/** 產生一條線：對應傳統「戳點數的奇偶」，這裡直接用一次公平擲幣代替（結果分布完全等價） */
export function tossGeomanticLine(): GeomancyLine {
  return coinFlipHeads() ? "single" : "double";
}

/** 產生一個 Mother 圖形：獨立擲 4 條線，由上往下 */
export function generateMotherFigure(): GeomancyFigure {
  return [tossGeomanticLine(), tossGeomanticLine(), tossGeomanticLine(), tossGeomanticLine()];
}

/**
 * 傳統的「土占加法」規則：兩條線相加，同者（都是單點或都是雙點）得雙點，
 * 異者（一單一雙）得單點。這是機械式規則，套用在兩個圖形的每一條線上。
 */
export function combineLines(a: GeomancyLine, b: GeomancyLine): GeomancyLine {
  return a === b ? "double" : "single";
}

export function combineFigures(a: GeomancyFigure, b: GeomancyFigure): GeomancyFigure {
  return [combineLines(a[0], b[0]), combineLines(a[1], b[1]), combineLines(a[2], b[2]), combineLines(a[3], b[3])];
}

/** 把 4 個 Mother 圖形「轉置」成 4 個 Daughter 圖形：Daughter i 由每個 Mother 的第 i 條線組成 */
export function deriveDaughters(mothers: readonly [GeomancyFigure, GeomancyFigure, GeomancyFigure, GeomancyFigure]): [
  GeomancyFigure,
  GeomancyFigure,
  GeomancyFigure,
  GeomancyFigure,
] {
  return [0, 1, 2, 3].map((i) => [mothers[0][i], mothers[1][i], mothers[2][i], mothers[3][i]] as GeomancyFigure) as [
    GeomancyFigure,
    GeomancyFigure,
    GeomancyFigure,
    GeomancyFigure,
  ];
}

export interface GeomancyChart {
  mothers: [GeomancyFigure, GeomancyFigure, GeomancyFigure, GeomancyFigure];
  daughters: [GeomancyFigure, GeomancyFigure, GeomancyFigure, GeomancyFigure];
  nieces: [GeomancyFigure, GeomancyFigure, GeomancyFigure, GeomancyFigure];
  rightWitness: GeomancyFigure;
  leftWitness: GeomancyFigure;
  judge: GeomancyFigure;
}

/** 產生 4 個隨機 Mother 圖形，並依傳統規則機械式推算出完整的 15 圖形圖表 */
export function castGeomanticChart(): GeomancyChart {
  const mothers: [GeomancyFigure, GeomancyFigure, GeomancyFigure, GeomancyFigure] = [
    generateMotherFigure(),
    generateMotherFigure(),
    generateMotherFigure(),
    generateMotherFigure(),
  ];
  const daughters = deriveDaughters(mothers);

  const nieces: [GeomancyFigure, GeomancyFigure, GeomancyFigure, GeomancyFigure] = [
    combineFigures(mothers[0], mothers[1]),
    combineFigures(mothers[2], mothers[3]),
    combineFigures(daughters[0], daughters[1]),
    combineFigures(daughters[2], daughters[3]),
  ];

  const rightWitness = combineFigures(nieces[0], nieces[1]);
  const leftWitness = combineFigures(nieces[2], nieces[3]);
  const judge = combineFigures(rightWitness, leftWitness);

  return { mothers, daughters, nieces, rightWitness, leftWitness, judge };
}

/** 把圖形轉成人眼／Prompt 都好讀的文字，例如 "• / •• / • / •"（由上往下） */
function figureToText(figure: GeomancyFigure): string {
  return figure.map((line) => (line === "single" ? "•" : "••")).join(" / ");
}

const motherLabels = ["Mother I", "Mother II", "Mother III", "Mother IV"];
const daughterLabels = ["Daughter I", "Daughter II", "Daughter III", "Daughter IV"];
const nieceLabels = ["Niece I", "Niece II", "Niece III", "Niece IV"];

/** 把完整圖表轉成跟卡牌類共用的 ReadingResult 形狀，讓歷史紀錄／Prompt 產生邏輯可以共用 */
export function toReadingResult(chart: GeomancyChart): ReadingResult {
  const results: DrawResult[] = [
    ...chart.mothers.map((f, i) => figureResult(motherLabels[i], f, i)),
    ...chart.daughters.map((f, i) => figureResult(daughterLabels[i], f, i + 4)),
    ...chart.nieces.map((f, i) => figureResult(nieceLabels[i], f, i + 8)),
    figureResult("Right Witness", chart.rightWitness, 12),
    figureResult("Left Witness", chart.leftWitness, 13),
    figureResult("Judge", chart.judge, 14),
  ];

  return {
    method: "geomantic-generation",
    deckName: "Geomantic Shield Chart (4 random Mothers + derived Daughters/Nieces/Witnesses/Judge)",
    drawnAt: new Date().toISOString(),
    results,
  };
}

function figureResult(label: string, figure: GeomancyFigure, positionIndex: number): DrawResult {
  return {
    itemId: label.toLowerCase().replace(/\s+/g, "-"),
    itemName: figureToText(figure),
    positionIndex,
    positionLabel: label,
  };
}
