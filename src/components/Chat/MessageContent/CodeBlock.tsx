import React, { useMemo } from 'react';
import { Copy } from 'lucide-react';

interface CodeBlockProps {
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
  const fileExtension = useMemo(() => {
    const languagePatterns = {
      javascript: /\b(const|let|var|function|=>|import|export)\b/,
      typescript: /\b(interface|type|namespace|enum)\b/,
      python: /\b(def|class|import|from|if __name__ == ['"]__main__['"])\b/,
      java: /\b(public|private|class|void|static)\b/,
      html: /<\/?[a-z][\s\S]*>/i,
      css: /[{;][\s]*[a-z-]+\s*:/,
      sql: /\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)\b/i,
      php: /(<\?php|\$[a-zA-Z_])/,
      ruby: /\b(def|class|require|include|attr_)\b/,
      rust: /\b(fn|let|mut|struct|impl)\b/,
      go: /\b(func|package|import|type|struct)\b/,
      swift: /\b(func|var|let|class|struct|import)\b/,
    };

    for (const [lang, pattern] of Object.entries(languagePatterns)) {
      if (pattern.test(code)) {
        return lang;
      }
    }
    return 'text';
  }, [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="relative group">
      <div className="bg-zinc-900 rounded-lg p-4 overflow-x-auto">
        <button
          onClick={handleCopy}
          className="absolute right-2 top-2 p-1.5 text-zinc-400 
                   hover:text-zinc-200 opacity-0 group-hover:opacity-100 
                   transition-opacity bg-zinc-800 rounded-lg"
          title="Copy code"
        >
          <Copy className="w-4 h-4" />
        </button>
        <pre className="font-mono text-sm whitespace-pre-wrap break-words text-zinc-100">
          {code}
        </pre>
      </div>
    </div>
  );
};