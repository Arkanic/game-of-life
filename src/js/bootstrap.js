import "../css/style.css";

/* async */
import("./index.js").catch(e => console.error("Error importing main script: ", e));