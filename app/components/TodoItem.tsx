import { Todo } from '../types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
}

export function TodoItem({ todo, onToggle }: TodoItemProps) {
  return (
    <li
      data-testid="todo-item"
      style={{
        padding: '0.75rem 1rem',
        borderBottom: '1px solid #eee',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      <input
        type="checkbox"
        data-testid="todo-checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        style={{ cursor: 'pointer' }}
      />
      <span
        style={{
          textDecoration: todo.completed ? 'line-through' : 'none',
          color: todo.completed ? '#888' : 'inherit',
        }}
      >
        {todo.title}
      </span>
    </li>
  );
}
