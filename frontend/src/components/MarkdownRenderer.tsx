import React from 'react';
import './FormattedText.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactElement[] = [];
    let currentList: React.ReactElement[] = [];
    let currentNumberedList: React.ReactElement[] = [];
    let currentTaskList: React.ReactElement[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLanguage = '';
    let inTable = false;
    let tableRows: string[][] = [];
    let tableHeaders: string[] = [];

    const flushLists = () => {
      if (currentList.length > 0) {
        elements.push(<ul key={`ul-${elements.length}`} className="formatted-text ul">{currentList}</ul>);
        currentList = [];
      }
      if (currentNumberedList.length > 0) {
        elements.push(<ol key={`ol-${elements.length}`} className="formatted-text ol">{currentNumberedList}</ol>);
        currentNumberedList = [];
      }
      if (currentTaskList.length > 0) {
        elements.push(<ul key={`task-${elements.length}`} className="formatted-text task-list">{currentTaskList}</ul>);
        currentTaskList = [];
      }
    };

    const flushTable = () => {
      if (inTable && tableRows.length > 0) {
        elements.push(
          <div key={`table-${elements.length}`} className="formatted-table-container">
            <table className="formatted-table">
              {tableHeaders.length > 0 && (
                <thead>
                  <tr>
                    {tableHeaders.map((header, index) => (
                      <th key={index} className="formatted-table-header">
                        {renderInlineMarkdown(header)}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {tableRows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="formatted-table-row">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="formatted-table-cell">
                        {renderInlineMarkdown(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        inTable = false;
        tableRows = [];
        tableHeaders = [];
      }
    };

    const renderInlineMarkdown = (text: string): any => {
      let result: any[] = [text];
      let keyCounter = 0;

      // 处理行内代码 `code` - 优先处理，避免与其他格式冲突
      result = result.flatMap((part: any) => {
        if (typeof part === 'string') {
          return part.split(/(`[^`]+`)/g).map((subPart: any) => {
            if (subPart.startsWith('`') && subPart.endsWith('`')) {
              return (
                <code key={`code-${keyCounter++}`} className="formatted-inline-code">
                  {subPart.slice(1, -1)}
                </code>
              );
            }
            return subPart;
          });
        }
        return part;
      });

      // 处理删除线 ~~text~~
      result = result.flatMap((part: any) => {
        if (typeof part === 'string') {
          return part.split(/(~~[^~]+~~)/g).map((subPart: any) => {
            if (subPart.startsWith('~~') && subPart.endsWith('~~')) {
              return (
                <del key={`del-${keyCounter++}`} className="formatted-strikethrough">
                  {subPart.slice(2, -2)}
                </del>
              );
            }
            return subPart;
          });
        }
        return part;
      });

      // 处理粗体 **text**
      result = result.flatMap((part: any) => {
        if (typeof part === 'string') {
          return part.split(/(\*\*[^*]+\*\*)/g).map((subPart: any) => {
            if (subPart.startsWith('**') && subPart.endsWith('**')) {
              return (
                <strong key={`bold-${keyCounter++}`} className="formatted-bold">
                  {subPart.slice(2, -2)}
                </strong>
              );
            }
            return subPart;
          });
        }
        return part;
      });

      // 处理斜体 *text*
      result = result.flatMap((part: any) => {
        if (typeof part === 'string') {
          return part.split(/(\*[^*]+\*)/g).map((subPart: any) => {
            if (subPart.startsWith('*') && subPart.endsWith('*') && !subPart.startsWith('**')) {
              return (
                <em key={`italic-${keyCounter++}`} className="formatted-italic">
                  {subPart.slice(1, -1)}
                </em>
              );
            }
            return subPart;
          });
        }
        return part;
      });

      // 处理链接 [text](url)
      result = result.flatMap((part: any) => {
        if (typeof part === 'string') {
          return part.split(/(\[([^\]]+)\]\(([^)]+)\))/g).map((subPart: any) => {
            const linkMatch = subPart.match(/\[([^\]]+)\]\(([^)]+)\)/);
            if (linkMatch) {
              return (
                <a key={`link-${keyCounter++}`} href={linkMatch[2]} className="formatted-link" target="_blank" rel="noopener noreferrer">
                  {linkMatch[1]}
                </a>
              );
            }
            return subPart;
          });
        }
        return part;
      });

      // 处理高亮 ==text==
      result = result.flatMap((part: any) => {
        if (typeof part === 'string') {
          return part.split(/(==[^=]+==)/g).map((subPart: any) => {
            if (subPart.startsWith('==') && subPart.endsWith('==')) {
              return (
                <mark key={`highlight-${keyCounter++}`} className="formatted-highlight">
                  {subPart.slice(2, -2)}
                </mark>
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
          flushTable();
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
          flushTable();
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

      // 处理表格
      if (line.includes('|')) {
        // 表格分隔行
        if (line.trim().match(/^\|[\s\-\|]+\|$/)) {
          flushLists();
          if (!inTable) {
            inTable = true;
            // 解析表头
            const prevLine = index > 0 ? lines[index - 1] : '';
            if (prevLine.includes('|')) {
              const headers = prevLine.split('|').slice(1, -1).map(header => header.trim());
              tableHeaders = headers;
            }
          }
          return;
        }
        // 表格数据行
        if (inTable) {
          const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
          if (cells.length > 0) {
            tableRows.push(cells);
          }
          return;
        }
      } else if (inTable) {
        // 表格结束
        flushTable();
      }

      // 处理标题
      if (line.startsWith('##### ')) {
        flushLists();
        flushTable();
        elements.push(
          <h6 key={index} className="formatted-h6">
            {renderInlineMarkdown(line.slice(6))}
          </h6>
        );
      } else if (line.startsWith('#### ')) {
        flushLists();
        flushTable();
        elements.push(
          <h5 key={index} className="formatted-h5">
            {renderInlineMarkdown(line.slice(5))}
          </h5>
        );
      } else if (line.startsWith('### ')) {
        flushLists();
        flushTable();
        elements.push(
          <h4 key={index} className="formatted-h4">
            {renderInlineMarkdown(line.slice(4))}
          </h4>
        );
      } else if (line.startsWith('## ')) {
        flushLists();
        flushTable();
        elements.push(
          <h3 key={index} className="formatted-h3">
            {renderInlineMarkdown(line.slice(3))}
          </h3>
        );
      } else if (line.startsWith('# ')) {
        flushLists();
        flushTable();
        elements.push(
          <h2 key={index} className="formatted-h2">
            {renderInlineMarkdown(line.slice(2))}
          </h2>
        );
      }
      // 处理任务列表
      else if (line.trim().match(/^[-*]\s\[[ x]\]/)) {
        const isChecked = line.trim().includes('[x]');
        const content = line.trim().replace(/^[-*]\s\[[ x]\]\s/, '');
        currentTaskList.push(
          <li key={index} className="formatted-task-item">
            <input type="checkbox" checked={isChecked} readOnly className="formatted-checkbox" />
            <span className={isChecked ? 'formatted-task-completed' : 'formatted-task-pending'}>
              {renderInlineMarkdown(content)}
            </span>
          </li>
        );
      }
      // 处理普通列表
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
      else if (line.trim().startsWith('>')) {
        flushLists();
        flushTable();
        // 移除开头的 > 符号和可能的空格
        const content = line.trim().replace(/^>\s*/, '');
        if (content.trim()) {
          elements.push(
            <blockquote key={index} className="formatted-quote">
              {renderInlineMarkdown(content)}
            </blockquote>
          );
        }
      }
      // 处理分隔线
      else if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
        flushLists();
        flushTable();
        elements.push(<hr key={index} className="formatted-hr" />);
      }
      // 处理空行
      else if (line.trim() === '') {
        flushLists();
        flushTable();
        elements.push(<div key={index} className="formatted-empty-line" />);
      }
      // 处理普通段落
      else {
        flushLists();
        flushTable();
        elements.push(
          <p key={index} className="formatted-paragraph">
            {renderInlineMarkdown(line)}
          </p>
        );
      }
    });

    // 处理最后的列表和表格
    flushLists();
    flushTable();

    return elements;
  };

  return (
    <div className={`formatted-text markdown-renderer ${className}`}>
      {renderMarkdown(content)}
    </div>
  );
};

export default MarkdownRenderer;
