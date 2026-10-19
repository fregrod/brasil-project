import React from 'react';
import ReactMarkdown, { type Options } from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
export function MathMarkdown(props: Options) {
  return <ReactMarkdown {...props} rehypePlugins={[...(props.rehypePlugins || []), rehypeKatex]} />;
}
