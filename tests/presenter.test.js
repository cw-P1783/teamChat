import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

const html = readFileSync("docs/presenter.html", "utf8");

function open(url = "http://127.0.0.1:4173/") {
  return new JSDOM(html, { runScripts: "dangerously", url });
}

describe("presentation language switching", () => {
  it("preserves the slide, flow return point, and language when reloading", () => {
    const dom = open("http://127.0.0.1:4173/#9");
    try {
      const { document, Event } = dom.window;
      const language = document.querySelector("#language-select");
      language.value = "en";
      language.dispatchEvent(new Event("change"));
      expect(document.documentElement.lang).toBe("en");
      expect(document.querySelector("#counter")?.textContent).toBe("10 / 13");
      expect(document.querySelector("pre")?.textContent).toContain("workshop:conflict:en");
      expect(document.querySelector("#next")?.getAttribute("aria-label")).toBe("Next slide");
      expect(document.title).toContain("Team Chat Workshop");
      expect(dom.window.location.search).toBe("?lang=en");
      expect(dom.window.location.hash).toBe("#9");

      const reloaded = open(dom.window.location.href);
      expect(reloaded.window.document.documentElement.lang).toBe("en");
      expect(reloaded.window.document.querySelector("#counter")?.textContent).toBe("10 / 13");
      reloaded.window.close();

      document.querySelector("#flow-button").click();
      expect(document.querySelector("img")?.getAttribute("src")).toBe("git-flow.en.svg");
      language.value = "ko";
      language.dispatchEvent(new Event("change"));
      expect(document.querySelector("img")?.getAttribute("src")).toBe("git-flow.svg");
      expect(document.querySelector("img")?.getAttribute("alt")).toContain("협업");
      document.querySelector("#flow-button").click();
      expect(document.querySelector("#counter")?.textContent).toBe("10 / 13");
      expect(document.querySelector("pre")?.textContent).toContain("실습방");
    } finally {
      dom.window.close();
    }
  });

  it("navigates all slides in both languages without hijacking language selection keys", () => {
    for (const language of ["ko", "en"]) {
      const dom = open(`http://127.0.0.1:4173/?lang=${language}`);
      try {
        const { document, KeyboardEvent } = dom.window;
        expect(document.querySelectorAll("#slide-select option")).toHaveLength(13);
        expect(document.querySelector("h1")?.textContent).toBe("Git & GitHub: From First Commit to First Pull Request");
        document.querySelector("#flow-button").click();
        expect(document.querySelector(".flow-image")).toBeTruthy();
        document.querySelector("#flow-button").click();
        expect(document.querySelector("#stage").className).toBe("cover");
        const key = (key) => document.body.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
        for (let i = 1; i < 13; i++) {
          key("ArrowRight");
          expect(document.querySelector("#counter")?.textContent).toBe(`${i + 1} / 13`);
          if (i === 1) expect(document.querySelector(".flow-image")).toBeTruthy();
          else expect(document.querySelector(".subtitle")?.textContent).toBeTruthy();
        }
        expect(document.querySelector("#next").disabled).toBe(true);
        expect(document.querySelector("h1")?.textContent).toBe("GitHub Issues");
        key("ArrowLeft");
        expect(document.querySelector("h1")?.textContent).toBe("GitHub CLI Setup");
        expect(document.querySelector(".install-steps")?.textContent).toContain("brew install gh");
        expect(document.querySelector(".install-steps")?.textContent).toContain("winget install");
        expect(document.querySelector(".code-card pre")?.textContent).toContain("Install GitHub CLI (gh)");
        expect(document.querySelector(".code-card pre")?.textContent).toContain("gh auth status");
        key("ArrowRight");
        document.querySelector("#flow-button").click();
        document.querySelector("#flow-button").click();
        expect(document.querySelector("#counter")?.textContent).toBe("13 / 13");
        key("Home");
        expect(document.querySelector("#previous").disabled).toBe(true);
        document.querySelector("#language-select").dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
        expect(document.querySelector("#counter")?.textContent).toBe("1 / 13");
      } finally {
        dom.window.close();
      }
    }
  });

  it("falls back to Korean for an unknown language", () => {
    const dom = open("http://127.0.0.1:4173/?lang=unknown");
    expect(dom.window.document.documentElement.lang).toBe("ko");
    dom.window.close();
  });
});
