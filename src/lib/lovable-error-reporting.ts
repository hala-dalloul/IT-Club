type LovableErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

type LovableContextValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | LovableContextValue[]
  | { [key: string]: LovableContextValue };

type LovableEvents = {
  captureException?: (
    cause: unknown,
    context?: Record<string, LovableContextValue>,
    options?: LovableErrorOptions,
  ) => void;
};

declare global {
  interface Window {
    __lovableEvents?: LovableEvents;
    __lovableReportRuntimeError?: (payload: {
      message: string;
      stack?: string;
      filename?: string;
    }) => void;
  }
}

export function reportLovableError(
  cause: unknown,
  context: Record<string, LovableContextValue> = {},
) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    cause,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context,
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error",
    },
  );

  // Prod React does not rethrow boundary-caught errors to window.onerror, so the
  // editor's telemetry never sees them. Forward to lovable.js's reporting hook,
  // which is present only inside the editor preview.
  // Loaders and server fns commonly throw a raw Response; String(it) is the
  // opaque "[object Response]", so pull out the status and URL instead.
  const message =
    cause instanceof Response
      ? `Response ${cause.status}${cause.url ? ` at ${cause.url}` : ""}`
      : cause instanceof Error
        ? cause.message
        : String(cause);

  const stack = cause instanceof Error ? cause.stack : undefined;
  window.__lovableReportRuntimeError?.({
    message,
    ...(stack !== undefined && { stack }),
    filename: window.location.pathname,
  });
}
