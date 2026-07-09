import { Extension, Node, mergeAttributes } from "@tiptap/core";
import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";

export type MergeVariableAttrs = {
  name: string;
  kind: "inline" | "block";
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mergeVariable: {
      insertMergeVariable: (attrs: MergeVariableAttrs) => ReturnType;
    };
  }
}

export const MergeVariableInline = Node.create({
  name: "mergeVariableInline",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      name: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-merge-var"),
        renderHTML: (attributes) => {
          if (!attributes.name) {
            return {};
          }
          return { "data-merge-var": attributes.name };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-merge-var][data-merge-kind="inline"]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-merge-var": node.attrs.name,
        "data-merge-kind": "inline",
        class: "email-merge-chip",
      }),
      `{{${node.attrs.name}}}`,
    ];
  },
});

export const MergeVariableBlock = Node.create({
  name: "mergeVariableBlock",
  group: "block",
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      name: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-merge-var"),
        renderHTML: (attributes) => {
          if (!attributes.name) {
            return {};
          }
          return { "data-merge-var": attributes.name };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-merge-var][data-merge-kind="block"]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-merge-var": node.attrs.name,
        "data-merge-kind": "block",
        class: "email-merge-chip email-merge-chip--block",
      }),
      `{{${node.attrs.name}}}`,
    ];
  },
});

/**
 * Shared command extension that inserts the correct atom for the variable kind.
 */
export const MergeVariableCommands = Extension.create({
  name: "mergeVariable",

  addCommands() {
    return {
      insertMergeVariable:
        (attrs) =>
        ({ commands }) => {
          if (attrs.kind === "block") {
            return commands.insertContent({
              type: "mergeVariableBlock",
              attrs: { name: attrs.name },
            });
          }
          return commands.insertContent({
            type: "mergeVariableInline",
            attrs: { name: attrs.name },
          });
        },
    };
  },
});

export function createEmailEditorExtensions() {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      codeBlock: false,
      code: false,
      blockquote: false,
      horizontalRule: false,
      link: false,
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        rel: "noopener noreferrer",
        target: "_blank",
      },
    }),
    MergeVariableInline,
    MergeVariableBlock,
    MergeVariableCommands,
  ];
}
