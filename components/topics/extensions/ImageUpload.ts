import Image from "@tiptap/extension-image";

export const ImageUpload = Image.extend({
  addOptions() {
    const parent = this.parent?.() || {};
    return {
      ...parent,
      inline: false,
      allowBase64: true,
      HTMLAttributes: {},
    } as any;
  },
});
