/**
 * TouchDesigner 文檔抓取工具
 * 用於獲取 TouchDesigner 文檔網站的內容
 * 適用於 Node.js 環境
 */

import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import fs from "fs";
import path from "path";

class TouchDesignerDocFetcher {
  constructor() {
    this.baseUrl = "https://docs.derivative.ca/";
    this.docDir = "./doc";

    // 確保文檔目錄存在
    this.ensureDocDirExists();
  }

  /**
   * 確保文檔目錄存在
   */
  ensureDocDirExists() {
    if (!fs.existsSync(this.docDir)) {
      fs.mkdirSync(this.docDir, { recursive: true });
      console.log(`創建文檔目錄: ${this.docDir}`);
    }
  }

  /**
   * 獲取指定類別的文檔內容
   * @param {string} className - 類別名稱，例如 'Page_Class'
   * @returns {Promise<Object>} - 返回包含文檔內容的對象
   */
  async fetchClassDocumentation(className) {
    try {
      const url = `${this.baseUrl}${encodeURIComponent(className)}`;
      console.log(`正在獲取文檔: ${url}`);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `獲取文檔失敗: ${response.status} ${response.statusText}`
        );
      }

      const html = await response.text();

      // 返回原始HTML和解析後的內容
      return {
        className,
        url,
        content: this.parseDocContent(html),
      };
    } catch (error) {
      console.error(`獲取 ${className} 文檔時出錯:`, error);
      throw error;
    }
  }

  /**
   * 解析HTML文檔內容
   * @param {string} html - 原始HTML內容
   * @returns {Object} - 返回解析後的內容對象
   */
  parseDocContent(html) {
    // 使用 jsdom 創建一個虛擬 DOM
    const dom = new JSDOM(html);
    const { document } = dom.window;

    // 獲取指定的內容區域
    const contentElement = document.querySelector(
      "#mw-content-text > div.mw-parser-output > div.mw-parser-output"
    );

    if (!contentElement) {
      console.warn("無法找到指定的內容元素，嘗試查找備用元素");
      // 嘗試查找備用元素
      const fallbackElement = document.querySelector(
        "#mw-content-text > div.mw-parser-output"
      );
      if (!fallbackElement) {
        return { error: "無法找到內容元素" };
      }
      return this.extractContentItems(fallbackElement, document);
    }

    return this.extractContentItems(contentElement, document);
  }

  /**
   * 從內容元素中提取項目
   * @param {Element} contentElement - 內容元素
   * @param {Document} document - DOM 文檔對象
   * @returns {Object} - 返回提取的內容對象
   */
  extractContentItems(contentElement, document) {
    // 提取標題
    const title =
      document.querySelector("h1.firstHeading")?.textContent.trim() || "";

    // 查找所有具有 ID 的元素
    const headings = contentElement.querySelectorAll("[id]");

    // 創建一個對象來存儲所有項目
    const items = {};

    // 遍歷所有具有 ID 的元素
    headings.forEach((heading) => {
      const id = heading.id;

      // 跳過不符合要求的 ID（如果有特定要求）
      // 例如，只處理以 "node" 開頭的 ID
      // if (!id.startsWith("node")) return;

      // 獲取該元素後面的內容，直到下一個具有 ID 的元素
      let content = "";
      let currentNode = heading.nextSibling;

      while (currentNode && (!currentNode.id || currentNode.id === "")) {
        // 如果是文本節點或者元素節點，提取文本
        if (currentNode.nodeType === 3 || currentNode.nodeType === 1) {
          const text = currentNode.textContent?.trim();
          if (text) {
            content += text + " ";
          }
        }

        // 如果沒有下一個兄弟節點，但有父節點的下一個兄弟節點，則移動到父節點的下一個兄弟節點
        if (
          !currentNode.nextSibling &&
          currentNode.parentNode &&
          currentNode.parentNode.nextSibling
        ) {
          currentNode = currentNode.parentNode.nextSibling;
        } else {
          currentNode = currentNode.nextSibling;
        }

        // 如果遇到下一個標題，停止
        if (
          currentNode &&
          currentNode.tagName &&
          ["H1", "H2", "H3", "H4", "H5", "H6"].includes(currentNode.tagName)
        ) {
          break;
        }
      }

      // 存儲該項目
      items[id] = {
        title: heading.textContent.trim(),
        content: content.trim(),
      };
    });

    return {
      title,
      items,
    };
  }

  /**
   * 保存文檔內容到JSON文件
   * @param {Object} docContent - 文檔內容對象
   * @param {string} filename - 文件名
   */
  saveToJson(docContent, filename) {
    // 在 Node.js 環境中，使用 fs 模塊保存文件
    const jsonString = JSON.stringify(docContent, null, 2);

    // 構建輸出文件路徑
    const outputFilename = filename || `${docContent.className}.json`;
    const outputPath = path.join(this.docDir, outputFilename);

    fs.writeFileSync(outputPath, jsonString);
    console.log(`文檔已保存到 ${outputPath}`);

    // 在單獨運行模式下輸出 MDC 引用
    if (process.argv[1].includes("Recorder.js")) {
      this.printMdcReference(docContent.className);
    }
  }

  /**
   * 輸出需要添加到 td-class.mdc 文件的文本
   * @param {string} className - 類名
   */
  printMdcReference(className) {
    const mdcReference = `${className}: [${className}.json](mdc:doc/${className}.json)`;
    console.log("\n要添加到 td-class.mdc 文件的文本:");
    console.log("----------------------------------------");
    console.log(mdcReference);
    console.log("----------------------------------------");
    console.log("請手動將上述文本添加到 td-class.mdc 文件的 '# 文件' 部分下。");
  }
}

// 僅在直接運行此文件時執行以下代碼
if (process.argv[1].includes("Recorder.js")) {
  // 從命令行參數獲取類名
  const className = process.argv[2] || "Page_Class";

  // 使用示例
  const fetcher = new TouchDesignerDocFetcher();
  fetcher
    .fetchClassDocumentation(className)
    .then((docContent) => {
      console.log(`成功獲取 ${className} 文檔`);
      fetcher.saveToJson(docContent);
    })
    .catch((error) => {
      console.error("獲取文檔失敗:", error);
      console.log("使用方法: node Recorder.js <類名>");
      console.log("例如: node Recorder.js Page_Class");
    });
}

// 導出類以便在其他模塊中使用
export default TouchDesignerDocFetcher;
