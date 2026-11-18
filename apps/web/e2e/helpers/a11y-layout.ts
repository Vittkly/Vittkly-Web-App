import fs from "node:fs";
import path from "node:path";
import { expect, type Page } from "@playwright/test";

export interface ContrastFailure {
  text: string;
  tag: string;
  className: string;
  fg: string;
  bg: string;
  ratio: number;
  required: number;
}

export interface OverlapFailure {
  first: string;
  second: string;
  overlapWidth: number;
  overlapHeight: number;
}

export async function assertNoHorizontalOverflow(page: Page): Promise<void> {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(
    metrics.scrollWidth,
    `Horizontal overflow detected: scrollWidth=${metrics.scrollWidth} > innerWidth=${metrics.innerWidth}`,
  ).toBeLessThanOrEqual(metrics.innerWidth);
}

export async function assertNoOverlappingInteractiveControls(
  page: Page,
  scopeSelector = "body",
): Promise<void> {
  const overlaps = await page.evaluate((selector): OverlapFailure[] => {
    const root = document.querySelector(selector);
    if (!root) return [];

    const candidates = Array.from(
      root.querySelectorAll<HTMLElement>(
        'button, a[href], input, select, [role="tab"]',
      ),
    ).filter((el) => {
      const style = window.getComputedStyle(el);
      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        style.opacity === "0"
      ) {
        return false;
      }
      const rect = el.getBoundingClientRect();
      return rect.width > 1 && rect.height > 1;
    });

    const isFixedContext = (el: HTMLElement): string => {
      let cur: HTMLElement | null = el;
      while (cur) {
        const pos = window.getComputedStyle(cur).position;
        if (pos === "fixed" || pos === "sticky") {
          return cur.tagName + ":" + (cur.getAttribute("aria-label") || "");
        }
        cur = cur.parentElement;
      }
      return "flow";
    };

    const describeEl = (el: HTMLElement) =>
      `${el.tagName.toLowerCase()}[${(el.innerText || el.getAttribute("aria-label") || el.getAttribute("placeholder") || "").trim().slice(0, 30)}]`;

    const issues: OverlapFailure[] = [];
    for (let i = 0; i < candidates.length; i++) {
      for (let j = i + 1; j < candidates.length; j++) {
        const a = candidates[i];
        const b = candidates[j];
        if (a.contains(b) || b.contains(a)) continue;
        // Only compare controls in the same layout layer (e.g. both fixed bottom nav or both flow)
        if (isFixedContext(a) !== isFixedContext(b)) continue;

        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        const overlapW =
          Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
        const overlapH =
          Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
        if (overlapW > 2 && overlapH > 2) {
          issues.push({
            first: describeEl(a),
            second: describeEl(b),
            overlapWidth: Math.round(overlapW),
            overlapHeight: Math.round(overlapH),
          });
        }
      }
    }
    return issues;
  }, scopeSelector);

  expect(
    overlaps,
    `Overlapping interactive controls found: ${JSON.stringify(overlaps)}`,
  ).toEqual([]);
}

export async function assertNoUnintendedTextClipping(
  page: Page,
  selector: string,
): Promise<void> {
  const clipped = await page.evaluate((sel) => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(sel));
    const failures: Array<{
      text: string;
      scrollWidth: number;
      clientWidth: number;
    }> = [];
    for (const el of els) {
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") continue;
      if (el.clientWidth === 0) continue;
      if (el.scrollWidth > el.clientWidth + 2) {
        failures.push({
          text: (el.innerText || "").trim().slice(0, 60),
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
        });
      }
    }
    return failures;
  }, selector);

  expect(
    clipped,
    `Text unexpectedly clipped on selector "${selector}": ${JSON.stringify(clipped)}`,
  ).toEqual([]);
}

