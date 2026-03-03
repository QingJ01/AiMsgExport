// ==UserScript==
// @name         AiMsgExport
// @namespace    https://github.com/QingJ01/AiMsgExport
// @version      0.1.0
// @description  Export selected AI chat messages to PDF/Markdown/Image/TXT
// @author       QingJ
// @icon         data:image/svg+xml,%3Csvg%20width%3D%22128%22%20height%3D%22128%22%20viewBox%3D%220%200%20128%20128%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22bg%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%22128%22%20y2%3D%22128%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%233B82F6%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%236366F1%22%2F%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22arrow%22%20x1%3D%2264%22%20y1%3D%2230%22%20x2%3D%2264%22%20y2%3D%2298%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23FFFFFF%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23E0E7FF%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22128%22%20height%3D%22128%22%20rx%3D%2228%22%20fill%3D%22url(%23bg)%22%2F%3E%3Cpath%20d%3D%22M30%2038C30%2033.5817%2033.5817%2030%2038%2030H90C94.4183%2030%2098%2033.5817%2098%2038V74C98%2078.4183%2094.4183%2082%2090%2082H72L64%2092L56%2082H38C33.5817%2082%2030%2078.4183%2030%2074V38Z%22%20fill%3D%22rgba(255%2C255%2C255%2C0.15)%22%2F%3E%3Cpath%20d%3D%22M64%2036V72%22%20stroke%3D%22url(%23arrow)%22%20stroke-width%3D%227%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M48%2060L64%2076L80%2060%22%20stroke%3D%22url(%23arrow)%22%20stroke-width%3D%227%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3Cpath%20d%3D%22M40%2088H88%22%20stroke%3D%22url(%23arrow)%22%20stroke-width%3D%226%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M96%2022L97.5%2027L102.5%2028.5L97.5%2030L96%2035L94.5%2030L89.5%2028.5L94.5%2027L96%2022Z%22%20fill%3D%22%23FDE68A%22%2F%3E%3Cpath%20d%3D%22M36%2020L37%2023L40%2024L37%2025L36%2028L35%2025L32%2024L35%2023L36%2020Z%22%20fill%3D%22%23FDE68A%22%20opacity%3D%220.7%22%2F%3E%3C%2Fsvg%3E
// @match        https://chatgpt.com/*
// @match        https://gemini.google.com/*
// @match        https://claude.ai/*
// @match        https://grok.com/*
// @match        https://chat.deepseek.com/*
// @match        https://www.doubao.com/chat/*
// @match        https://chat.qwen.ai/*
// @match        https://aistudio.google.com/*
// @match        https://copilot.cloud.microsoft/*
// @match        https://m365.cloud.microsoft/*
// @match        https://www.perplexity.ai/*
// @grant        GM_addStyle
// @run-at       document-idle
// @require      https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js
// @require      https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js
// @require      https://cdn.jsdelivr.net/npm/turndown@7.1.2/dist/turndown.js
// ==/UserScript==

