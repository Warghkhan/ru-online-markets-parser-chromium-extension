import { ParsedItem, headers } from "./constants";

export function handleSaveBtnClick(saveFormat: "txt" | "json" | "xls") {
  const storedData = localStorage.getItem("parsedData");
  if (!storedData) {
    alert("Нет сохранённых данных для экспорта. Сначала получите данные.");
    return;
  }

  let parsedData: ParsedItem[];
  try {
    parsedData = JSON.parse(storedData);
  } catch (e) {
    alert("Ошибка при чтении данных. Попробуйте снова получить данные.");
    return;
  }

  if (!Array.isArray(parsedData)) {
    alert("Данные повреждены: ожидается массив товаров.");
    return;
  }

  if (parsedData.length === 0) {
    alert("Нет товаров для экспорта.");
    return;
  }

  let filename: string;
  let content: string;

  switch (saveFormat) {
    case "txt":
      const rows = parsedData.map(
        (item) =>
          `${item.nameProduct}\t${item.currentPrice}\t${
            item.ratingProduct || "0"
          }\t${item.reviewsProduct || "0"}\t${item.urlProduct}\t${
            item.imageProductUrl
          }`
      );
      content = [headers.join("\t"), ...rows].join("\n");
      filename = generateFilename("txt");
      break;

    case "json":
      const mappedData = parsedData.map((item) => ({
        [headers[0]]: item.nameProduct,
        [headers[1]]: item.currentPrice,
        [headers[2]]: item.ratingProduct || "0",
        [headers[3]]: item.reviewsProduct || "0",
        [headers[4]]: item.urlProduct,
        [headers[5]]: item.imageProductUrl,
      }));
      content = JSON.stringify(mappedData, null, 2);
      filename = generateFilename("json");
      break;

    case "xls":
      const worksheetData = parsedData.map((item) => ({
        [headers[0]]: item.nameProduct,
        [headers[1]]: item.currentPrice,
        [headers[2]]: item.ratingProduct || "0",
        [headers[3]]: item.reviewsProduct || "0",
        [headers[4]]: item.urlProduct,
        [headers[5]]: item.imageProductUrl,
      }));
      filename = generateFilename("xls");

      window.exportFromJSON({
        data: worksheetData,
        fileName: filename,
        exportType: "xls",
        withBOM: true,
      });

      return;

    default:
      alert(`Неизвестный формат: ${saveFormat}`);
      return;
  }

  const blob = new Blob([content], {
    type: saveFormat === "json" ? "application/json" : "text/plain",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generateFilename(extension: string): string {
  const now = new Date();
  const dateStr = now.toISOString().replace(/[:.]/g, "-").split("T")[0];
  const timeStr = now
    .toISOString()
    .split("T")[1]
    .split(".")[0]
    .replace(/:/g, "-");
  return `RuPriceParser_${dateStr}_${timeStr}.${extension}`;
}