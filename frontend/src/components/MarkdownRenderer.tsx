import React from 'react';
import './FormattedText.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let currentList: JSX.Element[] = [];
    let currentNumberedList: JSX.Element[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLanguage = '';

    const flushLists = () => {
      if (currentList.length > 0) {
        elements.push(<ul key={`ul-${elements.length}`} className="formatted-text ul">{currentList}</ul>);
        currentList = [];
      }
      if (currentNumberedList.length > 0) {
        elements.push(<ol key={`ol-${elements.length}`} className="formatted-text ol">{currentNumberedList}</ol>);
        currentNumberedList = [];
      }
    };

    const renderInlineMarkdown = (text: string): React.ReactNode => {
      // 处理粗体 **text**
      let result = text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={index} className="formatted-bold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      // 处理斜体 *text*
      result = result.map((part, index) => {
        if (typeof part === 'string') {
          return part.split(/(\*[^*]+\*)/g).map((subPart, subIndex) => {
            if (subPart.startsWith('*') && subPart.endsWith('*') && !subPart.startsWith('**')) {
              return (
                <em key={`${index}-${subIndex}`} className="formatted-italic">
                  {subPart.slice(1, -1)}
                </em>
              );
            }
            return subPart;
          });
        }
        return part;
      });

      // 处理行内代码 `code`
      result = result.map((part, index) => {
        if (typeof part === 'string') {
          return part.split(/(`[^`]+`)/g).map((subPart, subIndex) => {
            if (subPart.startsWith('`') && subPart.endsWith('`')) {
              return (
                <code key={`${index}-${subIndex}`} className="formatted-inline-code">
                  {subPart.slice(1, -1)}
                </code>
              );
            }
            return subPart;
          });
        }
        return part;
      });

      // 处理链接 [text](url)
      result = result.map((part, index) => {
        if (typeof part === 'string') {
          return part.split(/(\[([^\]]+)\]\(([^)]+)\))/g).map((subPart, subIndex) => {
            const linkMatch = subPart.match(/\[([^\]]+)\]\(([^)]+)\)/);
            if (linkMatch) {
              return (
                <a key={`${index}-${subIndex}`} href={linkMatch[2]} className="formatted-link" target="_blank" rel="noopener noreferrer">
                  {linkMatch[1]}
                </a>
              );
            }
            return subPart;
          });
        }
        return part;
      });

      return result;
    };

    lines.forEach((line, index) => {
      // 处理代码块
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // 结束代码块
          flushLists();
          elements.push(
            <div key={`code-${index}`} className="formatted-code-block">
              {codeBlockLanguage && <div className="code-language">{codeBlockLanguage}</div>}
              <pre><code>{codeBlockContent.join('\n')}</code></pre>
            </div>
          );
          codeBlockContent = [];
          codeBlockLanguage = '';
          inCodeBlock = false;
        } else {
          // 开始代码块
          flushLists();
          const language = line.trim().slice(3).trim();
          codeBlockLanguage = language;
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // 处理标题
      if (line.startsWith('#### ')) {
        flushLists();
        elements.push(
          <h5 key={index} className="formatted-h5">
            {renderInlineMarkdown(line.slice(5))}
          </h5>
        );
      } else if (line.startsWith('### ')) {
        flushLists();
        elements.push(
          <h4 key={index} className="formatted-h4">
            {renderInlineMarkdown(line.slice(4))}
          </h4>
        );
      } else if (line.startsWith('## ')) {
        flushLists();
        elements.push(
          <h3 key={index} className="formatted-h3">
            {renderInlineMarkdown(line.slice(3))}
          </h3>
        );
      } else if (line.startsWith('# ')) {
        flushLists();
        elements.push(
          <h2 key={index} className="formatted-h2">
            {renderInlineMarkdown(line.slice(2))}
          </h2>
        );
      }
      // 处理列表
      else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const content = line.trim().slice(2);
        currentList.push(
          <li key={index} className="formatted-list-item">
            {renderInlineMarkdown(content)}
          </li>
        );
      }
      // 处理数字列表
      else if (/^\d+\.\s/.test(line.trim())) {
        const content = line.trim().replace(/^\d+\.\s/, '');
        currentNumberedList.push(
          <li key={index} className="formatted-numbered-item">
            {renderInlineMarkdown(content)}
          </li>
        );
      }
      // 处理引用
      else if (line.trim().startsWith('> ')) {
        flushLists();
        elements.push(
          <blockquote key={index} className="formatted-quote">
            {renderInlineMarkdown(line.trim().slice(2))}
          </blockquote>
        );
      }
      // 处理分隔线
      else if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
        flushLists();
        elements.push(<hr key={index} className="formatted-hr" />);
      }
      // 处理空行
      else if (line.trim() === '') {
        flushLists();
        elements.push(<div key={index} className="formatted-empty-line" />);
      }
      // 处理普通段落
      else {
        flushLists();
        elements.push(
          <p key={index} className="formatted-paragraph">
            {renderInlineMarkdown(line)}
          </p>
        );
      }
    });

    // 处理最后的列表
    flushLists();

    return elements;
  };

  return (
    <div className={`formatted-text markdown-renderer ${className}`}>
      {renderMarkdown(content)}
    </div>
  );
};

export default MarkdownRenderer;
