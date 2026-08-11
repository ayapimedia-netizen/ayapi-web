const { spawn } = require("child_process");
const path = require("path");

const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  gray: "\x1b[90m",
};

// Clear console for a fresh presentation
console.clear();

console.log(`
${colors.red}${colors.bold} ┌──────────────────────────────────────────────────────────────────────────┐${colors.reset}
${colors.red}${colors.bold} │                                                                          │${colors.reset}
${colors.red}${colors.bold} │   🔥 ${colors.yellow}AYAPI KRISPI BAKAR${colors.reset} ${colors.bold}Web App & Admin CMS Server${colors.red}                      │${colors.reset}
${colors.red}${colors.bold} │                                                                          │${colors.reset}
${colors.red}${colors.bold} │   ${colors.cyan}🌐 Main Website${colors.reset}   : ${colors.bold}${colors.green}http://localhost:3000${colors.reset}                        │${colors.reset}
${colors.red}${colors.bold} │   ${colors.cyan}⚙️  Admin Dashboard${colors.reset}: ${colors.bold}${colors.yellow}http://localhost:3000/admin${colors.reset}                  │${colors.reset}
${colors.red}${colors.bold} │   ${colors.cyan}💼 Franchise Page  ${colors.reset}: ${colors.bold}${colors.cyan}http://localhost:3000/kemitraan${colors.reset}              │${colors.reset}
${colors.red}${colors.bold} │   ${colors.cyan}🗄️  Supabase URL   ${colors.reset}: ${colors.bold}${colors.magenta}vhoijuysgyuywvpdcirz.supabase.co${colors.reset}         │${colors.reset}
${colors.red}${colors.bold} │                                                                          │${colors.reset}
${colors.red}${colors.bold} └──────────────────────────────────────────────────────────────────────────┘${colors.reset}
`);

console.log(`${colors.gray}[${new Date().toLocaleTimeString()}]${colors.reset} ${colors.green}${colors.bold}[READY]${colors.reset} Memulai Server Next.js Turbopack dev...\n`);

const nextDev = spawn("npx", ["next", "dev"], {
  stdio: "inherit",
  shell: true,
});

nextDev.on("error", (err) => {
  console.error(`${colors.red}[ERROR] Gagal menjalankan Next.js dev server:${colors.reset}`, err);
});
