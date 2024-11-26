const PUBLIC_JSON_URL = "https://hartomedia.github.io/bsky-emoji-db/config.json";

fetch(PUBLIC_JSON_URL)
  .then((response) => response.json())
  .then((config) => {
    const replacements = config.replacements;

    function replaceText(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const parent = node.parentElement;
        let textContent = node.textContent;

        replacements.forEach((replacement) => {
          const regex = new RegExp(replacement.replace, "gi");

          if (replacement.with.startsWith("http://") || replacement.with.startsWith("https://")) {
            if (regex.test(textContent)) {
              const updatedHTML = textContent.replace(regex, () => {
                return `<img src="${replacement.with}" alt="${replacement.replace}" style="width: 1em; height: 1em;">`;
              });

              const wrapper = document.createElement("span");
              wrapper.innerHTML = updatedHTML;
              parent.replaceChild(wrapper, node);
            }
          } else {
            textContent = textContent.replace(regex, replacement.with);
          }
        });

        if (textContent !== node.textContent) {
          node.textContent = textContent;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        for (const child of node.childNodes) {
          replaceText(child);
        }
      }
    }

    function replaceInSpecialPlaces() {
      if (document.title) {
        let updatedTitle = document.title;
        replacements.forEach((replacement) => {
          const regex = new RegExp(replacement.replace, "gi");
          updatedTitle = updatedTitle.replace(regex, replacement.with);
        });
        document.title = updatedTitle;
      }
    }

    if (document.body) {
      replaceText(document.body);
    }

    replaceInSpecialPlaces();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const addedNode of mutation.addedNodes) {
          if (addedNode.nodeType === Node.ELEMENT_NODE) {
            replaceText(addedNode);
          }
        }
      }
      replaceInSpecialPlaces();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  })
  .catch((error) => {
    console.error("Failed to load configuration or replace text:", error);
  });
