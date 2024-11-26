const PUBLIC_JSON_URL = "https://hartomedia.github.io/bsky-emoji-db/config.json"; // Replace with your JSON URL

fetch(PUBLIC_JSON_URL)
  .then((response) => response.json())
  .then((config) => {
    const replacements = config.replacements;

    // Function to replace text in nodes
    function replaceText(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const parent = node.parentElement;
        let textContent = node.textContent;

        replacements.forEach((replacement) => {
          const regex = new RegExp(replacement.replace, "gi");

          if (replacement.with.startsWith("http://") || replacement.with.startsWith("https://")) {
            // Replace text with an inline image or GIF from a public URL
            if (regex.test(textContent)) {
              const updatedHTML = textContent.replace(regex, () => {
                return `<img src="${replacement.with}" alt="${replacement.replace}" style="width: 1em; height: 1em;">`;
              });

              const wrapper = document.createElement("span");
              wrapper.innerHTML = updatedHTML;
              parent.replaceChild(wrapper, node);
            }
          } else {
            // Regular text replacement
            textContent = textContent.replace(regex, replacement.with);
          }
        });

        // If only text was replaced, update the text node
        if (textContent !== node.textContent) {
          node.textContent = textContent;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        for (const child of node.childNodes) {
          replaceText(child);
        }
      }
    }

    // Function to replace text in <title> and shadow DOMs
    function replaceInSpecialPlaces() {
      // Replace in <title> for the top navigation bar
      if (document.title) {
        let updatedTitle = document.title;
        replacements.forEach((replacement) => {
          const regex = new RegExp(replacement.replace, "gi");
          updatedTitle = updatedTitle.replace(regex, replacement.with);
        });
        document.title = updatedTitle;
      }
    }

    // Run the replacement on the entire document body
    if (document.body) {
      replaceText(document.body);
    }

    // Replace in special places like <title>
    replaceInSpecialPlaces();

    // Observe future changes and apply replacements dynamically
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const addedNode of mutation.addedNodes) {
          if (addedNode.nodeType === Node.ELEMENT_NODE) {
            replaceText(addedNode);
          }
        }
      }
      // Recheck <title> on mutations
      replaceInSpecialPlaces();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  })
  .catch((error) => {
    console.error("Failed to load configuration or replace text:", error);
  });
