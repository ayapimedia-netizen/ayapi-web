/**
 * Custom Human-Readable Logger for Terminal Output
 * Formats terminal logs with clear timestamps, badges, colors, and readable structures.
 */

const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
  bgGreen: "\x1b[42m\x1b[30m",
  bgRed: "\x1b[41m\x1b[37m",
  bgYellow: "\x1b[43m\x1b[30m",
  bgBlue: "\x1b[44m\x1b[37m",
};

function getTime(): string {
  const now = new Date();
  return now.toTimeString().split(" ")[0];
}

export const logger = {
  info: (scope: string, message: string, data?: any) => {
    console.log(
      `${colors.gray}[${getTime()}]${colors.reset} ${colors.cyan}${colors.bold}[INFO]${colors.reset} ${colors.blue}▸ [${scope}]${colors.reset} ${message}`
    );
    if (data !== undefined) {
      console.log(`${colors.gray}  └─ Data:${colors.reset}`, data);
    }
  },

  success: (scope: string, message: string, data?: any) => {
    console.log(
      `${colors.gray}[${getTime()}]${colors.reset} ${colors.green}${colors.bold}[SUCCESS]${colors.reset} ${colors.green}✔ [${scope}]${colors.reset} ${message}`
    );
    if (data !== undefined) {
      console.log(`${colors.gray}  └─ Data:${colors.reset}`, data);
    }
  },

  warn: (scope: string, message: string, data?: any) => {
    console.warn(
      `${colors.gray}[${getTime()}]${colors.reset} ${colors.yellow}${colors.bold}[WARN]${colors.reset} ${colors.yellow}⚠ [${scope}]${colors.reset} ${message}`
    );
    if (data !== undefined) {
      console.warn(`${colors.yellow}  └─ Warning Details:${colors.reset}`, data);
    }
  },

  error: (scope: string, message: string, errorObj?: any) => {
    console.error(
      `${colors.gray}[${getTime()}]${colors.reset} ${colors.red}${colors.bold}[ERROR]${colors.reset} ${colors.red}✖ [${scope}]${colors.reset} ${colors.bold}${message}${colors.reset}`
    );
    if (errorObj) {
      const errDetail = errorObj?.message || errorObj;
      console.error(`${colors.red}  └─ Details:${colors.reset}`, errDetail);
    }
  },

  db: (action: string, table: string, status: "OK" | "FAIL" | "SEED", detail?: string) => {
    const statusTag =
      status === "OK"
        ? `${colors.green}[OK]${colors.reset}`
        : status === "SEED"
        ? `${colors.cyan}[SEED]${colors.reset}`
        : `${colors.red}[FAIL]${colors.reset}`;

    console.log(
      `${colors.gray}[${getTime()}]${colors.reset} ${colors.magenta}${colors.bold}[DATABASE]${colors.reset} ${statusTag} ${colors.cyan}${action}${colors.reset} ➔ ${colors.bold}${table}${colors.reset}${detail ? ` (${detail})` : ""}`
    );
  },

  auth: (event: "LOGIN" | "LOGOUT" | "CHECK" | "DENIED", message: string) => {
    const badge =
      event === "LOGIN"
        ? `${colors.green}[AUTH LOGIN]${colors.reset}`
        : event === "LOGOUT"
        ? `${colors.yellow}[AUTH LOGOUT]${colors.reset}`
        : event === "DENIED"
        ? `${colors.red}[AUTH DENIED]${colors.reset}`
        : `${colors.cyan}[AUTH CHECK]${colors.reset}`;

    console.log(
      `${colors.gray}[${getTime()}]${colors.reset} ${badge} ${message}`
    );
  },

  storage: (action: "UPLOAD" | "DELETE" | "FALLBACK", fileName: string, detail?: string) => {
    const tag =
      action === "UPLOAD"
        ? `${colors.green}[STORAGE UPLOAD]${colors.reset}`
        : action === "DELETE"
        ? `${colors.yellow}[STORAGE DELETE]${colors.reset}`
        : `${colors.magenta}[STORAGE FALLBACK]${colors.reset}`;

    console.log(
      `${colors.gray}[${getTime()}]${colors.reset} ${tag} ${colors.bold}${fileName}${colors.reset}${detail ? ` - ${detail}` : ""}`
    );
  },
};

export default logger;
