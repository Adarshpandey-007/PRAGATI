const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadStore() {
  try {
    if (!fs.existsSync(STORE_PATH)) {
      return null;
    }

    const raw = fs.readFileSync(STORE_PATH, "utf-8");
    if (!raw.trim()) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to load persistent store:", error);
    return null;
  }
}

function saveStore(state) {
  try {
    ensureDataDir();
    fs.writeFileSync(STORE_PATH, JSON.stringify(state, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save persistent store:", error);
  }
}

module.exports = {
  loadStore,
  saveStore,
  STORE_PATH,
};