export async function assertWcagAaContrast(
  page: Page,
  selector: string,
): Promise<void> {
  const failures = await page.evaluate((sel): ContrastFailure[] => {
    function parseRgba(str: string): [number, number, number, number] | null {
      const m = str.match(
        /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i,
      );
      if (!m) return null;
      return [
        Number(m[1]),
        Number(m[2]),
        Number(m[3]),
        m[4] !== undefined ? Number(m[4]) : 1,
      ];
    }

    function blend(
      fg: [number, number, number, number],
      bg: [number, number, number],
    ): [number, number, number] {
      const a = fg[3];
      return [
        fg[0] * a + bg[0] * (1 - a),
        fg[1] * a + bg[1] * (1 - a),
        fg[2] * a + bg[2] * (1 - a),
      ];
    }

    function resolveEffectiveBackground(
      el: HTMLElement,
    ): [number, number, number] {
      const chain: [number, number, number, number][] = [];
      let cur: HTMLElement | null = el;
      while (cur) {
        const parsed = parseRgba(window.getComputedStyle(cur).backgroundColor);
        if (parsed && parsed[3] > 0) {
          chain.unshift(parsed);
        }
        cur = cur.parentElement;
      }
      const isDark =
        document.documentElement.getAttribute("data-theme") === "dark" ||
        document.documentElement.classList.contains("dark");
      let acc: [number, number, number] = isDark
        ? [10, 28, 39]
        : [243, 248, 250];
      for (const layer of chain) {
        acc = blend(layer, acc);
      }
      return acc;
    }

    function relLuminance([r, g, b]: [number, number, number]): number {
      const lin = [r, g, b].map((c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
    }

    function contrastRatio(
      a: [number, number, number],
      b: [number, number, number],
    ): number {
      const l1 = relLuminance(a);
      const l2 = relLuminance(b);
      const hi = Math.max(l1, l2);
      const lo = Math.min(l1, l2);
      return (hi + 0.05) / (lo + 0.05);
    }

    const els = Array.from(document.querySelectorAll<HTMLElement>(sel));
    const issues: ContrastFailure[] = [];

    for (const el of els) {
      const style = window.getComputedStyle(el);
      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        Number(style.opacity) === 0
      ) {
        continue;
      }
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;

      const text = (el.innerText || "").trim();
      if (!text) continue;

      const fgParsed = parseRgba(style.color);
      if (!fgParsed) continue;
      const bgRgb = resolveEffectiveBackground(el);
      const fgRgb =
        fgParsed[3] < 1
          ? blend(fgParsed, bgRgb)
          : ([fgParsed[0], fgParsed[1], fgParsed[2]] as [
              number,
              number,
              number,
            ]);

      const ratio = contrastRatio(fgRgb, bgRgb);
      const fontSize = parseFloat(style.fontSize || "14");
      const fontWeight = parseInt(style.fontWeight || "400", 10);
      const isLarge =
        fontSize >= 24 || (fontWeight >= 700 && fontSize >= 18.66);
      const required = isLarge ? 3.0 : 4.5;

      if (ratio < required) {
        issues.push({
          text: text.slice(0, 50),
          tag: el.tagName.toLowerCase(),
          className: typeof el.className === "string" ? el.className : "",
          fg: `rgb(${Math.round(fgRgb[0])}, ${Math.round(fgRgb[1])}, ${Math.round(fgRgb[2])})`,
          bg: `rgb(${Math.round(bgRgb[0])}, ${Math.round(bgRgb[1])}, ${Math.round(bgRgb[2])})`,
          ratio: Number(ratio.toFixed(2)),
          required,
        });
      }
    }
    return issues;
  }, selector);

  expect(
    failures,
    `WCAG AA contrast failures on "${selector}": ${JSON.stringify(failures, null, 2)}`,
  ).toEqual([]);
}

export function collectTsxFiles(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) return [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "__tests__" || entry.name === "node_modules") continue;
      files.push(...collectTsxFiles(full));
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

export function scanFilesForTokenViolations(
  filePaths: string[],
  repoRoot: string,
): Array<{ file: string; line: number; match: string }> {
  const violations: Array<{ file: string; line: number; match: string }> = [];
  const hexRegex = /#[0-9a-fA-F]{3,8}\b/;
  const forbiddenClassRegex = /\b(text-kleanly|bg-blue-\d+|text-blue-\d+)\b/;

  for (const filePath of filePaths) {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split(/\r?\n/);
    lines.forEach((line, idx) => {
      const hexMatch = line.match(hexRegex);
      if (hexMatch) {
        violations.push({
          file: path.relative(repoRoot, filePath),
          line: idx + 1,
          match: hexMatch[0],
        });
      }
      const forbiddenMatch = line.match(forbiddenClassRegex);
      if (forbiddenMatch) {
        violations.push({
          file: path.relative(repoRoot, filePath),
          line: idx + 1,
          match: forbiddenMatch[0],
        });
      }
      if (
        /\btext-white\b/.test(line) &&
        /\b(bg-primary|bg-success|bg-danger|bg-primary-ink)\b/.test(line)
      ) {
        violations.push({
          file: path.relative(repoRoot, filePath),
          line: idx + 1,
          match: "text-white paired with semantic bg-primary/success/danger",
        });
      }
    });
  }
  return violations;
}
