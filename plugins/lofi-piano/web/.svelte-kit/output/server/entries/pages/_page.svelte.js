import "clsx";
function Layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<main class="svelte-qgpshq"><div class="container svelte-qgpshq"><div class="header svelte-qgpshq"><h1 class="svelte-qgpshq">🎹 LoFi Piano</h1> <p class="subtitle svelte-qgpshq">Nostalgic warm piano for lo-fi hip-hop beats</p> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[!-->");
      {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="loading svelte-qgpshq"><div class="spinner svelte-qgpshq"></div> <p class="svelte-qgpshq">Initializing audio system...</p> <p class="loading-hint svelte-qgpshq">Click anywhere to unlock audio (iOS/mobile)</p></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></main>`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    Layout($$renderer2);
  });
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
