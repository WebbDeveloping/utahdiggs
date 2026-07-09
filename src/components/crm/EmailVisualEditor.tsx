"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import LinkIcon from "@mui/icons-material/Link";
import RedoIcon from "@mui/icons-material/Redo";
import TitleIcon from "@mui/icons-material/Title";
import UndoIcon from "@mui/icons-material/Undo";
import type { EmailBrandTheme } from "@/lib/email/email-brand-config";
import type { EmailTemplateLayout } from "@/lib/email/visual-editor";
import {
  canUseVisualEditor,
  createEmailEditorExtensions,
  editorContentToHtmlBody,
  htmlBodyToEditorContent,
  isHtmlBlockVariable,
} from "@/lib/email/visual-editor";

export type EmailVisualEditorHandle = {
  insertMergeVariable: (name: string) => void;
  getHtmlBody: () => string;
};

type EmailVisualEditorProps = {
  htmlBody: string;
  layout: EmailTemplateLayout;
  brandTheme: EmailBrandTheme;
  onChange: (htmlBody: string) => void;
};

const EmailVisualEditor = forwardRef<
  EmailVisualEditorHandle,
  EmailVisualEditorProps
>(function EmailVisualEditor(
  { htmlBody, layout, brandTheme, onChange },
  ref,
) {
  const htmlBodyRef = useRef(htmlBody);
  const onChangeRef = useRef(onChange);
  const lastEmittedRef = useRef(htmlBody);
  const applyingExternalRef = useRef(false);

  useEffect(() => {
    htmlBodyRef.current = htmlBody;
  }, [htmlBody]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const visualAvailable = canUseVisualEditor(htmlBody, layout);

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: createEmailEditorExtensions(),
      content: visualAvailable
        ? htmlBodyToEditorContent(htmlBody, layout)
        : "<p></p>",
      editable: visualAvailable,
      onUpdate: ({ editor: current }) => {
        if (!visualAvailable || applyingExternalRef.current) {
          return;
        }
        const next = editorContentToHtmlBody(
          current.getHTML(),
          htmlBodyRef.current,
          layout,
        );
        htmlBodyRef.current = next;
        lastEmittedRef.current = next;
        onChangeRef.current(next);
      },
      editorProps: {
        attributes: {
          class: "email-visual-editor-prose",
        },
      },
    },
    [layout],
  );

  // Sync external htmlBody changes (reset, code edits) into the editor.
  useEffect(() => {
    if (!editor || editor.isDestroyed || !visualAvailable) {
      return;
    }
    if (htmlBody === lastEmittedRef.current) {
      return;
    }
    applyingExternalRef.current = true;
    lastEmittedRef.current = htmlBody;
    editor.commands.setContent(htmlBodyToEditorContent(htmlBody, layout), {
      emitUpdate: false,
    });
    applyingExternalRef.current = false;
  }, [editor, htmlBody, layout, visualAvailable]);

  useImperativeHandle(
    ref,
    () => ({
      insertMergeVariable(name: string) {
        if (!editor || editor.isDestroyed) {
          return;
        }
        editor
          .chain()
          .focus()
          .insertMergeVariable({
            name,
            kind: isHtmlBlockVariable(name) ? "block" : "inline",
          })
          .run();
      },
      getHtmlBody() {
        if (!editor || editor.isDestroyed || !visualAvailable) {
          return htmlBodyRef.current;
        }
        return editorContentToHtmlBody(
          editor.getHTML(),
          htmlBodyRef.current,
          layout,
        );
      },
    }),
    [editor, layout, visualAvailable],
  );

  if (!visualAvailable) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary">
          This customized document template is missing editable-region markers.
          Use Code mode to edit the full HTML, or Reset to restore the default
          template with Visual editing support.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: brandTheme.pageBackground,
        p: { xs: 2, sm: 3 },
      }}
    >
      {layout === "document" ? (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 1.5 }}
        >
          Editing message body. Header, cards, and footer stay in Code.
        </Typography>
      ) : null}

      <Box
        sx={{
          maxWidth: 600,
          mx: "auto",
          bgcolor: brandTheme.cardBackground,
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        }}
      >
        <Stack
          direction="row"
          spacing={0.25}
          sx={{
            px: 1,
            py: 0.75,
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "grey.50",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <ToolbarButton
            title="Heading"
            active={editor?.isActive("heading", { level: 2 }) ?? false}
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <TitleIcon fontSize="small" />
          </ToolbarButton>
          <ToolbarButton
            title="Bold"
            active={editor?.isActive("bold") ?? false}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <FormatBoldIcon fontSize="small" />
          </ToolbarButton>
          <ToolbarButton
            title="Italic"
            active={editor?.isActive("italic") ?? false}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <FormatItalicIcon fontSize="small" />
          </ToolbarButton>
          <ToolbarButton
            title="Link"
            active={editor?.isActive("link") ?? false}
            onClick={() => {
              if (!editor) return;
              if (editor.isActive("link")) {
                editor.chain().focus().unsetLink().run();
                return;
              }
              const href = window.prompt("Link URL");
              if (!href) return;
              editor.chain().focus().setLink({ href }).run();
            }}
          >
            <LinkIcon fontSize="small" />
          </ToolbarButton>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <ToolbarButton
            title="Bullet list"
            active={editor?.isActive("bulletList") ?? false}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            <FormatListBulletedIcon fontSize="small" />
          </ToolbarButton>
          <ToolbarButton
            title="Numbered list"
            active={editor?.isActive("orderedList") ?? false}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            <FormatListNumberedIcon fontSize="small" />
          </ToolbarButton>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <ToolbarButton
            title="Undo"
            onClick={() => editor?.chain().focus().undo().run()}
          >
            <UndoIcon fontSize="small" />
          </ToolbarButton>
          <ToolbarButton
            title="Redo"
            onClick={() => editor?.chain().focus().redo().run()}
          >
            <RedoIcon fontSize="small" />
          </ToolbarButton>
        </Stack>

        <Box
          sx={{
            px: 3,
            py: 2.5,
            minHeight: 320,
            color: brandTheme.bodyTextColor,
            "& .email-visual-editor-prose": {
              outline: "none",
              minHeight: 280,
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              fontSize: 15,
              lineHeight: 1.65,
              "& p": { margin: "0 0 12px" },
              "& h2": {
                margin: "0 0 12px",
                fontSize: 18,
                fontWeight: 600,
                color: brandTheme.bodyTextColor,
              },
              "& a": { color: brandTheme.linkColor },
              "& ul, & ol": { margin: "0 0 12px", paddingLeft: 22 },
              "& .email-merge-chip": {
                display: "inline-block",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 12,
                fontWeight: 600,
                lineHeight: 1.4,
                padding: "1px 6px",
                borderRadius: "4px",
                backgroundColor: brandTheme.accentBackground,
                color: brandTheme.primaryColor,
                border: `1px solid ${brandTheme.primaryColor}33`,
                verticalAlign: "baseline",
                cursor: "default",
                userSelect: "none",
              },
              "& .email-merge-chip--block": {
                display: "block",
                margin: "8px 0",
                padding: "8px 10px",
                textAlign: "center",
              },
            },
          }}
        >
          <EditorContent editor={editor} />
        </Box>
      </Box>
    </Box>
  );
});

function ToolbarButton({
  title,
  active,
  onClick,
  children,
}: {
  title: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip title={title}>
      <IconButton
        size="small"
        onClick={onClick}
        aria-label={title}
        color={active ? "primary" : "default"}
        sx={{
          borderRadius: 1,
          bgcolor: active ? "action.selected" : "transparent",
        }}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
}

export default EmailVisualEditor;
