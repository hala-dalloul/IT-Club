// Captures the original Error out-of-band so server.ts can recover the stack
// when h3 has already swallowed the throw into a generic 500 Response.

let lastCapturedError: { error: unknown; at: number } | undefined;

const TTL_MS = 5_000;

function record(cause: unknown) {
  lastCapturedError = { error: cause, at: Date.now() };
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number";
}

// h3's HTTPError serializes to {"status":500,"unhandled":true,"message":"HTTPError"} —
// no stack, no cause — so a plain console.error(error) reaches the log pipeline with
// the failure detail stripped. Expand Error-like args into a string that keeps the
// message, stack, and the full cause chain.
const CAUSE_DEPTH_LIMIT = 5;

const DESCRIPTION_LENGTH_LIMIT = 8_000;

export function describeError(cause: unknown): string {
  const parts: string[] = [];
  let current: unknown = cause;

  for (let depth = 0; depth < CAUSE_DEPTH_LIMIT && current != null; depth++) {
    if (!(current instanceof Error)) {
      parts.push(isString(current) ? current : safeStringify(current));
      break;
    }

    const label = depth === 0 ? "" : "caused by: ";
    const status = describeStatus(current);
    parts.push(`${label}${current.stack ?? `${current.name}: ${current.message}`}${status}`);
    current = current.cause;
  }

  return parts.join("\n").slice(0, DESCRIPTION_LENGTH_LIMIT);
}

function describeStatus(error: Error): string {
  // SAFETY: h3's HTTPError and fetch-layer errors attach status/statusCode that
  // aren't part of the Error type; isNumber below discards anything else.
  const { status, statusCode } = error as { status?: unknown; statusCode?: unknown };
  const value = status ?? statusCode;

  return isNumber(value) ? ` (status ${value})` : "";
}

function safeStringify(cause: unknown): string {
  try {
    return JSON.stringify(cause) ?? String(cause);
  } catch {
    return String(cause);
  }
}

function isErrorLike(value: unknown): value is Error {
  return value instanceof Error;
}

// Wrap console.error so errors logged by any layer — including h3's internal
// unhandled-error logging, which this file cannot hook directly — are both
// recorded for consumeLastCapturedError and expanded before serialization.
const originalConsoleError = console.error.bind(console);

console.error = (...args: unknown[]) => {
  const expanded = args.map((arg) => {
    if (!isErrorLike(arg)) return arg;
    record(arg);

    return describeError(arg);
  });

  originalConsoleError(...expanded);
};

if ("addEventListener" in globalThis) {
  globalThis.addEventListener("error", (event) => {
    // SAFETY: this listener is only ever registered for the "error" event, whose
    // event object the DOM spec guarantees is an ErrorEvent.
    record((event as ErrorEvent).error ?? event);
  });
  globalThis.addEventListener("unhandledrejection", (event) => {
    // SAFETY: this listener is only ever registered for "unhandledrejection", whose
    // event object the spec guarantees is a PromiseRejectionEvent.
    record((event as PromiseRejectionEvent).reason);
  });
}

export function consumeLastCapturedError() {
  if (!lastCapturedError) return undefined;

  if (Date.now() - lastCapturedError.at > TTL_MS) {
    lastCapturedError = undefined;

    return undefined;
  }

  const { error } = lastCapturedError;
  lastCapturedError = undefined;

  return error;
}
