import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyCommandButtonProps {
  command: string;
  className?: string;
  iconClassName?: string;
  idleLabel?: string;
  copiedLabel?: string;
}

/** A copy-to-clipboard button with its own "copied!" state, reused anywhere a shell command needs a one-click copy. */
export const CopyCommandButton: React.FC<CopyCommandButtonProps> = ({
  command,
  className = '',
  iconClassName = 'w-3.5 h-3.5',
  idleLabel = 'Скопировать',
  copiedLabel = 'Скопировано',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className={className}>
      {copied ? (
        <Check className={`${iconClassName} text-emerald-400`} />
      ) : (
        <Copy className={iconClassName} />
      )}
      <span className={copied ? 'text-emerald-400' : undefined}>{copied ? copiedLabel : idleLabel}</span>
    </button>
  );
};
