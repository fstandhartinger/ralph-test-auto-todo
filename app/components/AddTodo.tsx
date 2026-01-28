import { useState, KeyboardEvent, ChangeEvent } from 'react';

interface AddTodoProps {
  onAdd: (title: string, targetDate?: string) => void;
}

export function AddTodo({ onAdd }: AddTodoProps) {
  const [inputValue, setInputValue] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const handleSubmit = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue) {
      onAdd(trimmedValue, targetDate || undefined);
      setInputValue('');
      setTargetDate('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginBottom: '1rem',
      }}
    >
      <input
        type="text"
        data-testid="todo-input"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Enter a new todo..."
        style={{
          flex: '1 1 200px',
          minWidth: 0,
          padding: '0.75rem',
          fontSize: '1rem',
          border: '1px solid var(--input-border)',
          borderRadius: '4px',
          backgroundColor: 'var(--input-background)',
          color: 'var(--foreground)',
        }}
      />
      <input
        type="date"
        data-testid="target-date-input"
        value={targetDate}
        onChange={(e) => setTargetDate(e.target.value)}
        style={{
          padding: '0.75rem',
          fontSize: '1rem',
          border: '1px solid var(--input-border)',
          borderRadius: '4px',
          backgroundColor: 'var(--input-background)',
          color: 'var(--foreground)',
          flexShrink: 0,
        }}
      />
      <button
        type="button"
        data-testid="add-todo-button"
        onClick={handleSubmit}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: 'var(--accent)',
          color: 'var(--accent-foreground)',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        Add
      </button>
    </div>
  );
}
