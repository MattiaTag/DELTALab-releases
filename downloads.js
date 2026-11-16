// The site's one script (ROADMAP Phase 32, D3/D4/D5/D6).
//
// It asks GitHub's public releases API for the latest release and fills in the version
// and the exact download links. The static HTML already holds fallback links to the
// releases page, so with JavaScript off or the API down every button still goes somewhere.
//
// This is the ONLY fetch() on the site. The app's rule "all fetch() calls live in api.ts"
// governs the app, not this folder: site/ never imports from deltalab-ui/ (D3).
//
// An ES module is the browser's own "import": like a Python module, nothing runs until
// something imports it, and names stay private unless exported. The two pure functions
// below are exported so `node --test site/*.test.mjs` can call them without a browser.

const RELEASES_API =
  "https://api.github.com/repos/MattiaTag/DELTALab-releases/releases?per_page=20";

// Which file is which, by its ending (D5). `.sig`, `.tar.gz` and `latest.json` match
// none of these, so they are skipped for free.
// "_aarch64.dmg" does not end with "_x64.dmg", so the two Mac builds can't be confused.
const SUFFIX = {
  appleSilicon: "_aarch64.dmg",
  windows: "_x64-setup.exe",
  intel: "_x64.dmg",
};

/** The {url, name} of the release's asset ending in `suffix`, or null.
 *  (A JSDoc comment like this one is TypeScript-adjacent: it types the function for
 *  editors, a bit like Python type hints, with no effect at runtime.) */
function findAsset(release, suffix) {
  // `?? []` means "or an empty list if the left side is null/undefined", Python's
  // `release.get("assets") or []`.
  const asset = (release.assets ?? []).find((a) => a.name.endsWith(suffix));
  return asset ? { url: asset.browser_download_url, name: asset.name } : null;
}

/**
 * Picks the download links out of GitHub's releases list (D5). Pure: no DOM, no fetch.
 *
 * Drafts and prereleases are never "latest". The latest release is the one with the
 * newest published_at. The Intel build comes from the newest release that has one,
 * which is not always the latest (Intel builds are optional).
 *
 * @param {Array} releases  the array GitHub returns
 * @returns {object}  version, published, pageUrl, appleSilicon, windows, intel
 */
export function pickDownloads(releases) {
  // A draft has published_at null; the filter also drops it defensively, because the
  // public API never lists drafts but a test fixture or a token-bearing call might.
  // `.filter` returns a new list, so the caller's list is never reordered (Python's
  // `sorted(...)` rather than `list.sort()`).
  const published = releases
    .filter((r) => !r.draft && !r.prerelease && r.published_at)
    .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at));

  const latest = published[0];
  if (!latest) {
    return { version: null, published: null, pageUrl: null, appleSilicon: null, windows: null, intel: null };
  }

  // The newest release that carries an Intel installer. Python: next((r for r in ...), None)
  const withIntel = published.find((r) => findAsset(r, SUFFIX.intel));
  const intel = withIntel
    ? { ...findAsset(withIntel, SUFFIX.intel), version: withIntel.tag_name.replace(/^v/, "") }
    : null;

  return {
    version: latest.tag_name.replace(/^v/, ""),
    published: latest.published_at,
    pageUrl: latest.html_url,
    appleSilicon: findAsset(latest, SUFFIX.appleSilicon),
    windows: findAsset(latest, SUFFIX.windows),
    intel,
  };
}

/**
 * Which platform the big button is for (D6): "windows" or "macos".
 * Mac, Linux, phones and unknown all get "macos". Intel vs Apple silicon is not
 * detected: browsers don't report it reliably, which is why the Intel row always exists.
 *
 * @param navigatorLike  the browser's `navigator`, or any object shaped like it
 */
export function primaryPlatform(navigatorLike) {
  // `a?.b` is "a.b, or None if a is None" (no AttributeError). `??` is "or".
  const name = navigatorLike.userAgentData?.platform ?? navigatorLike.platform ?? "";
  return /win/i.test(name) ? "windows" : "macos";
}

// ── Everything below touches the page, so it only runs in a browser ─────────────────

/** `id` shortcut: document.getElementById, throwing if the HTML lost the element. */
function el(id) {
  const node = document.getElementById(id);
  if (!node) throw new Error(`site/index.html has no element #${id}`);
  return node;
}

/** Points one table row's link at `asset`, or at the release page when the file is
 *  missing (a release can lack a platform). */
function fillRow(row, asset, pageUrl) {
  row.querySelector("a").href = asset ? asset.url : pageUrl;
}

async function init() {
  try {
    const response = await fetch(RELEASES_API, { headers: { Accept: "application/vnd.github+json" } });
    if (!response.ok) throw new Error(`GitHub answered ${response.status}`);
    const found = pickDownloads(await response.json());
    if (!found.version) throw new Error("no published release");

    // Version in the nav, and the line at the top of the download card.
    const navVersion = el("nav-version");
    navVersion.textContent = `v${found.version}`;
    navVersion.hidden = false;
    const date = new Date(found.published).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    el("release-line").textContent = `Latest release ${found.version} · ${date}`;

    // The big button follows the visitor's platform; the other one becomes a row.
    const isWindows = primaryPlatform(navigator) === "windows";
    const primary = isWindows ? found.windows : found.appleSilicon;
    el("primary-download").href = primary ? primary.url : found.pageUrl;
    el("primary-label").textContent = isWindows ? "Download for Windows" : "Download for macOS";
    el("primary-sub").textContent = isWindows ? "64-bit" : "Apple silicon (M1 or later)";

    const rows = {
      "apple-silicon": document.querySelector('[data-platform="apple-silicon"]'),
      windows: document.querySelector('[data-platform="windows"]'),
      intel: document.querySelector('[data-platform="intel"]'),
    };
    rows["apple-silicon"].hidden = !isWindows; // shown only when Windows has the big button
    rows.windows.hidden = isWindows;
    fillRow(rows["apple-silicon"], found.appleSilicon, found.pageUrl);
    fillRow(rows.windows, found.windows, found.pageUrl);
    fillRow(rows.intel, found.intel, found.pageUrl);

    // Intel can come from an older release: say which version, in a dim note (D5).
    if (found.intel && found.intel.version !== found.version) {
      const note = document.createElement("span");
      note.className = "row-note";
      note.textContent = `Version ${found.intel.version}`;
      rows.intel.querySelector("a").before(note);
    }

  } catch (error) {
    // Leave every fallback link as the HTML has it, and say so once (32.4).
    console.warn("DELTALab site: could not load the latest release.", error);
    document.getElementById("load-error")?.removeAttribute("hidden");
  }
}

// `document` doesn't exist under Node, so the tests import this file without running init.
// Module scripts are deferred, so the page is already parsed by the time this runs.
if (typeof document !== "undefined") init();
