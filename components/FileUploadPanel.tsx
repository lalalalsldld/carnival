'use client';

import { useEffect, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';

const DEFAULT_HTML = '<h1>Welcome to Carnival</h1><p>Use the editor to format your page with <strong>bold</strong>, <em>italic</em>, <u>underlines</u>, and <s>strikethrough</s> content.</p>';

export function ContentEditor() {
  const [isSaving, setIsSaving] = useState(false);
  const [linkUrl, setLinkUrl] = useState('https://');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
    ],
    content: DEFAULT_HTML,
    editorProps: {
      attributes: {
        class: 'editor-content',
      },
    },
  });

  useEffect(() => {
    async function loadContent() {
      const res = await fetch('/api/page-content');
      const data = await res.json();
      if (data.html && editor) {
        editor.commands.setContent(data.html);
      }
    }

    loadContent();
  }, [editor]);

  if (!editor) {
    return null;
  }

  async function saveContent() {
    setIsSaving(true);
    const html = editor.getHTML();
    await fetch('/api/page-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html }),
    });
    setIsSaving(false);
  }

  return (
    <div className="editor-wrap">
      <h2>Home page editor</h2>
      <div className="editor-toolbar">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}>Bold</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}>Italic</button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'is-active' : ''}>Underline</button>
        <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'is-active' : ''}>Crossout</button>
        <button onClick={() => editor.chain().focus().setFontSize('12px').run()}>12px</button>
        <button onClick={() => editor.chain().focus().setFontSize('16px').run()}>16px</button>
        <button onClick={() => editor.chain().focus().setFontSize('22px').run()}>22px</button>
        <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}>Left</button>
        <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}>Center</button>
        <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}>Right</button>
      </div>

      <EditorContent editor={editor} />

      <div className="link-input">
        <input
          type="url"
          className="input"
          placeholder="https://example.com"
          value={linkUrl}
          onChange={(event) => setLinkUrl(event.target.value)}
        />
        <button
          className="primary-btn"
          onClick={() => {
            if (!linkUrl) return;
            editor.chain().focus().setLink({ href: linkUrl }).run();
          }}
        >
          Add link
        </button>
      </div>

      <div className="cta-row" style={{ marginTop: '18px' }}>
        <button className="primary-btn" onClick={saveContent}>
          {isSaving ? 'Saving…' : 'Save page text'}
        </button>
      </div>
    </div>
  );
}
