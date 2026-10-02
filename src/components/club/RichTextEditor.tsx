import { useRef, useState } from "react";
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
  onDirty?: () => void;
};

export function RichTextEditor({ name, defaultValue = "", dir, required, onDirty }: Props) {
  const editor = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [preview, setPreview] = useState(false);

  const update = () => {
    if (!editor.current) return;
    setValue(encodeRichText(editor.current.innerHTML));
    onDirty?.();
  };

  const command = (name: string, commandValue?: string) => {
    editor.current?.focus();
    document.execCommand(name, false, commandValue);
    update();
  };

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
          onClick={() => command("formatBlock", "h2")}
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
          onClick={() => command("formatBlock", "blockquote")}
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
          onClick={() => command("removeFormat")}
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
        className="min-h-40 px-4 py-3 leading-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        onInput={update}
        dangerouslySetInnerHTML={{ __html: richTextHtml(defaultValue) }}
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
