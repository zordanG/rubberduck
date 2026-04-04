'use client';

import hljs from 'highlight.js';
import purify from 'isomorphic-dompurify';

import './styles/atom-one-dark.css';

interface code {
  language: string;
  body: string;
}

export function Code({ code, className }: { code: code; className?: string }) {
  const SUPPORTED_LANGUAGES = new Set(hljs.listLanguages());

  const language = SUPPORTED_LANGUAGES.has(code.language) ? code.language : 'plaintext';
  const formatedCode = hljs.highlight(code.body, { language }).value;

  const sanitized = purify.sanitize(formatedCode, {
    ALLOWED_TAGS: ['span'],
    ALLOWED_ATTR: ['class'],
  });

  return (
    code?.body?.length > 0 && (
      <pre>
        <div
          className={'p-2 bg-onedark rounded-lg' + ' ' + className}
          dangerouslySetInnerHTML={{ __html: sanitized }}
        />
      </pre>
    )
  );
}
