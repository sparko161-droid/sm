/**
 * BlocksRenderer
 *
 * Отвечает за отрисовку blocks[] внутри шага страницы.
 * Поддерживает типы блоков, описанные в CONTENT_MODEL.md:
 * - text
 * - list
 * - checklist
 * - case
 * - note
 * - link
 * - image
 * - calc-link
 * - html (для legacy-контента)
 */

function escape(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderTextBlock(block) {
  const d = block.data || {};
  const titleHtml = d.title ? `<h3 class="block-title">${escape(d.title)}</h3>` : "";
  const textHtml = d.text ? `<p class="block-text">${escape(d.text)}</p>` : "";
  return `<section class="block block--text">${titleHtml}${textHtml}</section>`;
}

function renderListBlock(block) {
  const d = block.data || {};
  const titleHtml = d.title ? `<h3 class="block-title">${escape(d.title)}</h3>` : "";
  const items = Array.isArray(d.items) ? d.items : [];
  const itemsHtml = items.map(item => `<li>${escape(item)}</li>`).join("");
  return `<section class="block block--list">${titleHtml}<ul class="block-list">${itemsHtml}</ul></section>`;
}

function renderChecklistBlock(block) {
  const d = block.data || {};
  const titleHtml = d.title ? `<h3 class="block-title">${escape(d.title)}</h3>` : "";
  const items = Array.isArray(d.items) ? d.items : [];
  const itemsHtml = items.map(item => {
    const text = escape(item.text || "");
    const required = item.required ? '<span class="tag tag--required">обязательно</span>' : "";
    return `<li class="block-checklist-item"><span>${text}</span> ${required}</li>`;
  }).join("");
  return `<section class="block block--checklist">${titleHtml}<ul class="block-checklist">${itemsHtml}</ul></section>`;
}

function renderCaseBlock(block) {
  const d = block.data || {};
  const titleHtml = d.title ? `<h3 class="block-title">${escape(d.title)}</h3>` : "";
  const problem = d.problem ? `<p><strong>Ситуация:</strong> ${escape(d.problem)}</p>` : "";
  const analysis = d.analysis ? `<p><strong>Анализ:</strong> ${escape(d.analysis)}</p>` : "";
  const solution = d.solution ? `<p><strong>Действия:</strong> ${escape(d.solution)}</p>` : "";
  const metaParts = [];
  if (d.line) metaParts.push(`Линия: ${escape(d.line)}`);
  if (d.caseType) metaParts.push(`Тип: ${escape(d.caseType)}`);
  const meta = metaParts.length ? `<p class="block-meta">${metaParts.join(" · ")}</p>` : "";
  return `<section class="block block--case">${titleHtml}${meta}${problem}${analysis}${solution}</section>`;
}

function renderNoteBlock(block) {
  const d = block.data || {};
  const style = d.style || "info";
  const text = d.text ? escape(d.text) : "";
  return `<aside class="block block--note block--note-${escape(style)}"><p>${text}</p></aside>`;
}

function renderLinkBlock(block) {
  const d = block.data || {};
  const label = d.label ? escape(d.label) : "Смотреть";
  const url = d.url || "#";
  return `<section class="block block--link"><a href="${escape(url)}" class="btn btn--link">${label}</a></section>`;
}

function renderImageBlock(block) {
  const d = block.data || {};
  const src = d.src || "";
  const alt = escape(d.alt || "");
  if (!src) return "";
  return `<figure class="block block--image"><img src="${escape(src)}" alt="${alt}" /><figcaption>${alt}</figcaption></figure>`;
}

function renderCalcLinkBlock(block) {
  const d = block.data || {};
  const calculatorId = d.calculatorId || "";
  const label = d.label ? escape(d.label) : "Открыть калькулятор";
  const dataAttr = calculatorId ? ` data-calculator-id="${escape(calculatorId)}"` : "";
  return `
    <section class="block block--calc-link">
      <button type="button" class="btn btn--primary" data-role="open-calculator"${dataAttr}>
        ${label}
      </button>
    </section>
  `;
}

function renderHtmlBlock(block) {
  const d = block.data || {};
  const html = d.html || "";
  return `<section class="block block--html">${html}</section>`;
}

function renderBlock(block) {
  if (!block || typeof block !== "object") return "";
  switch (block.type) {
    case "text":
      return renderTextBlock(block);
    case "list":
      return renderListBlock(block);
    case "checklist":
      return renderChecklistBlock(block);
    case "case":
      return renderCaseBlock(block);
    case "note":
      return renderNoteBlock(block);
    case "link":
      return renderLinkBlock(block);
    case "image":
      return renderImageBlock(block);
    case "calc-link":
      return renderCalcLinkBlock(block);
    case "html":
      return renderHtmlBlock(block);
    default:
      console.warn("[BlocksRenderer] Unknown block type:", block.type);
      return "";
  }
}

export function renderBlocks(container, blocks = []) {
  if (!container) return;
  const safeBlocks = Array.isArray(blocks) ? blocks : [];
  const html = safeBlocks.map(renderBlock).join("");
  container.innerHTML = html;
}

const BlocksRenderer = {
  renderBlocks
};

export default BlocksRenderer;
