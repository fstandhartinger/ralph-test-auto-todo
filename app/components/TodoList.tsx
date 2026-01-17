import { Todo } from '../types/todo';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
}

export function TodoList({ todos }: TodoListProps) {
  return (
    <ul
      data-testid="todo-list"
      style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
