'use client';

import { marked } from 'marked';
import { useEffect } from 'react';
import hljs from 'highlight.js';

import 'highlight.js/styles/atom-one-dark.css';

interface code {
  language: string;
  body: string;
}

export function Code({ code, className }: { code: code; className?: string }) {
  useEffect(() => {
    hljs.highlightAll();
  });

  const formatedCode = `\`\`\` ${code.language}
${code.body}
  \`\`\`
  `;

  return (
    code?.body?.length > 0 && (
      <div
        className={'p-2 bg-onedark rounded-lg' + ' ' + className}
        dangerouslySetInnerHTML={{ __html: marked(formatedCode) }}
      />
    )
  );
}