(function () {
  "use strict";

  const SITE_SELECTORS = {
    "chatgpt.com": [
      "[data-testid^='conversation-turn-']",
      "article[data-testid='conversation-turn']"
    ],
    "gemini.google.com": [
      "message-content",
      "user-query",
      "[data-user-text]",
      ".markdown-main-panel"
    ],
    "claude.ai": [
      "div[data-testid='user-message']",
      "div.font-claude-response"
    ],
    "grok.com": [
      "div[id^='response-']",
      "div[data-testid='message']"
    ],
    "chat.deepseek.com": [
      "div[class*='chat-message']",
      ".ds-chat-message"
    ],
    "www.doubao.com": [
      "[data-testid='send_message']",
      "[data-testid='receive_message']"
    ],
    "chat.qwen.ai": [
      ".qwen-chat-message",
      "div[class*='chat-message']:not(.chat-messages)"
    ],
    "aistudio.google.com": [
      "ms-cmark-node.cmark-node.v3-font-body.user-chunk",
      "ms-chat-turn .virtual-scroll-container.model-prompt-container ms-text-chunk ms-cmark-node.cmark-node.v3-font-body"
    ],
    "copilot.cloud.microsoft": [
      "article[role='article']",
      "div[class*='conversation']"
    ],
    "m365.cloud.microsoft": [
      "article[role='article']",
      "div[class*='conversation']"
    ],
    "www.perplexity.ai": [
      "h1.group\\/query",
      "[id^='markdown-content-']",
      "#markdown-content-0"
    ]
  };

  const SITE_CONTAINERS = {
    "chatgpt.com": ["main", "div[role='main']"],
    "gemini.google.com": ["main", "div[role='main']"],
    "claude.ai": ["main", "div[role='main']"],
    "grok.com": ["main", "div[role='main']"],
    "chat.deepseek.com": ["main", "[role='main']"],
    "www.doubao.com": ["main"],
    "chat.qwen.ai": ["main"],
    "aistudio.google.com": ["ms-chat-session", "main"],
    "copilot.cloud.microsoft": ["main", "div[role='main']"],
    "m365.cloud.microsoft": ["main", "div[role='main']"],
    "www.perplexity.ai": ["main", "div[role='main']"]
  };

  const MESSAGE_ROOTS = {
    "www.doubao.com": ["[data-testid='message-list']"],
    "chatgpt.com": ["main"],
    "gemini.google.com": ["main"],
    "claude.ai": ["main"],
    "grok.com": ["main"],
    "chat.deepseek.com": ["main"],
    "chat.qwen.ai": ["main"],
    "aistudio.google.com": ["main"],
    "copilot.cloud.microsoft": ["main"],
    "m365.cloud.microsoft": ["main"],
    "www.perplexity.ai": ["main"]
  };

  const ROLE_SELECTORS = {
    "chatgpt.com": {
      user: ["[data-message-author-role='user']"],
      assistant: ["[data-message-author-role='assistant']"]
    },
    "claude.ai": {
      user: ["[data-testid='user-message']", "[data-author='user']"],
      assistant: [".font-claude-response", "[data-author='assistant']"]
    },
    "gemini.google.com": {
      user: ["user-query", "[data-user-text]"],
      assistant: ["message-content", ".markdown-main-panel"]
    },
    "aistudio.google.com": {
      user: ["ms-cmark-node.user-chunk", ".virtual-scroll-container[data-turn-role='User']"],
      assistant: [".virtual-scroll-container[data-turn-role='Model']"]
    },
    "grok.com": {
      user: ["[data-role='user']"],
      assistant: ["[data-role='assistant']"]
    },
    "chat.deepseek.com": {
      user: [".ds-chat-user-message", "[data-role='user']"],
      assistant: [".ds-markdown-paragraph"]
    },
    "www.doubao.com": {
      user: ["[data-testid='send_message']"],
      assistant: ["[data-testid='receive_message']"]
    },
    "www.perplexity.ai": {
      user: ["h1.group\\/query"],
      assistant: ["[id^='markdown-content-']", "#markdown-content-0"]
    },
    "chat.qwen.ai": {
      user: [".qwen-chat-message-user", ".chat-user-message-container-wrapper"],
      assistant: [".qwen-chat-message-assistant", ".qwen-chat-message-bot", ".chat-assistant-message-container-wrapper"]
    }
  };

  const SITE_BRAND = {
    "chatgpt.com": { name: "ChatGPT", color: "#10a37f", icon: "CGPT" },
    "gemini.google.com": { name: "Gemini", color: "#1a73e8", icon: "GEM" },
    "claude.ai": { name: "Claude", color: "#111111", icon: "CLD" },
    "grok.com": { name: "Grok", color: "#000000", icon: "GRK" },
    "chat.deepseek.com": { name: "DeepSeek", color: "#1d4ed8", icon: "DS" },
    "www.doubao.com": { name: "Doubao", color: "#2563eb", icon: "DB", imgUrl: "https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/samantha/logo-icon-white-bg.png" },
    "chat.qwen.ai": { name: "Qwen", color: "#0f766e", icon: "QW" },
    "aistudio.google.com": { name: "AI Studio", color: "#6b7280", icon: "AI" },
    "copilot.cloud.microsoft": { name: "Copilot", color: "#0f172a", icon: "CP" },
    "m365.cloud.microsoft": { name: "Copilot", color: "#0f172a", icon: "CP" },
    "www.perplexity.ai": { name: "Perplexity", color: "#334155", icon: "PP" }
  };

  const SITE_ICON_SVGS = {
    "chatgpt.com": `<svg fill="currentColor" fill-rule="evenodd" height="1em" style="flex:none;line-height:1" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg"><title>OpenAI</title><path d="M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z"></path></svg>`,
    "gemini.google.com": `<svg fill="currentColor" fill-rule="evenodd" height="1em" style="flex:none;line-height:1" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg"><title>Gemini</title><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z"></path></svg>`,
    "claude.ai": `<svg fill="currentColor" fill-rule="evenodd" height="1em" style="flex:none;line-height:1" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg"><title>Claude</title><path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z"></path></svg>`,
    "grok.com": `<svg fill="currentColor" fill-rule="evenodd" height="1em" style="flex:none;line-height:1" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg"><title>Grok</title><path d="M9.27 15.29l7.978-5.897c.391-.29.95-.177 1.137.272.98 2.369.542 5.215-1.41 7.169-1.951 1.954-4.667 2.382-7.149 1.406l-2.711 1.257c3.889 2.661 8.611 2.003 11.562-.953 2.341-2.344 3.066-5.539 2.388-8.42l.006.007c-.983-4.232.242-5.924 2.75-9.383.06-.082.12-.164.179-.248l-3.301 3.305v-.01L9.267 15.292M7.623 16.723c-2.792-2.67-2.31-6.801.071-9.184 1.761-1.763 4.647-2.483 7.166-1.425l2.705-1.25a7.808 7.808 0 00-1.829-1A8.975 8.975 0 005.984 5.83c-2.533 2.536-3.33 6.436-1.962 9.764 1.022 2.487-.653 4.246-2.34 6.022-.599.63-1.199 1.259-1.682 1.925l7.62-6.815"></path></svg>`,
    "chat.deepseek.com": `<svg width="195.000000" height="41.359375" viewBox="0 0 195 41.3594" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><clipPath id="clip30_2029"><rect id="_图层_1" width="134.577469" height="25.511124" transform="translate(60.422485 10.022217)" fill="white"/></clipPath></defs><g clip-path="url(#clip30_2029)"><path d="M119.508 30.113L117.562 30.113L117.562 27.0967L119.508 27.0967C120.713 27.0967 121.931 26.7961 122.715 25.9614C123.5 25.1265 123.796 23.8464 123.796 22.5664C123.796 21.2864 123.512 20.0063 122.715 19.1716C121.919 18.3369 120.713 18.0364 119.508 18.0364C118.302 18.0364 117.085 18.3369 116.3 19.1716C115.515 20.0063 115.219 21.2864 115.219 22.5664L115.219 34.9551L111.806 34.9551L111.806 15.031L115.219 15.031L115.219 16.2998L115.845 16.2998C115.913 16.2219 115.981 16.1553 116.049 16.0884C116.903 15.3093 118.211 15.031 119.496 15.031C121.51 15.031 123.523 15.532 124.843 16.9233C126.162 18.3145 126.629 20.4517 126.629 22.5776C126.629 24.7036 126.151 26.8296 124.843 28.2319C123.535 29.6345 121.51 30.113 119.508 30.113Z" fill-rule="nonzero" fill="#4D6BFE"/><path d="M67.5664 15.5654L69.5117 15.5654L69.5117 18.5818L67.5664 18.5818C66.3606 18.5818 65.1434 18.8823 64.3585 19.717C63.5736 20.552 63.2778 21.832 63.2778 23.1121C63.2778 24.3921 63.5623 25.6721 64.3585 26.5068C65.1548 27.3418 66.3606 27.6423 67.5664 27.6423C68.7722 27.6423 69.9895 27.3418 70.7744 26.5068C71.5593 25.6721 71.8551 24.3921 71.8551 23.1121L71.8551 10.7124L75.2677 10.7124L75.2677 30.6475L71.8551 30.6475L71.8551 29.3787L71.2294 29.3787C71.1611 29.4565 71.0929 29.5234 71.0247 29.5901C70.1715 30.3691 68.8633 30.6475 67.5779 30.6475C65.5643 30.6475 63.5509 30.1467 62.2313 28.7554C60.9117 27.364 60.4453 25.2268 60.4453 23.1008C60.4453 20.9749 60.9231 18.8489 62.2313 17.4465C63.5509 16.0552 65.5643 15.5654 67.5664 15.5654Z" fill-rule="nonzero" fill="#4D6BFE"/><path d="M92.3881 22.845L92.3881 24.0581L83.299 24.0581L83.299 21.6428L89.328 21.6428C89.1914 20.7634 88.8729 19.9397 88.3042 19.3386C87.4851 18.4705 86.2224 18.1589 84.9711 18.1589C83.7198 18.1589 82.4572 18.4705 81.6381 19.3386C80.819 20.2068 80.5232 21.5315 80.5232 22.845C80.5232 24.1582 80.819 25.4939 81.6381 26.3511C82.4572 27.208 83.7198 27.531 84.9711 27.531C86.2224 27.531 87.4851 27.2192 88.3042 26.3511C88.418 26.2285 88.5203 26.095 88.6227 25.9614L91.9899 25.9614C91.6941 27.0078 91.2277 27.9539 90.5225 28.6885C89.1573 30.1243 87.0529 30.6475 84.9711 30.6475C82.8894 30.6475 80.7849 30.1355 79.4198 28.6885C78.0547 27.2415 77.5542 25.0376 77.5542 22.845C77.5542 20.6521 78.0433 18.437 79.4198 17.0012C80.7963 15.5654 82.8894 15.0422 84.9711 15.0422C87.0529 15.0422 89.1573 15.5542 90.5225 17.0012C91.8988 18.4482 92.3881 20.6521 92.3881 22.845Z" fill-rule="nonzero" fill="#4D6BFE"/><path d="M109.52 22.845L109.52 24.0581L100.431 24.0581L100.431 21.6428L106.46 21.6428C106.323 20.7634 106.005 19.9397 105.436 19.3386C104.617 18.4705 103.354 18.1589 102.103 18.1589C100.852 18.1589 99.5889 18.4705 98.7698 19.3386C97.9507 20.2068 97.6549 21.5315 97.6549 22.845C97.6549 24.1582 97.9507 25.4939 98.7698 26.3511C99.5889 27.208 100.852 27.531 102.103 27.531C103.354 27.531 104.617 27.2192 105.436 26.3511C105.55 26.2285 105.652 26.095 105.754 25.9614L109.122 25.9614C108.826 27.0078 108.359 27.9539 107.654 28.6885C106.289 30.1243 104.185 30.6475 102.103 30.6475C100.021 30.6475 97.9166 30.1355 96.5515 28.6885C95.1864 27.2415 94.6859 25.0376 94.6859 22.845C94.6859 20.6521 95.175 18.437 96.5515 17.0012C97.928 15.5654 100.021 15.0422 102.103 15.0422C104.185 15.0422 106.289 15.5542 107.654 17.0012C109.031 18.4482 109.52 20.6521 109.52 22.845Z" fill-rule="nonzero" fill="#4D6BFE"/><path d="M136.355 30.6475C138.437 30.6475 140.541 30.3469 141.906 29.49C143.271 28.6328 143.772 27.3306 143.772 26.0393C143.772 24.7483 143.282 23.4348 141.906 22.5889C140.541 21.7429 138.437 21.4312 136.355 21.4312C135.467 21.4312 134.648 21.3088 134.068 20.9861C133.488 20.6521 133.272 20.1511 133.272 19.6504C133.272 19.1494 133.477 18.6375 134.068 18.3147C134.648 17.9807 135.547 17.8694 136.434 17.8694C137.322 17.8694 138.22 17.9919 138.801 18.3147C139.381 18.6487 139.597 19.1494 139.597 19.6504L143.066 19.6504C143.066 18.3591 142.623 17.0457 141.383 16.2C140.143 15.354 138.243 15.0422 136.355 15.0422C134.466 15.0422 132.567 15.3428 131.327 16.2C130.087 17.0569 129.643 18.3591 129.643 19.6504C129.643 20.9414 130.087 22.2549 131.327 23.1008C132.567 23.9468 134.466 24.2585 136.355 24.2585C137.333 24.2585 138.414 24.3809 139.062 24.7036C139.711 25.0266 139.938 25.5386 139.938 26.0393C139.938 26.5403 139.711 27.0522 139.062 27.375C138.414 27.6978 137.424 27.8203 136.446 27.8203C135.467 27.8203 134.466 27.6978 133.829 27.375C133.192 27.0522 132.953 26.5403 132.953 26.0393L128.949 26.0393C128.949 27.3306 129.438 28.644 130.815 29.49C132.191 30.3359 134.273 30.6475 136.355 30.6475Z" fill-rule="nonzero" fill="#4D6BFE"/><path d="M160.903 22.845L160.903 24.0581L151.814 24.0581L151.814 21.6428L157.843 21.6428C157.707 20.7634 157.388 19.9397 156.82 19.3386C156 18.4705 154.738 18.1589 153.486 18.1589C152.235 18.1589 150.972 18.4705 150.153 19.3386C149.334 20.2068 149.039 21.5315 149.039 22.845C149.039 24.1582 149.334 25.4939 150.153 26.3511C150.972 27.208 152.235 27.531 153.486 27.531C154.738 27.531 156 27.2192 156.82 26.3511C156.933 26.2285 157.036 26.095 157.138 25.9614L160.505 25.9614C160.209 27.0078 159.743 27.9539 159.038 28.6885C157.673 30.1243 155.568 30.6475 153.486 30.6475C151.405 30.6475 149.3 30.1355 147.935 28.6885C146.57 27.2415 146.07 25.0376 146.07 22.845C146.07 20.6521 146.559 18.437 147.935 17.0012C149.312 15.5654 151.405 15.0422 153.486 15.0422C155.568 15.0422 157.673 15.5542 159.038 17.0012C160.414 18.4482 160.903 20.6521 160.903 22.845Z" fill-rule="nonzero" fill="#4D6BFE"/><path d="M178.035 22.845L178.035 24.0581L168.946 24.0581L168.946 21.6428L174.975 21.6428C174.839 20.7634 174.52 19.9397 173.951 19.3386C173.132 18.4705 171.87 18.1589 170.618 18.1589C169.367 18.1589 168.104 18.4705 167.285 19.3386C166.466 20.2068 166.17 21.5315 166.17 22.845C166.17 24.1582 166.466 25.4939 167.285 26.3511C168.104 27.208 169.367 27.531 170.618 27.531C171.87 27.531 173.132 27.2192 173.951 26.3511C174.065 26.2285 174.167 26.095 174.27 25.9614L177.637 25.9614C177.341 27.0078 176.875 27.9539 176.17 28.6885C174.804 30.1243 172.7 30.6475 170.618 30.6475C168.536 30.6475 166.432 30.1355 165.067 28.6885C163.702 27.2415 163.201 25.0376 163.201 22.845C163.201 20.6521 163.69 18.437 165.067 17.0012C166.443 15.5654 168.536 15.0422 170.618 15.0422C172.7 15.0422 174.804 15.5542 176.17 17.0012C177.546 18.4482 178.035 20.6521 178.035 22.845Z" fill-rule="nonzero" fill="#4D6BFE"/><rect x="180.321533" y="10.022217" width="3.412687" height="20.625223" fill="#4D6BFE"/><path d="M189.559 22.3772L195.155 30.6475L190.935 30.6475L185.338 22.3772L190.935 15.7322L195.155 15.7322L189.559 22.3772Z" fill-rule="nonzero" fill="#4D6BFE"/></g><path d="M55.6128 3.47119C55.0175 3.17944 54.7611 3.73535 54.413 4.01782C54.2939 4.10889 54.1932 4.22729 54.0924 4.33667C53.2223 5.26587 52.2057 5.87646 50.8776 5.80347C48.9359 5.69409 47.2781 6.30469 45.8126 7.78979C45.5012 5.9585 44.4663 4.86499 42.8909 4.16357C42.0667 3.79907 41.2332 3.43457 40.6561 2.64185C40.2532 2.07715 40.1432 1.44849 39.9418 0.828857C39.8135 0.455322 39.6853 0.0725098 39.2548 0.00878906C38.7877 -0.0639648 38.6045 0.327637 38.4213 0.655762C37.6886 1.99512 37.4047 3.47119 37.4321 4.96533C37.4962 8.32739 38.9159 11.0059 41.7369 12.9102C42.0575 13.1289 42.1399 13.3474 42.0392 13.6665C41.8468 14.3225 41.6178 14.9602 41.4164 15.6162C41.2881 16.0354 41.0957 16.1265 40.647 15.9441C39.0991 15.2974 37.7618 14.3406 36.5803 13.1836C34.5745 11.2429 32.761 9.10181 30.4988 7.42529C29.9675 7.03345 29.4363 6.66919 28.8867 6.32275C26.5786 4.08154 29.189 2.24097 29.7935 2.02246C30.4254 1.79468 30.0133 1.01099 27.9708 1.02026C25.9283 1.0293 24.0599 1.71265 21.6786 2.62378C21.3306 2.7605 20.9641 2.8606 20.5886 2.94263C18.4271 2.53271 16.1831 2.44141 13.8384 2.70581C9.42371 3.19775 5.89758 5.28418 3.30554 8.84668C0.191406 13.1289 -0.54126 17.9941 0.356323 23.0691C1.29968 28.4172 4.02905 32.8452 8.22388 36.3076C12.5745 39.8972 17.5845 41.6558 23.2997 41.3186C26.771 41.1182 30.6361 40.6536 34.9958 36.9636C36.0948 37.5103 37.2489 37.7288 39.1632 37.8928C40.6378 38.0295 42.0575 37.8201 43.1565 37.5923C44.8784 37.2278 44.7594 35.6333 44.1366 35.3418C39.09 32.9912 40.1981 33.9478 39.1907 33.1733C41.7552 30.1394 45.6204 26.9868 47.1316 16.7732C47.2506 15.9624 47.1499 15.4521 47.1316 14.7961C47.1224 14.3953 47.214 14.2405 47.672 14.1948C48.9359 14.0491 50.1632 13.7029 51.2898 13.0833C54.5596 11.2976 55.8784 8.36377 56.1898 4.84692C56.2357 4.30933 56.1807 3.75342 55.6128 3.47119ZM27.119 35.123C22.2281 31.2783 19.856 30.0117 18.8759 30.0664C17.96 30.1211 18.1249 31.1689 18.3263 31.8523C18.537 32.5264 18.8118 32.9912 19.1964 33.5833C19.462 33.9751 19.6453 34.5581 18.9309 34.9956C17.3555 35.9705 14.6169 34.6675 14.4886 34.6038C11.3014 32.7268 8.63611 30.2485 6.75842 26.8594C4.94495 23.5974 3.89172 20.0989 3.71765 16.3633C3.67188 15.4614 3.9375 15.1423 4.83508 14.9785C6.0166 14.7598 7.23474 14.7141 8.41626 14.8872C13.408 15.6162 17.6577 17.8484 21.2206 21.3835C23.2539 23.397 24.7926 25.8025 26.3772 28.1531C28.0624 30.6494 29.8759 33.0276 32.184 34.9773C32.9991 35.6606 33.6494 36.1799 34.2722 36.5627C32.3947 36.7722 29.2622 36.8179 27.119 35.123ZM29.4637 20.0442C29.4637 19.6433 29.7843 19.3245 30.1874 19.3245C30.2789 19.3245 30.3613 19.3425 30.4346 19.3699C30.5354 19.4065 30.627 19.4612 30.7002 19.543C30.8285 19.6707 30.9017 19.8528 30.9017 20.0442C30.9017 20.4451 30.5812 20.7639 30.1782 20.7639C29.7751 20.7639 29.4637 20.4451 29.4637 20.0442ZM36.7452 23.7798C36.2781 23.9712 35.811 24.135 35.3622 24.1533C34.6661 24.1897 33.9059 23.9072 33.4938 23.561C32.8527 23.0234 32.3947 22.7229 32.2023 21.7844C32.1199 21.3835 32.1656 20.7639 32.239 20.4087C32.4038 19.6433 32.2206 19.1514 31.6803 18.7048C31.2406 18.3403 30.6819 18.2402 30.0682 18.2402C29.8392 18.2402 29.6287 18.1399 29.4729 18.0579C29.2164 17.9304 29.0059 17.6116 29.2073 17.2197C29.2714 17.0923 29.5829 16.7825 29.6561 16.7278C30.4896 16.2539 31.4513 16.4089 32.3397 16.7642C33.1641 17.1013 33.7869 17.7209 34.6844 18.5955C35.6003 19.6523 35.7651 19.9441 36.2872 20.7366C36.6995 21.3562 37.075 21.9939 37.3314 22.7229C37.4871 23.1785 37.2856 23.552 36.7452 23.7798Z" fill-rule="nonzero" fill="#4D6BFE"/></svg>`,
    "chat.qwen.ai": `<svg fill="currentColor" fill-rule="evenodd" height="1em" style="flex:none;line-height:1" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg"><title>Qwen</title><path d="M12.604 1.34c.393.69.784 1.382 1.174 2.075a.18.18 0 00.157.091h5.552c.174 0 .322.11.446.327l1.454 2.57c.19.337.24.478.024.837-.26.43-.513.864-.76 1.3l-.367.658c-.106.196-.223.28-.04.512l2.652 4.637c.172.301.111.494-.043.77-.437.785-.882 1.564-1.335 2.34-.159.272-.352.375-.68.37-.777-.016-1.552-.01-2.327.016a.099.099 0 00-.081.05 575.097 575.097 0 01-2.705 4.74c-.169.293-.38.363-.725.364-.997.003-2.002.004-3.017.002a.537.537 0 01-.465-.271l-1.335-2.323a.09.09 0 00-.083-.049H4.982c-.285.03-.553-.001-.805-.092l-1.603-2.77a.543.543 0 01-.002-.54l1.207-2.12a.198.198 0 000-.197 550.951 550.951 0 01-1.875-3.272l-.79-1.395c-.16-.31-.173-.496.095-.965.465-.813.927-1.625 1.387-2.436.132-.234.304-.334.584-.335a338.3 338.3 0 012.589-.001.124.124 0 00.107-.063l2.806-4.895a.488.488 0 01.422-.246c.524-.001 1.053 0 1.583-.006L11.704 1c.341-.003.724.032.9.34zm-3.432.403a.06.06 0 00-.052.03L6.254 6.788a.157.157 0 01-.135.078H3.253c-.056 0-.07.025-.041.074l5.81 10.156c.025.042.013.062-.034.063l-2.795.015a.218.218 0 00-.2.116l-1.32 2.31c-.044.078-.021.118.068.118l5.716.008c.046 0 .08.02.104.061l1.403 2.454c.046.081.092.082.139 0l5.006-8.76.783-1.382a.055.055 0 01.096 0l1.424 2.53a.122.122 0 00.107.062l2.763-.02a.04.04 0 00.035-.02.041.041 0 000-.04l-2.9-5.086a.108.108 0 010-.113l.293-.507 1.12-1.977c.024-.041.012-.062-.035-.062H9.2c-.059 0-.073-.026-.043-.077l1.434-2.505a.107.107 0 000-.114L9.225 1.774a.06.06 0 00-.053-.031zm6.29 8.02c.046 0 .058.02.034.06l-.832 1.465-2.613 4.585a.056.056 0 01-.05.029.058.058 0 01-.05-.029L8.498 9.841c-.02-.034-.01-.052.028-.054l.216-.012 6.722-.012z"></path></svg>`,
    "copilot.cloud.microsoft": `<svg fill="currentColor" fill-rule="evenodd" height="1em" style="flex:none;line-height:1" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg"><title>Copilot</title><path d="M9 23l.073-.001a2.53 2.53 0 01-2.347-1.838l-.697-2.433a2.529 2.529 0 00-2.426-1.839h-.497l-.104-.002c-4.485 0-2.935-5.278-1.75-9.225l.162-.525C2.412 3.99 3.883 1 6.25 1h8.86c1.12 0 2.106.745 2.422 1.829l.715 2.453a2.53 2.53 0 002.247 1.823l.147.005.534.001c3.557.115 3.088 3.745 2.156 7.206l-.113.413c-.154.548-.315 1.089-.47 1.607l-.163.525C21.588 20.01 20.116 23 17.75 23h-8.75zm8.22-15.89l-3.856.001a2.526 2.526 0 00-2.35 1.615L9.21 15.04a2.529 2.529 0 01-2.43 1.847l3.853.002c1.056 0 1.992-.661 2.361-1.644l1.796-6.287a2.529 2.529 0 012.43-1.848z"></path></svg>`,
    "www.perplexity.ai": `<svg fill="currentColor" fill-rule="evenodd" height="1em" style="flex:none;line-height:1" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg"><title>Perplexity</title><path d="M19.785 0v7.272H22.5V17.62h-2.935V24l-7.037-6.194v6.145h-1.091v-6.152L4.392 24v-6.465H1.5V7.188h2.884V0l7.053 6.494V.19h1.09v6.49L19.786 0zm-7.257 9.044v7.319l5.946 5.234V14.44l-5.946-5.397zm-1.099-.08l-5.946 5.398v7.235l5.946-5.234V8.965zm8.136 7.58h1.844V8.349H13.46l6.105 5.54v2.655zm-8.982-8.28H2.59v8.195h1.8v-2.576l6.192-5.62zM5.475 2.476v4.71h5.115l-5.115-4.71zm13.219 0l-5.115 4.71h5.115v-4.71z"></path></svg>`
  };

  const state = {
    selectionMode: false,
    selectedIds: new Set(),
    startId: null,
    endId: null,
    observer: null,
    processedElements: new WeakSet(),
    observerQueued: false,
    renderQueue: [],
    rendering: false
  };

  const host = window.location.host;

  const styles = `
    :root {
      /* 现代化色彩系统 - 基于 HSL 以获得更好的调和感 */
      --tm-primary: hsl(221, 100%, 60%);
      --tm-primary-hover: hsl(221, 100%, 55%);
      --tm-primary-active: hsl(221, 100%, 45%);
      --tm-surface: rgba(255, 255, 255, 0.75);
      --tm-surface-solid: #ffffff;
      --tm-text: #0f172a;
      --tm-text-muted: #64748b;
      --tm-border: rgba(226, 232, 240, 0.6);
      --tm-shadow: 0 8px 32px rgba(15, 23, 42, 0.12);
      --tm-radius: 16px;
      --tm-radius-sm: 8px;
    }

    /* 全局过渡效果 */
    .tm-export-panel, .tm-export-panel button {
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .tm-export-panel {
      position: fixed;
      top: 100px;
      right: 30px;
      width: 320px;
      z-index: 10000;
      background: var(--tm-surface);
      backdrop-filter: blur(16px) saturate(180%);
      -webkit-backdrop-filter: blur(16px) saturate(180%);
      border: 1px solid var(--tm-border);
      border-radius: var(--tm-radius);
      box-shadow: var(--tm-shadow);
      padding: 20px;
      font-family: 'Outfit', 'Inter', system-ui, -apple-system, sans-serif;
      color: var(--tm-text);
      opacity: 0;
      transform: translateY(10px) scale(0.98);
      pointer-events: none;
      visibility: hidden;
    }

    .tm-export-panel:not(.tm-export-hidden) {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
      visibility: visible;
    }

    .tm-export-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      cursor: grab;
      user-select: none;
    }

    .tm-export-header:active {
      cursor: grabbing;
    }

    .tm-export-header h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: -0.02em;
      background: linear-gradient(135deg, var(--tm-primary), #4f46e5);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .tm-export-header .tm-export-close {
      width: 28px !important;
      height: 28px !important;
      min-width: 28px !important;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none !important;
      background: rgba(0, 0, 0, 0.05) !important;
      border-radius: 50% !important;
      cursor: pointer;
      color: var(--tm-text-muted) !important;
      font-size: 18px;
      padding: 0 !important;
      margin: 0 !important;
      box-shadow: none !important;
      transform: none !important;
    }

    .tm-export-header .tm-export-close:hover {
      background: rgba(239, 68, 68, 0.1) !important;
      color: #ef4444 !important;
      transform: rotate(90deg) !important;
    }

    #tm-export-count {
      display: block;
      font-size: 24px;
      font-weight: 800;
      margin-bottom: 4px;
      color: var(--tm-primary);
    }

    .tm-export-help {
      font-size: 12px;
      color: var(--tm-text-muted);
      margin-bottom: 20px;
      line-height: 1.5;
    }

    .tm-export-section {
      margin-bottom: 16px;
    }

    .tm-export-section-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--tm-text-muted);
      margin-bottom: 8px;
      display: block;
    }

    .tm-export-panel button {
      width: 100%;
      padding: 10px 14px;
      border-radius: var(--tm-radius-sm);
      border: 1px solid var(--tm-border);
      background: #fff;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin: 4px 0;
    }

    .tm-export-panel button:hover {
      border-color: var(--tm-primary);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      transform: translateY(-1px);
    }

    .tm-export-panel button:active {
      transform: translateY(0);
    }

    .tm-export-panel .tm-primary {
      background: linear-gradient(135deg, var(--tm-primary), #4f46e5);
      color: #fff !important;
      border: none;
      font-weight: 600;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
    }

    .tm-export-panel .tm-primary:hover {
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
      transform: translateY(-2px);
    }

    .tm-export-panel .tm-row {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
    }

    .tm-export-panel .tm-row button {
      flex: 1;
      margin-bottom: 0;
    }

    .tm-export-range {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin: 8px 0;
      padding: 8px;
      border-radius: var(--tm-radius-sm);
      background: rgba(37, 99, 235, 0.05);
      font-size: 12px;
    }

    .tm-export-selected {
      outline: 3px solid var(--tm-primary);
      outline-offset: 4px;
      border-radius: 12px !important;
      transition: outline 0.2s ease;
    }

    .tm-timeline {
      display: none !important;
    }

    .tm-export-range button {
      font-size: 11px;
      padding: 4px 10px;
      background: #fff;
      border: 1px solid var(--tm-border);
      border-radius: 6px;
    }

    .tm-export-range button.tm-range-active {
      background: var(--tm-primary);
      color: #fff;
      border-color: var(--tm-primary);
    }

    .tm-export-hidden {
      display: none !important;
    }

    .tm-export-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      margin: 4px 12px;
      border-radius: 12px;
      background: transparent;
      color: inherit;
      font-size: 14px;
      cursor: pointer;
      border: none;
      transition: background 0.2s;
    }

    .tm-export-btn:hover {
      background: rgba(0,0,0,0.06);
    }

  `;

  GM_addStyle(styles);

  function uniqueElements(elements) {
    const seen = new Set();
    const result = [];
    elements.forEach((el) => {
      if (!seen.has(el)) {
        seen.add(el);
        result.push(el);
      }
    });
    return result;
  }

  function getChatRoot() {
    const selectors = SITE_CONTAINERS[host] || [];
    for (const sel of selectors) {
      const node = document.querySelector(sel);
      if (node) return node;
    }
    return document.querySelector("main") || document.body;
  }

  function getMessageRoot() {
    const selectors = MESSAGE_ROOTS[host] || [];
    for (const sel of selectors) {
      const node = document.querySelector(sel);
      if (node) return node;
    }
    return getChatRoot();
  }

  function filterTopLevel(elements) {
    const set = new Set(elements);
    return elements.filter((el) => {
      let parent = el.parentElement;
      let depth = 0;
      while (parent && depth < 20) {
        if (set.has(parent)) return false;
        parent = parent.parentElement;
        depth++;
      }
      return true;
    });
  }

  function sortByDocumentOrder(elements) {
    return elements.slice().sort((a, b) => {
      if (a === b) return 0;
      const pos = a.compareDocumentPosition(b);
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });
  }

  function getClaudeMessageWrapper(el) {
    if (!(el instanceof Element)) return el;
    return el.closest("div.group.relative.inline-flex") ||
      el.closest("div.group.relative.pb-3") ||
      el;
  }

  let _messageElementsCache = null;

  function invalidateMessageCache() {
    _messageElementsCache = null;
  }

  function getMessageElements() {
    if (_messageElementsCache) return _messageElementsCache;
    const selectors = SITE_SELECTORS[host] || [];
    const elements = [];
    const scopeRoot = getMessageRoot();
    if (selectors.length > 0) {
      const combined = selectors.join(",");
      try {
        scopeRoot.querySelectorAll(combined).forEach((el) => elements.push(el));
      } catch {
        selectors.forEach((sel) => {
          scopeRoot.querySelectorAll(sel).forEach((el) => elements.push(el));
        });
      }
    }

    if (elements.length === 0) {
      scopeRoot
        .querySelectorAll("article, [data-testid*='message'], div[class*='message']")
        .forEach((el) => elements.push(el));
    }

    let filtered = uniqueElements(elements).filter((el) => {
      const text = el.textContent || "";
      if (text.trim().length === 0) return false;
      if (host === "aistudio.google.com" && el.closest("ms-thought-chunk")) return false;
      if (host === "aistudio.google.com" && el.closest(".thought-panel")) return false;
      if (host === "aistudio.google.com" && el.closest(".author-label")) return false;
      if (host === "gemini.google.com" && el.classList.contains("conversation-container")) return false;
      if (host === "gemini.google.com" && el.classList.contains("cdk-describedby-message-container")) return false;
      if (host === "chat.qwen.ai" && el.classList.contains("chat-messages")) return false;
      if (el.closest(".tm-export-panel")) return false;
      if (el.classList.contains("tm-export-range")) return false;
      return true;
    });
    if (host === "claude.ai") {
      filtered = uniqueElements(filtered.map((el) => getClaudeMessageWrapper(el)));
    }
    const result = sortByDocumentOrder(filterTopLevel(filtered));
    _messageElementsCache = result;
    return result;
  }

  function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }

  function ensureMessageIds(messageElements) {
    messageElements.forEach((el, idx) => {
      if (!el.dataset.tmExportId) {
        const text = (el.textContent || "").slice(0, 200);
        el.dataset.tmExportId = `msg-${idx}-${simpleHash(text)}`;
      }
    });
  }

  /* ── Per-site sidebar insertion configs ── */
  const SIDEBAR_CONFIGS = {
    "www.doubao.com": {
      // 豆包左栏：主侧栏容器
      containerSel: "#flow_chat_sidebar",
      itemSel: "[data-testid='create_conversation_button']",
      position: "after-create"
    },
    "chat.deepseek.com": {
      containerSel: 'div.ds-scroll-area, nav, aside',
      itemSel: 'a, div[class*="item"]',
      position: "prepend"
    },
    "chatgpt.com": {
      containerSel: 'nav',
      itemSel: 'a',
      position: "prepend"
    },
    "claude.ai": {
      containerSel: 'nav, aside, [role="navigation"]',
      itemSel: 'a, button',
      position: "prepend"
    }
  };

  const EXPORT_ICON_SVG = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3V15M12 15L8 11M12 15L16 11" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M4 17V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V17" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M19 3L19.5 5L21.5 5.5L19.5 6L19 8L18.5 6L16.5 5.5L18.5 5L19 3Z" fill="currentColor"/>
  </svg>`;


  /* ── Shared click handler for sidebar buttons ── */
  function attachExportClickHandler(el) {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!document.querySelector(".tm-export-panel")) createPanel();
      togglePanel();
    });
  }

  /* ── Per-platform sidebar entry creators ── */

  function createDoubaoSidebarEntry() {
    if (document.querySelector("[data-testid='skill-page-item-export']")) return;
    const sidebar = document.querySelector("#flow_chat_sidebar");
    const createBtn = document.querySelector("[data-testid='create_conversation_button']");
    if (!sidebar || !createBtn) return;

    const wrapper = document.createElement("div");
    wrapper.className = "section-zyMRVh";
    wrapper.setAttribute("data-testid", "skill-page-item-export");

    const item = document.createElement("a");
    item.href = "#";
    item.className = "group/sidebar_nav_item cursor-pointer section-item-pcVecT nav-link-IkIer0";
    attachExportClickHandler(item);

    const icon = document.createElement("svg");
    icon.setAttribute("width", "24");
    icon.setAttribute("height", "24");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("fill", "currentColor");
    icon.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    icon.className = "size-16 block text-16 box-content p-2 flex-shrink-0";
    icon.innerHTML = EXPORT_ICON_SVG;

    const content = document.createElement("div");
    content.className = "flex w-full items-center justify-between";

    const label = document.createElement("div");
    label.className = "section-item-title-K023pw title-kfNY6R";
    label.setAttribute("title", "AiMsgExport");
    label.textContent = "AiMsgExport";

    content.appendChild(label);
    item.appendChild(icon);
    item.appendChild(content);
    wrapper.appendChild(item);
    createBtn.insertAdjacentElement("afterend", wrapper);
  }

  function createQwenSidebarEntry() {
    if (document.querySelector("[data-tm-export-entry='qwen']")) return;
    const items = Array.from(document.querySelectorAll(".sidebar-entry-list-content"));
    const communityItem = items.find((item) => {
      const label = item.querySelector(".sidebar-entry-list-text") || item;
      const text = (label.textContent || "").trim();
      return text === "社区";
    });
    if (!communityItem) return;

    const entry = communityItem.cloneNode(true);
    entry.setAttribute("data-tm-export-entry", "qwen");
    attachExportClickHandler(entry);

    const label = entry.querySelector(".sidebar-entry-list-text") || entry;
    if (label) label.textContent = "AiMsgExport";

    const icon = entry.querySelector(".sidebar-entry-list-icon");
    if (icon) {
      icon.innerHTML = EXPORT_ICON_SVG.replace(
        "<svg ",
        '<svg width="1em" height="1em" '
      );
    }

    communityItem.insertAdjacentElement("afterend", entry);
  }

  function createGrokSidebarEntry() {
    if (document.querySelector("[data-tm-export-entry='grok']")) return;
    const menuItems = Array.from(document.querySelectorAll("[data-sidebar='menu-button']"));
    const projectItem = menuItems.find((item) => {
      const label = Array.from(item.querySelectorAll("span")).find((span) => {
        return (span.textContent || "").trim() === "项目";
      });
      return Boolean(label);
    });
    if (!projectItem) return;

    const entry = projectItem.cloneNode(true);
    entry.setAttribute("data-tm-export-entry", "grok");
    if (entry.tagName.toLowerCase() === "a") {
      entry.setAttribute("href", "#");
    }
    attachExportClickHandler(entry);

    const label = Array.from(entry.querySelectorAll("span")).find((span) => {
      return (span.textContent || "").trim() === "项目";
    });
    if (label) label.textContent = "AiMsgExport";

    const icon = entry.querySelector("[data-sidebar='icon']");
    if (icon) {
      icon.innerHTML = EXPORT_ICON_SVG.replace(
        "<svg ",
        '<svg width="18" height="18" '
      );
    }

    projectItem.insertAdjacentElement("beforebegin", entry);
  }

  function createGeminiSidebarEntry() {
    if (document.querySelector("[data-tm-export-entry='gemini']")) return;
    const newChatHost = document.querySelector("side-nav-action-button[data-test-id='new-chat-button']") ||
      document.querySelector("side-nav-action-button") ||
      document.querySelector("[data-test-id='new-chat-button']") ||
      document.querySelector("[data-test-id='new-chat-button'] [data-test-id='expanded-button']");
    if (!newChatHost) return;

    const entryHost = newChatHost.cloneNode(true);
    entryHost.setAttribute("data-tm-export-entry", "gemini");

    entryHost.querySelectorAll("[data-test-id='temp-chat-button'], .side-nav-action-collapsed-button").forEach((el) => el.remove());

    const entry = entryHost.querySelector("[data-test-id='expanded-button']") ||
      entryHost.querySelector("a, button");
    if (!entry) return;
    if (entry.tagName.toLowerCase() === "a") {
      entry.setAttribute("href", "#");
    }
    attachExportClickHandler(entry);

    const label = entry.querySelector("[data-test-id='side-nav-action-button-content']") ||
      entry.querySelector(".mdc-list-item__primary-text span") ||
      entry.querySelector("span");
    if (label) {
      label.textContent = "AiMsgExport";
      label.style.display = "inline";
      label.style.visibility = "visible";
      label.style.opacity = "1";
      label.style.setProperty("color", "currentColor");
      label.style.setProperty("-webkit-text-fill-color", "currentColor");
    }

    const icon = entry.querySelector("[data-test-id='side-nav-action-button-icon']") ||
      entry.querySelector(".mat-mdc-list-item-icon") ||
      entry.querySelector("mat-icon");
    if (icon) {
      icon.innerHTML = EXPORT_ICON_SVG.replace(
        "<svg ",
        '<svg width="18" height="18" '
      );
    }

    newChatHost.insertAdjacentElement("afterend", entryHost);
  }

  function createCopilotSidebarEntry() {
    if (document.querySelector("[data-tm-export-entry='copilot']")) return;
    const navBody = document.querySelector(".fui-NavDrawerBody") || document.body;
    const navItems = Array.from(navBody.querySelectorAll("button.fui-NavItem"));
    const oneNoteItem = navItems.find((item) => {
      const label = (item.getAttribute("aria-label") || "").trim();
      return item.getAttribute("id") === "OneNoteOnline" || item.getAttribute("value") === "OneNoteOnline" || label === "OneNote" || label === "OneNote Online";
    });
    const chatItem = navItems.find((item) => {
      const label = (item.getAttribute("aria-label") || "").trim();
      return item.getAttribute("value") === "chat" || item.getAttribute("id") === "chat" || label === "聊天";
    });
    const anchorItem = oneNoteItem || chatItem;
    if (!anchorItem) return;

    const entry = anchorItem.cloneNode(true);
    entry.setAttribute("data-tm-export-entry", "copilot");
    entry.removeAttribute("aria-current");
    entry.removeAttribute("id");
    entry.removeAttribute("value");
    attachExportClickHandler(entry);

    const labelNode = Array.from(entry.querySelectorAll("span")).find((span) => {
      const text = (span.textContent || "").trim();
      return text && text !== "搜索";
    });
    if (labelNode) labelNode.textContent = "AiMsgExport";

    const icon = entry.querySelector(".fui-NavItem__icon") || entry.querySelector("svg");
    if (icon) {
      icon.innerHTML = EXPORT_ICON_SVG.replace(
        "<svg ",
        '<svg width="20" height="20" '
      );
    }

    anchorItem.insertAdjacentElement("afterend", entry);
  }

  function createPerplexitySidebarEntry() {
    if (document.querySelector("[data-tm-export-entry='perplexity']")) return;
    const sidebar = document.querySelector(".group\\/sidebar") || document.body;
    const items = Array.from(sidebar.querySelectorAll("button.reset.interactable-alt"));
    const moreItem = items.find((item) => {
      const text = (item.textContent || "").trim();
      return text === "更多";
    });
    if (!moreItem) return;

    const entry = moreItem.cloneNode(true);
    entry.setAttribute("data-tm-export-entry", "perplexity");
    attachExportClickHandler(entry);

    const labelCandidates = Array.from(entry.querySelectorAll("div, span"))
      .filter((el) => el.childElementCount === 0)
      .filter((el) => (el.textContent || "").trim().length > 0);
    labelCandidates.forEach((el) => {
      const text = (el.textContent || "").trim();
      if (text === "更多") {
        el.textContent = "AiMsgExport";
      }
    });
    if (labelCandidates.length > 0 && !labelCandidates.some((el) => (el.textContent || "").trim() === "AiMsgExport")) {
      labelCandidates[0].textContent = "AiMsgExport";
    }

    const icon = entry.querySelector("svg") || entry.querySelector(".size-6");
    if (icon) {
      icon.outerHTML = EXPORT_ICON_SVG.replace(
        "<svg ",
        '<svg width="20" height="20" '
      );
    }

    moreItem.insertAdjacentElement("afterend", entry);
  }

  function createAiStudioSidebarEntry() {
    if (document.querySelector("[data-tm-export-entry='aistudio']")) return;
    const nav = document.querySelector(".nav-content") || document.body;
    const docLink = nav.querySelector("a[href*='ai.google.dev/gemini-api/docs']") ||
      Array.from(nav.querySelectorAll("a.ms-button-borderless")).find((link) => {
        const text = (link.textContent || "").trim();
        return text === "Documentation";
      });
    if (!docLink) return;

    const entry = docLink.cloneNode(true);
    entry.setAttribute("data-tm-export-entry", "aistudio");
    entry.setAttribute("href", "#");
    entry.removeAttribute("target");
    attachExportClickHandler(entry);

    const label = entry.querySelector(".nav-item-v3-main-text") ||
      entry.querySelector("span:not(.material-symbols-outlined)");
    if (label) label.textContent = "AiMsgExport";

    const icon = entry.querySelector(".material-symbols-outlined") || entry.querySelector("svg");
    if (icon) {
      icon.innerHTML = EXPORT_ICON_SVG.replace(
        "<svg ",
        '<svg width="20" height="20" '
      );
    }

    docLink.insertAdjacentElement("afterend", entry);
  }

  function createDeepseekSidebarEntry() {
    if (document.querySelector("[data-tm-export-entry='deepseek']")) return;
    const newChatButton = Array.from(
      document.querySelectorAll("div[role='button'], div[tabindex]")
    ).find((item) => {
      const label = item.querySelector("span") || item;
      const text = (label.textContent || "").trim();
      return text === "开启新对话";
    });

    const sidebarRoot = (newChatButton && newChatButton.parentElement) ||
      document.querySelector("div.ds-scroll-area, nav, aside");
    if (!sidebarRoot) return;

    const navItems = Array.from(sidebarRoot.querySelectorAll("a"));
    const refItem = newChatButton || navItems[0];
    if (!refItem) return;

    const entry = refItem.cloneNode(true);
    entry.setAttribute("data-tm-export-entry", "deepseek");
    entry.style.marginTop = "8px";
    if (entry.tagName.toLowerCase() === "a") {
      entry.setAttribute("href", "#");
    }
    attachExportClickHandler(entry);

    entry.querySelectorAll("svg, .ds-icon").forEach((node) => node.remove());

    const iconWrapper = document.createElement("div");
    iconWrapper.className = "ds-icon";
    iconWrapper.style.marginRight = "8px";
    iconWrapper.style.display = "flex";
    iconWrapper.style.alignItems = "center";
    iconWrapper.style.justifyContent = "center";
    iconWrapper.style.width = "17px";
    iconWrapper.style.height = "17px";
    iconWrapper.style.flexShrink = "0";
    iconWrapper.innerHTML = EXPORT_ICON_SVG;
    entry.prepend(iconWrapper);

    const labelNode = entry.querySelector("span") || entry;
    if (labelNode) {
      labelNode.textContent = "AiMsgExport";
      labelNode.style.marginLeft = "0px";
    }

    entry.querySelectorAll("*").forEach((node) => {
      const text = (node.textContent || "").trim();
      if (/ctrl\+j/i.test(text)) node.remove();
    });

    const actions = entry.querySelector("[class*='actions']");
    if (actions) actions.remove();

    if (newChatButton && newChatButton.parentElement) {
      newChatButton.insertAdjacentElement("afterend", entry);
    } else {
      sidebarRoot.prepend(entry);
    }
  }

  function createClaudeSidebarEntry() {
    if (document.querySelector("[data-tm-export-entry='claude']")) return;
    const sidebarRoot = document.querySelector('nav[aria-label="Sidebar"]');
    if (!sidebarRoot) return;

    // 使用 aria-label 精确匹配侧边栏项目，避免 textContent 包含快捷键文本导致匹配失败
    const refLink = sidebarRoot.querySelector('a[aria-label="Customize"]')
      || sidebarRoot.querySelector('a[aria-label="Search"]')
      || sidebarRoot.querySelector('a[aria-label="New chat"]');
    if (!refLink) return;

    // 每个侧边栏项目都被 div.relative.group 包裹，需要克隆整个包裹层
    const refWrapper = refLink.closest('div.relative.group') || refLink.parentElement;
    if (!refWrapper) return;

    const entryWrapper = refWrapper.cloneNode(true);
    entryWrapper.setAttribute("data-tm-export-entry", "claude");

    const entryLink = entryWrapper.querySelector("a");
    if (!entryLink) return;

    entryLink.setAttribute("href", "#");
    entryLink.setAttribute("aria-label", "AiMsgExport");
    entryLink.removeAttribute("data-dd-action-name");
    attachExportClickHandler(entryLink);

    // 替换图标和文字
    const innerWrapper = entryLink.querySelector('div[class*="translate-x"]');
    if (innerWrapper) {
      // 替换图标容器内容
      const iconContainer = innerWrapper.querySelector('.flex.items-center.justify-center.text-text-100');
      if (iconContainer) {
        iconContainer.innerHTML = `<div style="width:16px;height:16px;display:flex;align-items:center;justify-content:center">${EXPORT_ICON_SVG}</div>`;
      }

      // 更新文字标签
      const labelSpan = innerWrapper.querySelector("span.truncate");
      if (labelSpan) {
        labelSpan.innerHTML = '<div class="opacity-100 transition-opacity ease-out duration-150">AiMsgExport</div>';
      }

      // 移除快捷键提示
      innerWrapper.querySelectorAll("span.flex-shrink-0").forEach(n => n.remove());
    }

    // 移除克隆出来的悬浮操作按钮
    entryWrapper.querySelectorAll('.absolute').forEach(n => n.remove());

    refWrapper.insertAdjacentElement("afterend", entryWrapper);
  }

  function createChatgptSidebarEntry() {
    if (document.querySelector("[data-tm-export-entry='chatgpt']")) return;
    const sidebarRoot = document.querySelector("nav[aria-label], nav, aside");
    if (!sidebarRoot) return;

    const menuItems = Array.from(sidebarRoot.querySelectorAll("[data-sidebar-item='true']"));
    const healthItem = menuItems.find((item) => {
      const label = item.querySelector(".truncate") || item;
      const text = (label.textContent || "").trim();
      return text === "Health";
    });

    const refItem = healthItem || menuItems[0];
    if (!refItem) return;

    const entry = refItem.cloneNode(true);
    entry.setAttribute("data-tm-export-entry", "chatgpt");
    if (entry.tagName.toLowerCase() === "a") {
      entry.setAttribute("href", "#");
    }
    attachExportClickHandler(entry);

    entry.querySelectorAll(".icon, svg, [class*='trailing'], kbd").forEach((node) => node.remove());

    const iconWrapper = document.createElement("div");
    iconWrapper.className = "flex items-center justify-center mr-3 text-token-text-secondary flex-shrink-0";
    iconWrapper.style.width = "16px";
    iconWrapper.style.height = "16px";
    iconWrapper.innerHTML = EXPORT_ICON_SVG;
    entry.prepend(iconWrapper);

    const labelNode = entry.querySelector(".truncate") || entry.querySelector("span") || entry;
    if (labelNode) labelNode.textContent = "AiMsgExport";

    if (healthItem && healthItem.parentElement) {
      healthItem.insertAdjacentElement("afterend", entry);
    } else {
      sidebarRoot.appendChild(entry);
    }
  }

  function createGenericSidebarEntry() {
    if (document.querySelector("[data-tm-export-entry='generic']")) return;

    const button = document.createElement("div");
    button.setAttribute("data-tm-export-entry", "generic");
    button.className = "tm-export-btn";
    button.innerHTML = `<div style="width:16px;height:16px;display:flex;align-items:center;justify-content:center">${EXPORT_ICON_SVG}</div><span>AiMsgExport</span>`;
    attachExportClickHandler(button);

    const config = SIDEBAR_CONFIGS[host];
    let inserted = false;

    if (config) {
      const container = document.querySelector(config.containerSel);
      if (container) {
        const refItem = container.querySelector(config.itemSel);
        if (refItem) {
          const refStyle = window.getComputedStyle(refItem);
          button.style.padding = refStyle.padding;
          button.style.fontSize = refStyle.fontSize;
          button.style.color = refStyle.color;
          button.style.borderRadius = refStyle.borderRadius;
          button.style.fontFamily = refStyle.fontFamily;
          button.style.lineHeight = refStyle.lineHeight;
          if (refStyle.height && refStyle.height !== "auto") {
            button.style.height = refStyle.height;
          }
        }

        if (config.position === "append") {
          container.appendChild(button);
        } else {
          container.prepend(button);
        }
        inserted = true;
      }
    }

    if (!inserted) {
      const sidebar = document.querySelector("aside, nav, [role='navigation']");
      if (sidebar) {
        const refItem = sidebar.querySelector("a, button, li, div[class*='item']");
        if (refItem) {
          const refStyle = window.getComputedStyle(refItem);
          button.style.padding = refStyle.padding;
          button.style.fontSize = refStyle.fontSize;
          button.style.color = refStyle.color;
          button.style.borderRadius = refStyle.borderRadius;
          button.style.fontFamily = refStyle.fontFamily;
        }
        sidebar.appendChild(button);
        inserted = true;
      }
    }
  }

  /* ── Sidebar dispatch table ── */
  const SIDEBAR_CREATORS = {
    "www.doubao.com": createDoubaoSidebarEntry,
    "chat.qwen.ai": createQwenSidebarEntry,
    "grok.com": createGrokSidebarEntry,
    "gemini.google.com": createGeminiSidebarEntry,
    "copilot.cloud.microsoft": createCopilotSidebarEntry,
    "m365.cloud.microsoft": createCopilotSidebarEntry,
    "www.perplexity.ai": createPerplexitySidebarEntry,
    "aistudio.google.com": createAiStudioSidebarEntry,
    "chat.deepseek.com": createDeepseekSidebarEntry,
    "claude.ai": createClaudeSidebarEntry,
    "chatgpt.com": createChatgptSidebarEntry,
  };

  function createSidebarButton() {
    const creator = SIDEBAR_CREATORS[host];
    if (creator) { creator(); return; }
    createGenericSidebarEntry();
  }

  function ensureSidebarButton() {
    if (host === "www.doubao.com") {
      if (document.querySelector("[data-testid='skill-page-item-export']")) return;
    }
    createSidebarButton();
  }

  function cleanupDoubaoButtons() {
    const buttons = document.querySelectorAll("[data-testid='skill-page-item-export']");
    for (let i = 1; i < buttons.length; i++) buttons[i].remove();
  }

  /* ── Sidebar observer configs & factory ── */
  const SIDEBAR_OBSERVER_CONFIGS = {
    "www.doubao.com": { selector: "#flow_chat_sidebar", beforeEnsure: cleanupDoubaoButtons },
    "chatgpt.com": { selector: "nav[aria-label], nav, aside" },
    "chat.qwen.ai": { selector: ".sidebar-entry-list" },
    "claude.ai": { selector: '.z-sidebar' },
    "grok.com": { selector: "[data-sidebar='sidebar']" },
    "gemini.google.com": { selector: "side-navigation-content" },
    "copilot.cloud.microsoft": { selector: ".fui-NavDrawerBody" },
    "m365.cloud.microsoft": { selector: ".fui-NavDrawerBody" },
    "www.perplexity.ai": { selector: ".group\\/sidebar" },
    "aistudio.google.com": { selector: ".nav-content" },
    "chat.deepseek.com": { selector: "div.ds-scroll-area, nav, aside" },
  };

  function connectSidebarObserverFor(hostKey) {
    const config = SIDEBAR_OBSERVER_CONFIGS[hostKey || host];
    if (!config) return;
    // Observe document.body as ultimate fallback — immune to SPA sidebar replacement
    const target = document.querySelector(config.selector) || document.body;
    let debounceTimer = null;
    const observer = new MutationObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (config.beforeEnsure) config.beforeEnsure();
        ensureSidebarButton();
      }, 300);
    });
    observer.observe(target, { childList: true, subtree: true });
    // No timeout — observer stays active for the entire page lifetime
  }

  function createPanel() {
    if (document.querySelector(".tm-export-panel")) return;

    const panel = document.createElement("div");
    panel.className = "tm-export-panel tm-export-hidden";

    panel.innerHTML = `
      <div class="tm-export-header">
        <h4>AiMsgExport</h4>
        <button class="tm-export-close" title="关闭">×</button>
      </div>
      
      <div class="tm-export-section">
        <div id="tm-export-count">0</div>
        <div class="tm-export-help">已选消息数量。您可以直接勾选消息，或使用下方的范围选择工具。</div>
      </div>

      <div class="tm-export-section">
        <span class="tm-export-section-title">消息选择</span>
        <div class="tm-row">
          <button id="tm-selection-toggle" class="tm-primary">开启选择模式</button>
        </div>
        <div class="tm-row">
          <button id="tm-select-all">全选</button>
          <button id="tm-clear-selection">清空已选</button>
        </div>
      </div>

      <div class="tm-export-section">
        <span class="tm-export-section-title">导出格式</span>
        <div class="tm-row">
          <button id="tm-export-pdf">PDF 文档</button>
          <button id="tm-export-img">全长图片</button>
        </div>
        <div class="tm-row">
          <button id="tm-export-md">Markdown</button>
          <button id="tm-export-txt">纯文本</button>
        </div>
      </div>

      <div class="tm-export-section" style="margin-bottom: 0;">
        <span class="tm-export-section-title">范围工具</span>
        <div class="tm-row">
          <button id="tm-apply-range">应用范围</button>
          <button id="tm-clear-range">重置</button>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    panel.querySelector("#tm-selection-toggle").addEventListener("click", toggleSelectionMode);
    panel.querySelector("#tm-select-all").addEventListener("click", selectAll);
    panel.querySelector("#tm-clear-selection").addEventListener("click", clearSelection);
    panel.querySelector("#tm-apply-range").addEventListener("click", applyRangeSelection);
    panel.querySelector("#tm-clear-range").addEventListener("click", clearRangeSelection);
    panel.querySelector("#tm-export-pdf").addEventListener("click", (e) => withLoadingState(e.currentTarget, exportPdf));
    panel.querySelector("#tm-export-md").addEventListener("click", (e) => withLoadingState(e.currentTarget, exportMarkdown));
    panel.querySelector("#tm-export-img").addEventListener("click", (e) => withLoadingState(e.currentTarget, exportImage));
    panel.querySelector("#tm-export-txt").addEventListener("click", (e) => withLoadingState(e.currentTarget, exportTxt));
    panel.querySelector(".tm-export-close").addEventListener("click", () => {
      togglePanel();
    });
    setupPanelDrag(panel);
  }

  function togglePanel() {
    const panel = document.querySelector(".tm-export-panel");
    if (!panel) return;
    panel.classList.toggle("tm-export-hidden");
    if (!panel.classList.contains("tm-export-hidden")) {
      positionPanelNearButton(panel);
    }
  }

  function positionPanelNearButton(panel) {
    if (panel.dataset.tmMoved === "true") return;
    const exportNode = document.querySelector("[data-testid='skill-page-item-export']") ||
      document.querySelector("[data-tm-export-entry='deepseek']") ||
      document.querySelector(".tm-export-btn");
    if (!exportNode) return;
    const rect = exportNode.getBoundingClientRect();
    const top = Math.max(20, rect.top + window.scrollY - 10);
    const left = Math.max(20, rect.right + window.scrollX + 12);
    panel.style.top = `${top}px`;
    panel.style.left = `${left}px`;
    panel.style.right = "auto";
  }

  function setupPanelDrag(panel) {
    const header = panel.querySelector(".tm-export-header");
    if (!header) return;
    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    function startDrag(clientX, clientY) {
      dragging = true;
      panel.dataset.tmMoved = "true";
      panel.style.transition = "none";
      const rect = panel.getBoundingClientRect();
      offsetX = clientX - rect.left;
      offsetY = clientY - rect.top;
    }

    function moveDrag(clientX, clientY) {
      if (!dragging) return;
      const left = Math.max(10, clientX - offsetX);
      const top = Math.max(10, clientY - offsetY);
      panel.style.left = `${left}px`;
      panel.style.top = `${top}px`;
      panel.style.right = "auto";
    }

    function stopDrag() {
      if (!dragging) return;
      dragging = false;
      panel.style.transition = "";
    }

    header.addEventListener("mousedown", (e) => {
      startDrag(e.clientX, e.clientY);
      e.preventDefault();
    });
    document.addEventListener("mousemove", (e) => moveDrag(e.clientX, e.clientY));
    document.addEventListener("mouseup", stopDrag);

    header.addEventListener("touchstart", (e) => {
      const t = e.touches[0];
      startDrag(t.clientX, t.clientY);
      e.preventDefault();
    }, { passive: false });
    document.addEventListener("touchmove", (e) => {
      if (!dragging) return;
      const t = e.touches[0];
      moveDrag(t.clientX, t.clientY);
    }, { passive: true });
    document.addEventListener("touchend", stopDrag);
  }

  function toggleSelectionMode() {
    state.selectionMode = !state.selectionMode;
    invalidateMessageCache();
    const btn = document.querySelector("#tm-selection-toggle");
    if (btn) btn.textContent = state.selectionMode ? "退出选择" : "开启选择";
    if (state.selectionMode) {
      scheduleRenderSelectionControls();
      connectObserver();
    } else {
      removeSelectionControls();
      disconnectObserver();
    }
  }

  function scheduleRenderSelectionControls(newElements) {
    if (!state.selectionMode) return;
    if (state.rendering) return;

    const messageElements = Array.isArray(newElements) && newElements.length > 0
      ? newElements
      : getMessageElements();

    ensureMessageIds(messageElements);
    const queue = [];
    messageElements.forEach((el) => {
      if (state.processedElements.has(el)) return;
      if (el.nextElementSibling && el.nextElementSibling.classList.contains("tm-export-range")) {
        state.processedElements.add(el);
        return;
      }
      queue.push(el);
    });

    if (queue.length === 0) {
      updateCount();
      return;
    }

    if (state.selectionMode) {
      insertStartBeforeFirstMessage(messageElements);
    }

    state.renderQueue = queue;
    state.rendering = true;
    processRenderQueue();
  }

  function insertStartBeforeFirstMessage(messageElements) {
    if (document.querySelector(".tm-export-range-start")) return;
    const first = messageElements[0];
    if (!first || !first.parentElement) return;
    const range = document.createElement("div");
    range.className = "tm-export-range tm-export-range-start";
    const startBtn = document.createElement("button");
    startBtn.dataset.action = "start";
    startBtn.textContent = "从这里开始";
    startBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      document.querySelectorAll(".tm-export-range button[data-action='start']").forEach((btn) =>
        btn.classList.remove("tm-range-active")
      );
      state.startId = first.dataset.tmExportId || null;
      startBtn.classList.add("tm-range-active");
      if (state.endId) applyRangeSelection();
      updateCount();
    });
    range.appendChild(startBtn);
    first.parentElement.insertBefore(range, first);
  }

  function processRenderQueue() {
    if (!state.selectionMode) {
      state.renderQueue = [];
      state.rendering = false;
      return;
    }

    const start = performance.now();
    while (state.renderQueue.length > 0 && performance.now() - start < 8) {
      const el = state.renderQueue.shift();
      if (!el || state.processedElements.has(el)) continue;
      if (el.nextElementSibling && el.nextElementSibling.classList.contains("tm-export-range")) {
        state.processedElements.add(el);
        continue;
      }

      const range = document.createElement("div");
      range.className = "tm-export-range";

      const startBtn = document.createElement("button");
      startBtn.dataset.action = "start";
      startBtn.textContent = "从这里开始";

      const endBtn = document.createElement("button");
      endBtn.dataset.action = "end";
      endBtn.textContent = "到这里结束";

      range.appendChild(startBtn);
      range.appendChild(endBtn);

      const id = el.dataset.tmExportId;
      if (state.selectedIds.has(id)) {
        el.classList.add("tm-export-selected");
      }

      if (!el.dataset.tmSelectable) {
        el.dataset.tmSelectable = "true";
        el.addEventListener("click", (e) => {
          if (!state.selectionMode) return;
          if (e.target.closest(".tm-export-range")) return;
          if (e.target.closest("a[href]")) return;
          if (state.selectedIds.has(id)) {
            state.selectedIds.delete(id);
            el.classList.remove("tm-export-selected");
          } else {
            state.selectedIds.add(id);
            el.classList.add("tm-export-selected");
          }
          updateCount();
        });
      }

      startBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.querySelectorAll(".tm-export-range button[data-action='start']").forEach((btn) =>
          btn.classList.remove("tm-range-active")
        );
        state.startId = id;
        startBtn.classList.add("tm-range-active");
        if (state.endId) applyRangeSelection();
        updateCount();
      });

      endBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.querySelectorAll(".tm-export-range button[data-action='end']").forEach((btn) =>
          btn.classList.remove("tm-range-active")
        );
        state.endId = id;
        endBtn.classList.add("tm-range-active");
        if (state.startId) applyRangeSelection();
        updateCount();
      });

      el.insertAdjacentElement("afterend", range);
      state.processedElements.add(el);
    }

    if (state.renderQueue.length > 0) {
      requestAnimationFrame(processRenderQueue);
    } else {
      state.rendering = false;
      updateCount();
    }
  }

  function removeSelectionControls() {
    document.querySelectorAll(".tm-export-range").forEach((el) => el.remove());
    state.processedElements = new WeakSet();
    state.renderQueue = [];
    state.rendering = false;
  }

  function applyRangeSelection() {
    const messageElements = getMessageElements();
    ensureMessageIds(messageElements);

    if (!state.startId || !state.endId) return;
    const startIndex = messageElements.findIndex((el) => el.dataset.tmExportId === state.startId);
    const endIndex = messageElements.findIndex((el) => el.dataset.tmExportId === state.endId);
    if (startIndex === -1 || endIndex === -1) return;
    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);
    state.selectedIds.clear();

    messageElements.forEach((el, idx) => {
      if (idx >= start && idx <= end) {
        state.selectedIds.add(el.dataset.tmExportId);
      }
    });

    if (state.selectionMode) {
      messageElements.forEach((el) => {
        const selected = state.selectedIds.has(el.dataset.tmExportId);
        if (selected) {
          el.classList.add("tm-export-selected");
        } else {
          el.classList.remove("tm-export-selected");
        }
      });
    }
    updateCount();
  }

  function clearRangeSelection() {
    state.startId = null;
    state.endId = null;
    document.querySelectorAll(".tm-export-range button").forEach((btn) =>
      btn.classList.remove("tm-range-active")
    );
    updateCount();
  }

  function clearSelection() {
    state.selectedIds.clear();
    if (state.selectionMode) {
      document.querySelectorAll(".tm-export-selected").forEach((el) => el.classList.remove("tm-export-selected"));
    }
    updateCount();
  }

  function selectAll() {
    const messageElements = getMessageElements();
    ensureMessageIds(messageElements);
    if (!state.selectionMode) {
      toggleSelectionMode();
    }
    messageElements.forEach((el) => {
      state.selectedIds.add(el.dataset.tmExportId);
      el.classList.add("tm-export-selected");
    });
    updateCount();
  }

  function showToast(message) {
    let toast = document.querySelector(".tm-export-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "tm-export-toast";
      toast.style.cssText = "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);padding:10px 20px;background:#1e293b;color:#fff;border-radius:8px;font-size:13px;z-index:10001;opacity:0;transition:opacity 0.3s;pointer-events:none;";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = "1";
    clearTimeout(toast._tid);
    toast._tid = setTimeout(() => { toast.style.opacity = "0"; }, 3000);
  }

  async function withLoadingState(btn, fn) {
    const allBtns = document.querySelectorAll(".tm-export-panel button[id^='tm-export-']");
    const origText = btn.textContent;
    allBtns.forEach(b => { b.disabled = true; });
    btn.textContent = "导出中...";
    try {
      await fn();
      showToast("导出完成");
    } catch (err) {
      showToast("导出失败: " + (err.message || err));
    } finally {
      allBtns.forEach(b => { b.disabled = false; });
      btn.textContent = origText;
    }
  }

  function updateCount() {
    const countEl = document.querySelector("#tm-export-count");
    if (!countEl) return;
    countEl.textContent = `已选：${state.selectedIds.size}`;
  }

  function getSelectedMessages() {
    const messageElements = getMessageElements();
    ensureMessageIds(messageElements);
    return messageElements.filter((el) => state.selectedIds.has(el.dataset.tmExportId));
  }

  function ensureInPageHost() {
    let hostEl = document.querySelector(".tm-export-host");
    if (hostEl) return hostEl;
    hostEl = document.createElement("div");
    hostEl.className = "tm-export-host";
    if (host === "www.doubao.com") {
      const sidebar = document.querySelector("#flow_chat_sidebar");
      if (sidebar) {
        sidebar.appendChild(hostEl);
        return hostEl;
      }
    }
    const root = getChatRoot();
    root.appendChild(hostEl);
    return hostEl;
  }


  function elementMatchesAny(el, selectors) {
    for (const sel of selectors) {
      try {
        if (el.matches(sel) || el.querySelector(sel)) return true;
      } catch {
        // ignore invalid selector
      }
    }
    return false;
  }

  function guessRole(el) {
    const roleAttr = el.getAttribute("data-message-author-role") || el.getAttribute("data-author");
    if (roleAttr) return roleAttr;

    const hostSelectors = ROLE_SELECTORS[host];
    if (hostSelectors) {
      if (elementMatchesAny(el, hostSelectors.user)) return "user";
      if (elementMatchesAny(el, hostSelectors.assistant)) return "assistant";
    }

    const roleNode = el.querySelector("[data-message-author-role], [data-author]");
    if (roleNode) {
      return roleNode.getAttribute("data-message-author-role") || roleNode.getAttribute("data-author") || "message";
    }

    const className = (el.className || "").toString().toLowerCase();
    if (className.includes("user")) return "user";
    if (className.includes("assistant") || className.includes("model")) return "assistant";
    return "message";
  }

  function roleLabel(role) {
    if (role === "user" || role === "human") return "用户";
    if (role === "assistant" || role === "model") return "AI";
    return "AI";
  }

  function cloneMessageForExport(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll(
      ".tm-export-range, button, textarea, input, .sr-only, [role='button']"
    ).forEach((node) => node.remove());
    if (host === "aistudio.google.com") {
      clone.querySelectorAll(
        "ms-thought-chunk, .thought-panel, .thought-collapsed-text, .thinking-progress-icon, .mat-accordion, .mat-expansion-panel, .author-label, .timestamp, .model-run-time-pill, .turn-footer, .turn-information, .actions-container, ms-chat-turn-options"
      ).forEach((node) => node.remove());
    }
    sanitizeCloneForExport(clone);
    return clone;
  }

  function normalizeExportText(text) {
    if (!text) return "";
    return text.replace(/已经完成思考\s*/g, "").trim();
  }

  /**
   * Sanitize a cloned DOM tree for export:
   * - Strip all classes, IDs, data attributes (prevents host CSS from applying)
   * - Remove all inline styles (prevents host-injected layout from interfering)
   * - Our EXPORT_CONTENT_CSS provides clean, consistent styling via tag selectors
   */
  function sanitizeCloneForExport(clone) {
    // Sanitize root
    clone.removeAttribute('style');
    clone.removeAttribute('id');
    for (const attr of Array.from(clone.attributes)) {
      if (attr.name.startsWith('data-') && !attr.name.startsWith('data-tm')) {
        clone.removeAttribute(attr.name);
      }
    }

    // Sanitize all descendants
    clone.querySelectorAll('*').forEach(node => {
      // Strip all classes (host CSS won't match)
      if (node.classList && node.classList.length > 0) {
        node.className = '';
      }
      // Strip IDs and data attributes
      node.removeAttribute('id');
      for (const attr of Array.from(node.attributes)) {
        if (attr.name.startsWith('data-')) {
          node.removeAttribute(attr.name);
        }
      }
      // Remove ALL inline styles — let export CSS handle everything
      node.removeAttribute('style');
    });
  }

  /* ── Export container styles for markdown/rich content ── */
  const EXPORT_CONTENT_CSS = `
    /* Hard reset: revert ALL host-page CSS for export isolation */
    .tm-ec *, .tm-ec *::before, .tm-ec *::after {
      all: revert;
      box-sizing: border-box;
      max-width: 100%;
    }
    /* Force safe layout on message content — override any surviving host rules */
    .tm-ec-msg, .tm-ec-msg * {
      position: static !important;
      float: none !important;
      transform: none !important;
      -webkit-transform: none !important;
      z-index: auto !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
    .tm-ec { line-height: 1.6; word-break: break-word; overflow-wrap: break-word; color: #0f172a; }

    /* Headings */
    .tm-ec h1, .tm-ec h2, .tm-ec h3, .tm-ec h4, .tm-ec h5, .tm-ec h6 {
      margin: 16px 0 8px; font-weight: 600; line-height: 1.35; color: #0f172a;
    }
    .tm-ec h1 { font-size: 1.5em; }
    .tm-ec h2 { font-size: 1.3em; }
    .tm-ec h3 { font-size: 1.15em; }
    .tm-ec h4, .tm-ec h5, .tm-ec h6 { font-size: 1em; }

    /* Paragraphs */
    .tm-ec p { margin: 8px 0; line-height: 1.7; }

    /* Links */
    .tm-ec a { color: #2563eb; text-decoration: underline; }

    /* Lists */
    .tm-ec ul, .tm-ec ol { margin: 8px 0; padding-left: 24px; }
    .tm-ec li { margin: 4px 0; line-height: 1.6; }
    .tm-ec ul { list-style-type: disc; }
    .tm-ec ol { list-style-type: decimal; }
    .tm-ec li > ul, .tm-ec li > ol { margin: 2px 0; }

    /* Inline code */
    .tm-ec code {
      font-family: "SF Mono", "Fira Code", "Cascadia Code", Consolas, monospace;
      font-size: 0.875em; background: #f1f5f9; color: #dc2626;
      padding: 2px 6px; border-radius: 4px; white-space: pre-wrap;
      word-break: break-all;
    }

    /* Code blocks */
    .tm-ec pre {
      margin: 12px 0; padding: 14px 16px; border-radius: 8px;
      background: #1e293b !important; color: #e2e8f0 !important;
      overflow-x: auto; font-size: 13px; line-height: 1.55;
      white-space: pre-wrap; word-break: break-all;
    }
    .tm-ec pre code {
      background: none !important; color: inherit !important;
      padding: 0; border-radius: 0; font-size: inherit;
      white-space: pre-wrap; word-break: break-all;
    }

    /* Blockquotes */
    .tm-ec blockquote {
      margin: 12px 0; padding: 10px 16px;
      border-left: 4px solid #3b82f6; background: #eff6ff;
      color: #1e40af; border-radius: 0 6px 6px 0;
    }
    .tm-ec blockquote p { margin: 4px 0; }

    /* Tables */
    .tm-ec table {
      width: 100%; border-collapse: collapse; margin: 12px 0;
      font-size: 13px; table-layout: fixed;
    }
    .tm-ec th, .tm-ec td {
      border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left;
      word-break: break-word; overflow-wrap: break-word;
    }
    .tm-ec th { background: #f1f5f9; font-weight: 600; color: #334155; }
    .tm-ec tr:nth-child(even) td { background: #f8fafc; }

    /* Horizontal rule */
    .tm-ec hr {
      border: none; border-top: 1px solid #e2e8f0;
      margin: 16px 0;
    }

    /* Images */
    .tm-ec img { max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0; }

    /* Strong / emphasis */
    .tm-ec strong, .tm-ec b { font-weight: 600; }
    .tm-ec em, .tm-ec i { font-style: italic; }

    /* Definition lists / details */
    .tm-ec details { margin: 8px 0; }
    .tm-ec summary { cursor: pointer; font-weight: 500; }

    /* Math / KaTeX containers */
    .tm-ec .katex-display, .tm-ec .MathJax_Display { overflow-x: auto; margin: 8px 0; }
    .tm-ec .katex { font-size: 1em; }

    /* Overflow protection */
    .tm-ec-msg { overflow: visible; }
    .tm-ec-msg > * { max-width: 100%; }

    /* SVG / media */
    .tm-ec svg { max-width: 100%; height: auto; }
    .tm-ec video, .tm-ec audio { max-width: 100%; }
  `;

  function injectExportStyles(container) {
    container.classList.add("tm-ec");
    const style = document.createElement("style");
    style.textContent = EXPORT_CONTENT_CSS;
    container.prepend(style);
  }

  function svgToDataUrl(svg) {
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  function createExportHeader() {
    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.justifyContent = "space-between";
    header.style.alignItems = "center";
    header.style.marginBottom = "18px";
    header.style.paddingBottom = "12px";
    header.style.borderBottom = "1px solid #e2e8f0";

    const brand = SITE_BRAND[host] || { name: "AI Chat", color: "#2563eb", icon: "AI" };

    const left = document.createElement("div");
    left.style.display = "flex";
    left.style.alignItems = "center";
    left.style.gap = "10px";

    const icon = document.createElement("img");
    icon.style.width = "36px";
    icon.style.height = "36px";
    icon.style.borderRadius = "10px";
    icon.style.objectFit = "contain";
    icon.style.background = "#ffffff";
    icon.style.border = "1px solid #e2e8f0";

    const svg = SITE_ICON_SVGS[host];
    if (svg) {
      icon.src = svgToDataUrl(svg);
    } else if (brand.imgUrl) {
      icon.src = brand.imgUrl;
    } else {
      const fallback = document.createElement("div");
      fallback.textContent = brand.icon;
      fallback.style.width = "36px";
      fallback.style.height = "36px";
      fallback.style.display = "inline-flex";
      fallback.style.alignItems = "center";
      fallback.style.justifyContent = "center";
      fallback.style.borderRadius = "10px";
      fallback.style.fontSize = "11px";
      fallback.style.fontWeight = "700";
      fallback.style.letterSpacing = "0.6px";
      fallback.style.background = brand.color;
      fallback.style.color = "#ffffff";
      left.appendChild(fallback);
    }

    const title = document.createElement("div");
    title.textContent = `${brand.name} Export`;
    title.style.fontSize = "18px";
    title.style.fontWeight = "700";

    if (icon.src) left.appendChild(icon);
    left.appendChild(title);

    const meta = document.createElement("div");
    meta.textContent = new Date().toLocaleString();
    meta.style.fontSize = "12px";
    meta.style.color = "#64748b";

    header.appendChild(left);
    header.appendChild(meta);
    return header;
  }

  function createMessageWrapper(el, index) {
    const wrapper = document.createElement("div");
    wrapper.style.border = "none";
    wrapper.style.borderRadius = "12px";
    wrapper.style.padding = "14px 16px";
    wrapper.style.marginBottom = "14px";
    wrapper.style.background = "#ffffff";
    wrapper.style.boxShadow = "0 6px 16px rgba(15,23,42,0.06)";
    wrapper.style.overflow = "visible";
    const role = roleLabel(guessRole(el));
    const isUser = role === "用户";
    const heading = document.createElement("div");
    heading.textContent = role;
    heading.style.fontWeight = "600";
    heading.style.marginBottom = "8px";
    heading.style.fontSize = "12px";
    heading.style.color = isUser ? "#1d4ed8" : "#0f766e";
    heading.style.textTransform = "uppercase";
    heading.style.letterSpacing = "0.8px";
    const clone = cloneMessageForExport(el);
    clone.className = "tm-ec-msg";
    clone.style.fontSize = "14px";
    clone.style.lineHeight = "1.6";
    clone.style.maxWidth = "100%";
    clone.style.overflowWrap = "break-word";
    if (role) wrapper.appendChild(heading);
    wrapper.appendChild(clone);
    wrapper.setAttribute("data-index", index + 1);
    return wrapper;
  }

  function createExportContainer(messages) {
    const container = document.createElement("div");
    container.style.width = "820px";
    container.style.padding = "28px";
    container.style.background = "#f8fafc";
    container.style.color = "#0f172a";
    container.style.fontFamily = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
    injectExportStyles(container);
    container.appendChild(createExportHeader());
    messages.forEach((el, index) => {
      container.appendChild(createMessageWrapper(el, index));
    });
    return container;
  }

  /** Calculate the maximum safe scale for html2canvas to avoid exceeding browser canvas limits */
  function getSafeScale(cssWidth, cssHeight, desiredScale) {
    // Browser limits: Chrome/Safari ~16384 per dimension, ~268M total pixels
    // Use conservative limits to be safe across browsers
    const MAX_DIM = 16384;
    const MAX_AREA = 200_000_000;
    let scale = desiredScale;
    if (cssWidth * scale > MAX_DIM) scale = Math.floor(MAX_DIM / cssWidth * 100) / 100;
    if (cssHeight * scale > MAX_DIM) scale = Math.floor(MAX_DIM / cssHeight * 100) / 100;
    if (cssWidth * scale * cssHeight * scale > MAX_AREA) {
      scale = Math.floor(Math.sqrt(MAX_AREA / (cssWidth * cssHeight)) * 100) / 100;
    }
    return Math.max(1, scale);
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function exportFilename(ext) {
    const brand = SITE_BRAND[host];
    const platform = brand ? brand.name.toLowerCase().replace(/\s+/g, "-") : "chat";
    const date = new Date().toISOString().slice(0, 10);
    return `${platform}-export-${date}.${ext}`;
  }

  function exportMarkdown() {
    const messages = getSelectedMessages();
    if (messages.length === 0) return;
    const turndownService = new TurndownService();
    turndownService.addRule("fencedCodeBlock", {
      filter: (node) => node.nodeName === "PRE" && node.querySelector("code"),
      replacement: (content, node) => {
        const code = node.querySelector("code");
        const cls = code.getAttribute("class") || "";
        const langMatch = cls.match(/language-(\S+)/);
        const lang = langMatch ? langMatch[1] : "";
        const text = code.textContent || "";
        return `\n\n\`\`\`${lang}\n${text}\n\`\`\`\n\n`;
      }
    });
    const content = messages
      .map((el, idx) => {
        const role = roleLabel(guessRole(el));
        const clone = cloneMessageForExport(el);
        const md = normalizeExportText(turndownService.turndown(clone.innerHTML));
        return `### ${role}\n\n${md}`;
      })
      .join("\n\n---\n\n");
    const blob = new Blob([content], { type: "text/markdown" });
    downloadBlob(blob, exportFilename("md"));
  }

  function exportTxt() {
    const messages = getSelectedMessages();
    if (messages.length === 0) return;
    const content = messages.map((el, idx) => {
      const role = roleLabel(guessRole(el));
      const clone = cloneMessageForExport(el);
      const text = normalizeExportText(clone.textContent || "");
      return `${role}\n${text}`;
    })
      .join("\n\n---\n\n");
    const blob = new Blob([content], { type: "text/plain" });
    downloadBlob(blob, exportFilename("txt"));
  }

  async function exportImage() {
    const messages = getSelectedMessages();
    if (messages.length === 0) return;
    const container = createExportContainer(messages);
    container.style.position = "fixed";
    container.style.left = "-9999px";
    document.body.appendChild(container);

    await new Promise(r => requestAnimationFrame(r));
    const w = container.offsetWidth;
    const h = container.offsetHeight;
    const scale = getSafeScale(w, h, 2);

    const canvas = await html2canvas(container, {
      scale,
      useCORS: true,
      backgroundColor: "#f8fafc",
      logging: false,
      imageTimeout: 5000,
      width: w,
      height: h
    });
    container.remove();
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, exportFilename("png"));
    });
  }

  /** Create a styled off-screen container for export rendering */
  function createOffscreenExportContainer(width, padding) {
    const c = document.createElement("div");
    c.style.cssText = `width:${width}px;padding:${padding}px;background:#f8fafc;color:#0f172a;font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif;position:fixed;left:-9999px;`;
    injectExportStyles(c);
    return c;
  }

  async function exportPdf() {
    const messages = getSelectedMessages();
    if (messages.length === 0) return;

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentBoxWidth = 820;
    const containerPadding = 28;
    const containerTotalWidth = contentBoxWidth + containerPadding * 2;

    const maxCssHeight = pageHeight * containerTotalWidth / pageWidth;
    const usableHeight = maxCssHeight - containerPadding * 2;

    // Phase 1: Create all wrappers ONCE and measure
    const measurer = createOffscreenExportContainer(contentBoxWidth, containerPadding);
    document.body.appendChild(measurer);

    const headerEl = createExportHeader();
    measurer.appendChild(headerEl);
    const wrappers = messages.map((el, idx) => {
      const w = createMessageWrapper(el, idx);
      measurer.appendChild(w);
      return w;
    });

    await new Promise(r => requestAnimationFrame(r));

    const headerHeight = headerEl.offsetHeight + 18;
    const msgHeights = wrappers.map(w => w.offsetHeight + 14);
    measurer.remove();

    // Phase 2: Group into pages
    const pages = [];
    let currentPage = [];
    let currentHeight = headerHeight;

    for (let i = 0; i < messages.length; i++) {
      if (currentPage.length > 0 && currentHeight + msgHeights[i] > usableHeight) {
        pages.push(currentPage);
        currentPage = [];
        currentHeight = 0;
      }
      currentPage.push(i);
      currentHeight += msgHeights[i];
    }
    if (currentPage.length > 0) pages.push(currentPage);

    // Phase 3: Render each page by MOVING existing wrappers (not re-creating)
    for (let p = 0; p < pages.length; p++) {
      const container = createOffscreenExportContainer(contentBoxWidth, containerPadding);
      document.body.appendChild(container);

      if (p === 0) container.appendChild(headerEl);
      pages[p].forEach(idx => container.appendChild(wrappers[idx]));

      await new Promise(r => requestAnimationFrame(r));
      const scale = getSafeScale(container.offsetWidth, container.offsetHeight, 2);

      const canvas = await html2canvas(container, {
        scale,
        useCORS: true,
        backgroundColor: "#f8fafc",
        logging: false,
        imageTimeout: 5000,
        width: container.offsetWidth,
        height: container.offsetHeight
      });
      container.remove();

      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (p > 0) pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
    }

    pdf.save(exportFilename("pdf"));
  }

  function elementMatchesMessage(el) {
    if (!(el instanceof Element)) return false;
    const selectors = SITE_SELECTORS[host] || [];
    return selectors.some((sel) => {
      try {
        return el.matches(sel);
      } catch {
        return false;
      }
    });
  }

  function collectMessageElementsFromNodes(nodes) {
    const collected = [];
    nodes.forEach((node) => {
      if (!(node instanceof Element)) return;
      if (elementMatchesMessage(node)) collected.push(node);
      const selectors = SITE_SELECTORS[host] || [];
      selectors.forEach((sel) => {
        node.querySelectorAll(sel).forEach((el) => collected.push(el));
      });
    });
    return uniqueElements(collected);
  }

  function connectObserver() {
    if (state.observer) return;
    state.observer = new MutationObserver((mutations) => {
      if (!state.selectionMode || state.observerQueued) return;
      invalidateMessageCache();
      const added = [];
      mutations.forEach((m) => {
        if (m.addedNodes && m.addedNodes.length) {
          added.push(...collectMessageElementsFromNodes(m.addedNodes));
        }
      });
      if (added.length === 0) return;
      state.observerQueued = true;
      requestAnimationFrame(() => {
        state.observerQueued = false;
        scheduleRenderSelectionControls(added);
      });
    });
    state.observer.observe(getChatRoot(), { childList: true, subtree: true });
  }

  function disconnectObserver() {
    if (!state.observer) return;
    state.observer.disconnect();
    state.observer = null;
    state.observerQueued = false;
  }


  /* ── Init retry configs ── */
  const INIT_CONFIGS = {
    "www.doubao.com": { checkSel: "[data-testid='skill-page-item-export']", interval: 500, timeout: 15000, observer: true },
    "chat.deepseek.com": { checkSel: "[data-tm-export-entry='deepseek']", interval: 700, timeout: 20000, observer: true },
    "chatgpt.com": { checkSel: "[data-tm-export-entry='chatgpt']", interval: 700, timeout: 20000, observer: true },
    "chat.qwen.ai": { checkSel: "[data-tm-export-entry='qwen']", interval: 700, timeout: 20000, observer: true },
    "grok.com": { checkSel: "[data-tm-export-entry='grok']", interval: 700, timeout: 20000, observer: true },
    "gemini.google.com": { checkSel: "[data-tm-export-entry='gemini']", interval: 700, timeout: 20000, observer: true },
    "copilot.cloud.microsoft": { checkSel: "[data-tm-export-entry='copilot']", interval: 700, timeout: 20000, observer: true },
    "m365.cloud.microsoft": { checkSel: "[data-tm-export-entry='copilot']", interval: 700, timeout: 20000, observer: true },
    "www.perplexity.ai": { checkSel: "[data-tm-export-entry='perplexity']", interval: 700, timeout: 20000, observer: true },
    "aistudio.google.com": { checkSel: "[data-tm-export-entry='aistudio']", interval: 700, timeout: 20000, observer: true },
    "claude.ai": { checkSel: "[data-tm-export-entry='claude']", interval: 700, timeout: 20000, observer: true },
  };

  function init() {
    createSidebarButton();
    createPanel();
    const cfg = INIT_CONFIGS[host];
    if (cfg) {
      // Phase 1: Fast retries during initial page load
      const retryId = setInterval(() => {
        ensureSidebarButton();
        if (document.querySelector(cfg.checkSel)) clearInterval(retryId);
      }, cfg.interval);
      setTimeout(() => clearInterval(retryId), cfg.timeout);

      // Phase 2: Persistent slow check — survives SPA navigation
      setInterval(() => {
        if (!document.querySelector(cfg.checkSel)) {
          ensureSidebarButton();
        }
      }, 3000);

      if (cfg.observer) connectSidebarObserverFor(host);
    }
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
