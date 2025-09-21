import { ParsedItem, SiteInfo } from "../shared/constants";

async function parseProducts(site: SiteInfo): Promise<ParsedItem[]> {
  const items = document.querySelectorAll(site.itemSelector);
  const results: ParsedItem[] = [];

  items.forEach((item) => {
    const currentPrice = extractPrice(item, site.priceSelector, site.hostname);
    const nameProduct = extractText(item, site.titleSelector) || "Нет названия";
    const { ratingProduct, reviewsProduct } = extractRatingAndReviews(
      item,
      site
    );
    const linkElement = item.querySelector(
      site.linkSelector
    ) as HTMLAnchorElement | null;
    const urlProduct = linkElement?.href?.split("?")[0] || "Нет ссылки";
    const imageElement = item.querySelector(
      site.imageSelector
    ) as HTMLImageElement | null;
    const imageProductUrl = imageElement?.src.trim() || "";

    if (nameProduct && currentPrice && urlProduct !== "Нет ссылки") {
      results.push({
        currentPrice,
        nameProduct,
        ratingProduct,
        reviewsProduct,
        urlProduct,
        imageProductUrl,
      });
    }
  });

  return results;
}

function extractPrice(
  item: Element,
  priceSelector: string,
  hostname: string
): string {
  const element = item.querySelector(priceSelector);
  if (!element) return "Нет цены";

  let text = "";

  if (hostname === "dns-shop.ru") {
    const textNode = Array.from(element.childNodes).find(
      (node) =>
        node.nodeType === Node.TEXT_NODE && node.textContent?.trim() !== ""
    );
    text = textNode?.textContent?.trim() || "";
  } else {
    text = element.textContent?.trim() || "";
  }

  return text.replace(/\s+/g, "").replace(/[^\d.-]/g, "");
}

function extractText(element: Element, selector: string): string | null {
  const el = element.querySelector(selector);
  return el?.textContent?.trim() || null;
}

function extractRatingAndReviews(
  item: Element,
  site: SiteInfo
): {
  ratingProduct: string;
  reviewsProduct: string;
} {
  if (!site.ratingReviewContainerSelector?.trim()) {
    return { ratingProduct: "", reviewsProduct: "" };
  }

  const container = item.querySelector(site.ratingReviewContainerSelector);
  if (!container) {
    return { ratingProduct: "", reviewsProduct: "" };
  }

  switch (site.hostname) {
    case "dns-shop.ru":
      return extractRatingFromDnsShop(container);

    case "citilink.ru":
      return extractRatingFromCitilink(container);

    default:
      return extractRatingFromGeneric(container);
  }
}

function extractRatingFromDnsShop(container: Element): {
  ratingProduct: string;
  reviewsProduct: string;
} {
  const fullText = container.textContent?.trim() || "";
  const ratingMatch = fullText.match(/^([\d.]+)\s*\|/);
  const reviewsMatch = fullText.match(/\|\s*(\d+)\s+отзыв(?:а|ов)?/i);

  return {
    ratingProduct: ratingMatch?.[1]?.trim() || "",
    reviewsProduct: reviewsMatch?.[1] || "",
  };
}

function extractRatingFromCitilink(container: Element): {
  ratingProduct: string;
  reviewsProduct: string;
} {
  const ratingDiv = container.querySelector(
    '[data-meta-name="MetaInfo_rating"]'
  );
  const reviewsDiv = container.querySelector(
    '[data-meta-name="MetaInfo_opinionsCount"]'
  );

  const getNumber = (text: string | undefined): string => {
    const match = text?.match(/(\d+\.?\d*)$/);
    return match?.[1] || "";
  };

  return {
    ratingProduct: getNumber(ratingDiv?.textContent),
    reviewsProduct: getNumber(reviewsDiv?.textContent),
  };
}

function extractRatingFromGeneric(container: Element): {
  ratingProduct: string;
  reviewsProduct: string;
} {
  const textSpans = Array.from(container.querySelectorAll("span")).filter(
    (span) =>
      span.textContent?.trim() && span.querySelectorAll("span").length === 0
  );

  const getCleanNumber = (text: string): string => text.replace(/\D/g, "");

  return {
    ratingProduct: textSpans[0]?.textContent?.trim() || "",
    reviewsProduct: getCleanNumber(textSpans[1]?.textContent?.trim() || ""),
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "RUN_PARSE_SCRIPT") {
    if (!sender.id || sender.id !== chrome.runtime.id) {
      return false;
    }

    const { site } = message;

    if (!site || !site.hostname) {
      sendResponse({ type: "PARSE_SCRIPT_DONE", data: [] });
      return true;
    }

    parseProducts(site)
      .then((results) => {
        sendResponse({
          type: "PARSE_SCRIPT_DONE",
          data: results,
        });
      })
      .catch((error) => {
        sendResponse({ type: "PARSE_SCRIPT_DONE", data: [] });
      });

    return true;
  }
});
