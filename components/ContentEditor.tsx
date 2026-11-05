'use client';

import { useEffect, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import { Extension } from '@tiptap/core';

const FontSize = Extension.create({
  name: 'fontSize',
  addGlobalAttributes() {
    return [{ types: ['textStyle'], attributes: {
      fontSize: {
        default: null,
        parseHTML: (element) => (element as HTMLElement).style.fontSize || null,
        renderHTML: (attributes) => attributes.fontSize ? { style: `font-size: ${attributes.fontSize}` } : {},
      },
    } }];
  },
});

const DEFAULT_HTML = '<h1>Welcome to Carnival</h1><p>Edit this page with headings, lists, font sizes, links, and text styles.</p>';
const allowedUrl = (value: string) => /^(https?:|mailto:)/i.test(value.trim());

export function ContentEditor() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState('');
  const editor = useEditor({
    extensions: [StarterKit, Underline, TextStyle, FontSize, TextAlign.configure({ types: ['heading', 'paragraph'] }), Link.configure({ openOnClick: false, protocols: ['http', 'https', 'mailto'] })],
    content: DEFAULT_HTML,
    editorProps: { attributes: { class: 'editor-content' } },
  });

  useEffect(() => {
    if (!editor) return;
    void fetch('/api/page-content').then((r) => r.json()).then((data) => {
      if (typeof data.html === 'string') editor.commands.setContent(data.html);
    }).catch(() => setMessage('Could not load saved page content.'));
  }, [editor]);

  if (!editor) return null;

  async function saveContent() {
    setSaving(true); setMessage('');
    try {
      const response = await fetch('/api/page-content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ html: editor.getHTML() }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Save failed.');
      setMessage('Page saved.');
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Save failed.'); }
    finally { setSaving(false); }
  }

  function setFontSize(size: string) {
    editor.chain().focus().setMark('textStyle', { fontSize: size }).run();
  }

  function addLink() {
    if (!allowedUrl(url)) { setMessage('Enter a valid http, https, or mailto link.'); return; }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
    setUrl('');
  }

  return <section className="editor-wrap">
    <h2>Home page editor</h2>
    <div className="editor-toolbar" aria-label="Text formatting">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}>Bold</button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}>Italic</button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()}>Underline</button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()}>Strikethrough</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}>Bullets</button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()}>Numbered list</button>
      <button type="button" onClick={() => setFontSize('12px')}>12px</button>
      <button type="button" onClick={() => setFontSize('16px')}>16px</button>
      <button type="button" onClick={() => setFontSize('22px')}>22px</button>
      <button type="button" onClick={() => editor.chain().focus().unsetMark('textStyle').run()}>Clear size</button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()}>Left</button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()}>Center</button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()}>Right</button>
    </div>
    <EditorContent editor={editor} />
    <div className="link-input"><input className="input" type="url" placeholder="https://example.com" value={url} onChange={(event) => setUrl(event.target.value)} /><button type="button" className="secondary-btn" onClick={addLink}>Add link</button><button type="button" className="ghost-btn" onClick={() => editor.chain().focus().unsetLink().run()}>Remove link</button></div>
    <div className="cta-row"><button type="button" className="primary-btn" onClick={saveContent} disabled={saving}>{saving ? 'Saving…' : 'Save page'}</button>{message && <span role="status" className="inline-note">{message}</span>}</div>
  </section>;
}
