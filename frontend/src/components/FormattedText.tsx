import React from 'react';
import './FormattedText.css';

interface FormattedTextProps {
  content: string;
  className?: string;
}

const FormattedText: React.FC<FormattedTextProps> = ({ content, className = '' }) => {
  const formatText = (text: string) => {
    // 按行分割文本
    const lines = text.split('\n');
    const formattedLines: JSX.Element[] = [];
    
    lines.forEach((line, index) => {
      // 处理标题（### ## #）
      if (line.startsWith('### ')) {
        formattedLines.push(
          <h4 key={index} className="formatted-h4">
            {line.replace('### ', '')}
          </h4>
        );
      } else if (line.startsWith('## ')) {
        formattedLines.push(
          <h3 key={index} className="formatted-h3">
            {line.replace('## ', '')}
          </h3>
        );
      } else if (line.startsWith('# ')) {
        formattedLines.push(
          <h2 key={index} className="formatted-h2">
            {line.replace('# ', '')}
          </h2>
        );
      }
      // 处理粗体文本（**text**）
      else if (line.includes('**')) {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        const formattedParts = parts.map((part, partIndex) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={partIndex} className="formatted-bold">
                {part.replace(/\*\*/g, '')}
              </strong>
            );
          }
          return part;
        });
        formattedLines.push(
          <p key={index} className="formatted-paragraph">
            {formattedParts}
          </p>
        );
      }
      // 处理列表项（- 或 * 开头）
      else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        formattedLines.push(
          <li key={index} className="formatted-list-item">
            {line.trim().replace(/^[-*] /, '')}
          </li>
        );
      }
      // 处理数字列表（1. 2. 等）
      else if (/^\d+\.\s/.test(line.trim())) {
        formattedLines.push(
          <li key={index} className="formatted-numbered-item">
            {line.trim().replace(/^\d+\.\s/, '')}
          </li>
        );
      }
      // 处理代码块（```）
      else if (line.trim().startsWith('```')) {
        formattedLines.push(
          <div key={index} className="formatted-code-block">
            <code>{line.replace(/```/g, '')}</code>
          </div>
        );
      }
      // 处理引用（> 开头）
      else if (line.trim().startsWith('> ')) {
        formattedLines.push(
          <blockquote key={index} className="formatted-quote">
            {line.trim().replace('> ', '')}
          </blockquote>
        );
      }
      // 处理空行 - 减少空行间距
      else if (line.trim() === '') {
        formattedLines.push(<div key={index} className="formatted-empty-line" />);
      }
      // 处理普通文本
      else {
        // 处理行内代码（`code`）
        if (line.includes('`')) {
          const parts = line.split(/(`[^`]+`)/g);
          const formattedParts = parts.map((part, partIndex) => {
            if (part.startsWith('`') && part.endsWith('`')) {
              return (
                <code key={partIndex} className="formatted-inline-code">
                  {part.replace(/`/g, '')}
                </code>
              );
            }
            return part;
          });
          formattedLines.push(
            <p key={index} className="formatted-paragraph">
              {formattedParts}
            </p>
          );
        } else {
          formattedLines.push(
            <p key={index} className="formatted-paragraph">
              {line}
            </p>
          );
        }
      }
    });
    
    return formattedLines;
  };

  return (
    <div className={`formatted-text ${className}`}>
      {formatText(content)}
    </div>
  );
};

export default FormattedText;
