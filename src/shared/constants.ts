export interface ParsedItem {
  currentPrice: string;
  nameProduct: string;
  ratingProduct: string;
  reviewsProduct: string;
  urlProduct: string;
  imageProductUrl: string;
}

export interface ParseResultMessage {
  type: "PARSE_SCRIPT_DONE";
  data: ParsedItem[];
}

export interface SiteInfo {
  hostname: string;
  name: string;
  colorPrimary: string;
  colorSecondary: string;
  iconPrefix: string;
  itemSelector: string;
  priceSelector: string;
  titleSelector: string;
  ratingReviewContainerSelector: string;
  linkSelector: string;
  imageSelector: string;
}

export const SUPPORTED_SITES: SiteInfo[] = [
  {
    hostname: "ozon.ru",
    name: "Ozon",
    colorPrimary: "#005BFF",
    colorSecondary: "#FFFFFF",
    iconPrefix: "ozon",
    itemSelector: "div.tile-root",
    priceSelector: ".tsHeadline500Medium",
    titleSelector: ".tsBody500Medium",
    ratingReviewContainerSelector: "div.tsBodyMBold",
    linkSelector: "a.tile-clickable-element",
    imageSelector: "a.tile-clickable-element img",
  },
  {
    hostname: "wildberries.ru",
    name: "Wildberries",
    colorPrimary: "#7D29EE",
    colorSecondary: "#FFFFFF",
    iconPrefix: "wildberries",
    itemSelector: "div.product-card-list > article.product-card",
    priceSelector: ".price__lower-price",
    titleSelector: ".product-card__brand-wrap",
    ratingReviewContainerSelector: ".product-card__rating-wrap",
    linkSelector: ".product-card__link",
    imageSelector: "div.product-card__img-wrap img",
  },
  {
    hostname: "market.yandex.ru",
    name: "Яндекс.Маркет",
    colorPrimary: "#FFC107",
    colorSecondary: "#000000",
    iconPrefix: "yamarket",
    itemSelector: "article[data-auto=\"searchOrganic\"]",
    priceSelector: "[data-auto=\"snippet-price-current\"]",
    titleSelector: "[data-auto=\"snippet-title\"]",
    ratingReviewContainerSelector: "[data-zone-name=\"rating\"]",
    linkSelector: "a[data-auto=\"snippet-link\"]",
    imageSelector: "article[data-auto=\"searchOrganic\"] img",
  },
  {
    hostname: "mvideo.ru",
    name: "М.Видео",
    colorPrimary: "#E63946",
    colorSecondary: "#FFFFFF",
    iconPrefix: "mvideo",
    itemSelector: "mvid-product-card-list",
    priceSelector: ".price__main-value",
    titleSelector: ".product-title__text",
    ratingReviewContainerSelector: ".product-rating",
    linkSelector: "a.product-title__text",
    imageSelector: ".product-picture__img[loading='eager']",
  },
  {
    hostname: "citilink.ru",
    name: "Ситилинк",
    colorPrimary: "#FFFFFF",
    colorSecondary: "#ff5200",
    iconPrefix: "citilink",
    itemSelector: "div[data-meta-name=\"ProductHorizontalSnippet\"]",
    priceSelector: "[data-meta-is-total=\"notTotal\"]",
    titleSelector: "[data-meta-name=\"Snippet__title\"]",
    ratingReviewContainerSelector: "a[href$=\"/otzyvy/\"]",
    linkSelector: "[data-meta-name=\"Snippet__title\"]",
    imageSelector: "img[loading=\"eager\"]",
  },
  {
    hostname: "dns-shop.ru",
    name: "DNS",
    colorPrimary: "#ff5200",
    colorSecondary: "#FFFFFF",
    iconPrefix: "dns-shop",
    itemSelector: ".catalog-product",
    priceSelector: ".product-buy__price.product-buy__price_active",
    titleSelector: ".catalog-product__name",
    ratingReviewContainerSelector: ".catalog-product__rating",
    linkSelector: ".catalog-product__name",
    imageSelector: ".catalog-product__image-link img",
  },
];

export const headers = [
    "Название",
    "Цена",
    "Рейтинг",
    "Отзывы",
    "Ссылка",
    "URL изображения",
  ];
