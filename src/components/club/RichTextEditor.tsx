import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Eye,
  Heading2,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  RemoveFormatting,
} from "lucide-react";
import { encodeRichText, richTextHtml } from "@/lib/club/rich-text";
import { RichText } from "./RichText";

type Props = {
  name: string;
  defaultValue?: string;
  dir: "rtl" | "ltr";
  required?: boolean;
  syncGroup?: string;
  onDirty?: () => void;
};

type FormatAction =
  | { type: "command"; name: string; value?: string; active?: boolean }
  | { type: "block"; value: "p" | "h2" | "blockquote" }
  | { type: "clear" };

type SelectionSnapshot = { start: number; end: number };

const formatSyncEvent = "club-rich-text-format";

export function RichTextEditor({
  name,
  defaultValue = "",
  dir,
  required,
  syncGroup,
  onDirty,
}: Props) {
  const editor = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const editorId = useRef(Symbol(name));
  const applySynchronizedAction = useRef<(action: FormatAction) => void>(() => undefined);
  const [value, setValue] = useState(defaultValue);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (editor.current) editor.current.innerHTML = richTextHtml(defaultValue);
    savedRange.current = null;
    setValue(defaultValue);
  }, [defaultValue, name]);

  const rememberSelection = () => {
    const selection = window.getSelection();
    if (!editor.current || !selection?.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (editor.current.contains(range.commonAncestorContainer)) {
      savedRange.current = range.cloneRange();
    }
  };

  const restoreSelection = () => {
    if (!editor.current) return;
    editor.current.focus();
    if (!savedRange.current) return;
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(savedRange.current);
  };

  const update = () => {
    if (!editor.current) return;
    setValue(encodeRichText(editor.current.innerHTML));
    onDirty?.();
  };

  const selectionSnapshot = (): SelectionSnapshot => {
    const root = editor.current;
    const range = savedRange.current;
    const total = root?.textContent?.length || 0;
    if (!root || !range || !total) return { start: 0, end: 0 };

    const offset = (container: Node, position: number) => {
      const before = document.createRange();
      before.selectNodeContents(root);
      before.setEnd(container, position);
      return before.toString().length / total;
    };

    return {
      start: offset(range.startContainer, range.startOffset),
      end: offset(range.endContainer, range.endOffset),
    };
  };

  const setSynchronizedSelection = ({ start, end }: SelectionSnapshot) => {
    const root = editor.current;
    if (!root) return;
    const nodes: Text[] = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      nodes.push(node as Text);
      node = walker.nextNode();
    }
    const total = nodes.reduce((length, text) => length + text.data.length, 0);
    const locate = (ratio: number): [Node, number] => {
      let remaining = Math.round(Math.min(1, Math.max(0, ratio)) * total);
      for (const text of nodes) {
        if (remaining <= text.data.length) return [text, remaining];
        remaining -= text.data.length;
      }
      return nodes.length ? [nodes.at(-1)!, nodes.at(-1)!.data.length] : [root, 0];
    };
    const [startNode, startOffset] = locate(start);
    const [endNode, endOffset] = locate(end);
    const range = document.createRange();
    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);
    savedRange.current = range;
  };

  const broadcast = (action: FormatAction) => {
    if (!syncGroup) return;
    window.dispatchEvent(
      new CustomEvent(formatSyncEvent, {
        detail: {
          action,
          group: syncGroup,
          selection: selectionSnapshot(),
          source: editorId.current,
        },
      }),
    );
    restoreSelection();
  };

  const command = (
    name: string,
    commandValue?: string,
    synchronize = true,
    desiredState?: boolean,
  ) => {
    restoreSelection();
    document.execCommand("styleWithCSS", false, "false");
    if (desiredState === undefined || document.queryCommandState(name) !== desiredState) {
      document.execCommand(name, false, commandValue);
    }
    rememberSelection();
    update();
    if (synchronize) {
      const toggledCommands = new Set([
        "bold",
        "italic",
        "insertUnorderedList",
        "insertOrderedList",
      ]);
      const action: Extract<FormatAction, { type: "command" }> = { type: "command", name };
      if (commandValue !== undefined) action.value = commandValue;
      if (toggledCommands.has(name)) action.active = document.queryCommandState(name);
      broadcast(action);
    }
  };

  const setBlock = (value: "p" | "h2" | "blockquote", synchronize = true) => {
    restoreSelection();
    document.execCommand("formatBlock", false, value);
    rememberSelection();
    update();
    if (synchronize) broadcast({ type: "block", value });
  };

  const toggleBlock = (tag: "h2" | "blockquote") => {
    restoreSelection();
    const current = String(document.queryCommandValue("formatBlock"))
      .replace(/[<>]/g, "")
      .toLowerCase();
    setBlock(current === tag ? "p" : tag);
  };

  const clearFormatting = (synchronize = true) => {
    restoreSelection();
    const unorderedList = document.queryCommandState("insertUnorderedList");
    const orderedList = document.queryCommandState("insertOrderedList");
    document.execCommand("removeFormat");
    document.execCommand("unlink");
    if (unorderedList) document.execCommand("insertUnorderedList");
    if (orderedList) document.execCommand("insertOrderedList");
    document.execCommand("formatBlock", false, "p");
    rememberSelection();
    update();
    if (synchronize) broadcast({ type: "clear" });
  };

  applySynchronizedAction.current = (action) => {
    if (action.type === "command") command(action.name, action.value, false, action.active);
    if (action.type === "block") setBlock(action.value, false);
    if (action.type === "clear") clearFormatting(false);
  };

  useEffect(() => {
    if (!syncGroup) return;
    const receive = (event: Event) => {
      const detail = (
        event as CustomEvent<{
          action: FormatAction;
          group: string;
          selection: SelectionSnapshot;
          source: symbol;
        }>
      ).detail;
      if (detail.group !== syncGroup || detail.source === editorId.current) return;
      setSynchronizedSelection(detail.selection);
      applySynchronizedAction.current(detail.action);
    };
    window.addEventListener(formatSyncEvent, receive);
    return () => window.removeEventListener(formatSyncEvent, receive);
  }, [syncGroup]);

  const buttonClass =
    "inline-flex size-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div
      dir={dir}
      className="overflow-hidden rounded-xl border border-input bg-background font-normal"
    >
      <input type="hidden" name={name} value={value} required={required} />
      <div
        className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 p-2"
        role="toolbar"
      >
        <button
          type="button"
          className={buttonClass}
          aria-label="Bold"
          title="Bold"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => command("bold")}
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          className={buttonClass}
          aria-label="Italic"
          title="Italic"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => command("italic")}
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          className={buttonClass}
          aria-label="Heading"
          title="Heading"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => toggleBlock("h2")}
        >
          <Heading2 size={16} />
        </button>
        <button
          type="button"
          className={buttonClass}
          aria-label="Bulleted list"
          title="Bulleted list"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => command("insertUnorderedList")}
        >
          <List size={16} />
        </button>
        <button
          type="button"
          className={buttonClass}
          aria-label="Numbered list"
          title="Numbered list"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => command("insertOrderedList")}
        >
          <ListOrdered size={16} />
        </button>
        <button
          type="button"
          className={buttonClass}
          aria-label="Quote"
          title="Quote"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => toggleBlock("blockquote")}
        >
          <Quote size={16} />
        </button>
        <button
          type="button"
          className={buttonClass}
          aria-label="Link"
          title="Link"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const href = window.prompt(dir === "rtl" ? "أدخل رابط HTTPS" : "Enter an HTTPS URL");
            if (href?.startsWith("https://")) command("createLink", href);
          }}
        >
          <Link size={16} />
        </button>
        <button
          type="button"
          className={buttonClass}
          aria-label="Clear formatting"
          title="Clear formatting"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => clearFormatting()}
        >
          <RemoveFormatting size={16} />
        </button>
        <button
          type="button"
          className={`${buttonClass} ms-auto ${preview ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
          aria-label={dir === "rtl" ? "المعاينة" : "Preview"}
          aria-pressed={preview}
          onClick={() => setPreview((shown) => !shown)}
        >
          <Eye size={16} />
        </button>
      </div>
      <div
        ref={editor}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        className="min-h-40 px-4 py-3 leading-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [&_a]:font-bold [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:my-4 [&_blockquote]:border-s-4 [&_blockquote]:border-primary/30 [&_blockquote]:ps-4 [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-2xl [&_h2]:font-black [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:ps-7 [&_p]:my-3 [&_strong]:font-black [&_ul]:my-4 [&_ul]:list-disc [&_ul]:ps-7"
        onInput={() => {
          rememberSelection();
          update();
        }}
        onKeyUp={rememberSelection}
        onMouseUp={rememberSelection}
        onSelect={rememberSelection}
      />
      {preview && (
        <div className="border-t border-border bg-muted/20 px-4 py-3">
          <p className="mb-2 text-xs font-bold text-muted-foreground">
            {dir === "rtl" ? "المعاينة على الموقع" : "Website preview"}
          </p>
          <RichText value={value} className="leading-8" />
        </div>
      )}
    </div>
  );
}
