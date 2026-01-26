import { ChangeRequestComment } from '../types/change-request';

export type ChangeRequestReadState = Record<string, string[]>;

export const READ_STORAGE_KEY = 'ralph-change-request-read-comments';

export function loadReadState(): ChangeRequestReadState {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(READ_STORAGE_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const normalized: ChangeRequestReadState = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (Array.isArray(value)) {
        normalized[key] = value.filter((entry): entry is string => typeof entry === 'string');
      }
    }
    return normalized;
  } catch {
    return {};
  }
}

export function saveReadState(state: ChangeRequestReadState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(state));
}

export function markCommentsRead(
  state: ChangeRequestReadState,
  changeRequestId: string,
  commentIds: string[]
): ChangeRequestReadState {
  if (commentIds.length === 0) return state;
  const existing = new Set(state[changeRequestId] ?? []);
  commentIds.forEach((id) => existing.add(id));
  return { ...state, [changeRequestId]: Array.from(existing) };
}

export function getUnreadCount(
  comments: ChangeRequestComment[] | undefined,
  state: ChangeRequestReadState,
  changeRequestId: string
): number {
  if (!comments || comments.length === 0) return 0;
  const readSet = new Set(state[changeRequestId] ?? []);
  return comments.reduce((count, comment) => count + (readSet.has(comment.id) ? 0 : 1), 0);
}

export function getTotalUnread(
  commentsByRequest: Record<string, ChangeRequestComment[]>,
  state: ChangeRequestReadState
): number {
  return Object.entries(commentsByRequest).reduce(
    (total, [id, list]) => total + getUnreadCount(list, state, id),
    0
  );
}
