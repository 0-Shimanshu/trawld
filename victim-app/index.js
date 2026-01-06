import "../runtime-node/index.js";
import _ from "lodash";

console.log("Victim app started. PID:", process.pid);
console.log("Using lodash version:", _.VERSION);

setInterval(() => {
  console.log("Victim app is running...");
}, 2000);
