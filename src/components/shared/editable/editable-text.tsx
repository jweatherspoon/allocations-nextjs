'use client';

import { useState } from 'react';

export default function EditableText({
  text,
  onCommitChangeAction,
  className,
}: {
  text: string;
  onCommitChangeAction?: (newText: string) => void;
  className?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentText, setCurrentText] = useState(text);

  const handleTextClick = () => {
    setIsEditing(true);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentText(e.target.value);
  };

  const handleTextBlur = () => {
    setIsEditing(false);
    onCommitChangeAction?.(currentText);
  };

  return isEditing ? (
    <div className='px-2'>
      <input
        type='text'
        value={currentText}
        onChange={handleTextChange}
        onBlur={handleTextBlur}
        autoFocus
        className={`w-full ${className}`}
      />
    </div>
  ) : (
    <span className={`cursor-pointer ${className}`} onClick={handleTextClick}>
      {currentText}
    </span>
  );
}
