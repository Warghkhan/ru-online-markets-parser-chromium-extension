import { handleSaveBtnClick } from "../shared/saver";
import {
  headers,
  ParsedItem,
  SiteInfo,
  SUPPORTED_SITES,
} from "../shared/constants";

const getBtn = document.querySelector(".get-data-btn") as HTMLButtonElement;
const xlsxBtn = document.querySelector(".btn-export.xlsx") as HTMLButtonElement;
const txtBtn = document.querySelector(".btn-export.txt") as HTMLButtonElement;
const jsonBtn = document.querySelector(".btn-export.json") as HTMLButtonElement;
const infoBox = document.querySelector(".info-box") as HTMLElement;
const siteList = document.querySelector(".site-list") as HTMLElement;
const exportButtons = document.querySelector(".export-buttons") as HTMLElement;
const iconElement = document.getElementById(
  "extension-icon"
) as HTMLImageElement;
const instructionBtn = document.querySelector(
  ".btn-instruction"
) as HTMLButtonElement;
const titleElement = document.getElementById("site-title") as HTMLElement;

const SITE_CLASS_MAP: Record<string, string> = {
  Ozon: "ozon",
  Wildberries: "wildberries",
  "Яндекс.Маркет": "yandex-market",
  "М.Видео": "mvideo",
  Ситилинк: "citilink",
  DNS: "dns-shop",
};

const initDOM = () => {
  if (
    !getBtn ||
    !infoBox ||
    !siteList ||
    !exportButtons ||
    !iconElement ||
    !instructionBtn ||
    !titleElement
  ) {
    throw new Error("Не все элементы DOM найдены");
  }
};

async function getCurrentTab(): Promise<{ url: string }> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) throw new Error("Нет активной вкладки или URL не загружен");
  return { url: tab.url };
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch (e) {
    return "";
  }
}

function findSite(hostname: string): SiteInfo | undefined {
  return SUPPORTED_SITES.find((site) => hostname === site.hostname);
}

function updateUIFromSite(site: SiteInfo | undefined) {
  const isActive = !!site;

  const resetIcon = () => {
    chrome.action.setIcon({ path: { 128: "/assets/icons/icon128.png" } });
    chrome.action.setBadgeText({ text: "" });
    chrome.action.setBadgeBackgroundColor({ color: "#ccc" });
    if (iconElement) iconElement.src = "/assets/icons/icon128.png";
  };

  const setSiteIcon = (site: SiteInfo) => {
    const iconPath = `/assets/icons/${site.iconPrefix}-128.png`;
    chrome.action.setIcon({ path: { 128: iconPath } });
    chrome.action.setBadgeText({ text: "P" });
    chrome.action.setBadgeBackgroundColor({ color: site.colorPrimary });
    if (iconElement) iconElement.src = iconPath;
  };

  if (isActive && site) {
    setSiteIcon(site);
    if (titleElement)
      titleElement.textContent = `${site.name}  |  RuPriceParser`;
    infoBox.style.display = "none";
    siteList.style.display = "none";
    exportButtons.style.display = "grid";
    instructionBtn.style.display = "block";
    document.body.classList.add("active");

    getBtn.textContent = "Получить данные";
    getBtn.classList.remove("parsing", "parsed");
    getBtn.classList.add("default");
    getBtn.disabled = false;
  } else {
    resetIcon();
    if (titleElement) titleElement.textContent = "RuPriceParser";
    infoBox.style.display = "block";
    siteList.style.display = "grid";
    exportButtons.style.display = "none";
    instructionBtn.style.display = "block";
    document.body.classList.remove("active");

    getBtn.textContent = "Получить данные";
    getBtn.classList.remove("parsing", "parsed");
    getBtn.classList.add("default");
    getBtn.disabled = true;
  }

  document.querySelectorAll(".btn-site").forEach((button) => {
    const text = button.textContent?.trim();
    if (!text) return;
    button.classList.remove(...Object.values(SITE_CLASS_MAP));
    const className = SITE_CLASS_MAP[text];
    if (className) button.classList.add(className);
  });
}

async function updateUI() {
  try {
    const { url } = await getCurrentTab();
    const hostname = getHostname(url);
    const site = findSite(hostname);
    updateUIFromSite(site);
  } catch (error) {
    updateUIFromSite(undefined);
  }
}

const handleGetBtnClick = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    alert("Не удалось получить активную вкладку");
    resetBtnState();
    return;
  }

  const { url } = await getCurrentTab();
  const hostname = getHostname(url);
  const site = findSite(hostname);

  getBtn.textContent = "Получение информации...";
  getBtn.classList.remove("parsed", "default");
  getBtn.classList.add("parsing");
  getBtn.disabled = true;

  chrome.tabs
    .sendMessage(tab.id, {
      type: "RUN_PARSE_SCRIPT",
      site: site,
    })
    .then((response) => {
      if (!response) {
        resetBtnState();
        return;
      }

      if (response.type !== "PARSE_SCRIPT_DONE") {
        resetBtnState();
        return;
      }

      if (!Array.isArray(response.data)) {
        resetBtnState();
        return;
      }

      localStorage.setItem("parsedData", JSON.stringify(response.data));

      const storedData = localStorage.getItem("parsedData");
      const parsedData = storedData ? JSON.parse(storedData) : [];
      const countItems = Array.isArray(parsedData) ? parsedData.length : 0;

      getBtn.textContent = `Обнаружено ${countItems} товаров. Повторить поиск?`;
      getBtn.classList.remove("parsing", "default");
      getBtn.classList.add("parsed");
      getBtn.disabled = false;
    })
    .catch((error) => {
      alert("Сайт блокирует парсинг. Перезагрузите страницу.");
      resetBtnState();
    });
};

function resetBtnState() {
  getBtn.textContent = "Получить данные";
  getBtn.classList.remove("parsing", "parsed");
  getBtn.classList.add("default");
  getBtn.disabled = false;
}

function initEventListeners() {
  document.querySelectorAll(".btn-site").forEach((button) => {
    button.addEventListener("click", (e) => {
      const url = (e.currentTarget as HTMLElement).getAttribute("data-url");
      if (url) window.open(url, "_blank");
    });
  });

  instructionBtn.addEventListener("click", (e) => {
    const url = (e.currentTarget as HTMLElement).getAttribute("data-url");
    if (url) window.open(url, "_blank");
  });

  document.querySelectorAll(".footer-button").forEach((button) => {
    button.addEventListener("click", (e) => {
      const url = (e.currentTarget as HTMLElement).getAttribute("data-url");
      if (url) window.open(url, "_blank");
    });
  });

  xlsxBtn?.addEventListener("click", () => handleSaveBtnClick("xls"));
  txtBtn?.addEventListener("click", () => handleSaveBtnClick("txt"));
  jsonBtn?.addEventListener("click", () => handleSaveBtnClick("json"));

  getBtn?.addEventListener("click", handleGetBtnClick);
}

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("parsedData")) localStorage.removeItem("parsedData");
  initDOM();
  updateUI();

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab?.active && tab.url) {
      setTimeout(updateUI, 100);
    }
  });

  initEventListeners();
});
