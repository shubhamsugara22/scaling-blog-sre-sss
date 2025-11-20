'use client';

import { useEffect, useState } from 'react';
import { remark } from 'remark';
import html from 'remark-html';

interface MarkdownPreviewProps {
  content: string;
}

export default function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    const renderMarkdown = async () => {
      if (!content) {
        setHtmlContent('');
        return;
      }

      try {
        const processed = await remark()
          .use(html, { sanitize: false })
          .process(content);
        setHtmlContent(String(processed));
      } catch (error) {
        console.error('Error rendering markdown:', error);
        setHtmlContent('<p>Error rendering preview</p>');
      }
    };

    renderMarkdown();
  }, [content]);

  if (!htmlContent) {
    return <p className="text-gray-400">Preview will appear here...</p>;
  }

  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}
