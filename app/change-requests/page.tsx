'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ChangeRequest, ChangeRequestComment } from '../types/change-request';
import { ThemeToggle } from '../components/ThemeToggle';
import {
  ChangeRequestReadState,
  READ_STORAGE_KEY,
  getUnreadCount,
  loadReadState,
  markCommentsRead,
  saveReadState,
} from '../lib/change-request-read';

const statusColors: Record<ChangeRequest['status'], string> = {
  open: 'var(--status-open)',
  in_progress: 'var(--status-in-progress)',
  in_discussion: 'var(--status-in-discussion)',
  completed: 'var(--status-completed)',
  rejected: 'var(--status-rejected)',
};

const priorityColors: Record<ChangeRequest['priority'], string> = {
  low: 'var(--priority-low)',
  medium: 'var(--priority-medium)',
  high: 'var(--priority-high)',
};

const COMMENT_POLL_INTERVAL_MS = 4000;
const formatTimestamp = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

export default function ChangeRequestsPage() {
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, ChangeRequestComment[]>>({});
  const [newComment, setNewComment] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [readState, setReadState] = useState<ChangeRequestReadState>(() => loadReadState());
  const [notificationsSupported, setNotificationsSupported] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  const lastCommentIdRef = useRef<Record<string, string>>({});
  const hasFetchedCommentsRef = useRef<Record<string, boolean>>({});
  const suppressedNotificationIdsRef = useRef<Set<string>>(new Set());

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ChangeRequest['priority']>('medium');
  const [status, setStatus] = useState<ChangeRequest['status']>('open');

  useEffect(() => {
    saveReadState(readState);
  }, [readState]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('Notification' in window) {
      setNotificationsSupported(true);
      setNotificationPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === READ_STORAGE_KEY) {
        setReadState(loadReadState());
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const fetchChangeRequests = useCallback(async () => {
    try {
      const response = await fetch('/api/change-requests');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setChangeRequests(data);
      setError(null);
    } catch {
      setError('Failed to load change requests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCommentUpdate = useCallback((changeRequestId: string, commentList: ChangeRequestComment[]) => {
    const suppressed = suppressedNotificationIdsRef.current;
    if (!commentList.length) {
      hasFetchedCommentsRef.current[changeRequestId] = true;
      lastCommentIdRef.current[changeRequestId] = '';
      return;
    }

    const latestComment = commentList[commentList.length - 1];
    const previousLatestId = lastCommentIdRef.current[changeRequestId];
    lastCommentIdRef.current[changeRequestId] = latestComment.id;

    const hadBaseline = hasFetchedCommentsRef.current[changeRequestId];
    hasFetchedCommentsRef.current[changeRequestId] = true;

    if (!hadBaseline || previousLatestId === latestComment.id) {
      return;
    }

    if (expandedId === changeRequestId) {
      return;
    }

    const readSet = new Set(readState[changeRequestId] ?? []);
    const unreadCandidates = commentList.filter((comment) => !readSet.has(comment.id));
    const notificationTarget = [...unreadCandidates]
      .reverse()
      .find((comment) => !suppressed.has(comment.id));

    unreadCandidates.forEach((comment) => suppressed.delete(comment.id));

    if (!notificationTarget) return;
    if (!notificationsSupported || notificationPermission !== 'granted') return;

    new Notification('Neuer Kommentar', {
      body: `${notificationTarget.author}: ${notificationTarget.content}`,
    });
  }, [expandedId, notificationPermission, notificationsSupported, readState]);

  const fetchComments = useCallback(async (changeRequestId: string) => {
    try {
      const response = await fetch(`/api/change-requests/${changeRequestId}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      setComments(prev => ({ ...prev, [changeRequestId]: data }));
      handleCommentUpdate(changeRequestId, data);
    } catch {
      console.error('Failed to load comments');
    }
  }, [handleCommentUpdate]);

  useEffect(() => {
    fetchChangeRequests();
  }, [fetchChangeRequests]);

  useEffect(() => {
    if (expandedId) {
      fetchComments(expandedId);
    }
  }, [expandedId, fetchComments]);

  useEffect(() => {
    if (changeRequests.length === 0) return;
    const refreshAllComments = () => {
      changeRequests.forEach((cr) => {
        fetchComments(cr.id);
      });
    };

    refreshAllComments();
    const interval = setInterval(refreshAllComments, COMMENT_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [changeRequests, fetchComments]);

  useEffect(() => {
    if (!expandedId) return;
    const expandedComments = comments[expandedId];
    if (!expandedComments?.length) return;
    setReadState((prev) =>
      markCommentsRead(
        prev,
        expandedId,
        expandedComments.map((comment) => comment.id)
      )
    );
  }, [comments, expandedId]);

  const unreadCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    changeRequests.forEach((cr) => {
      counts[cr.id] = getUnreadCount(comments[cr.id], readState, cr.id);
    });
    return counts;
  }, [changeRequests, comments, readState]);

  const requestNotificationPermission = async () => {
    if (!notificationsSupported) return;
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setStatus('open');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId
        ? `/api/change-requests/${editingId}`
        : '/api/change-requests';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, priority, ...(editingId && { status }) }),
      });

      if (!response.ok) throw new Error('Failed to save');

      resetForm();
      fetchChangeRequests();
    } catch {
      setError('Failed to save change request');
    }
  };

  const handleEdit = (cr: ChangeRequest) => {
    setTitle(cr.title);
    setDescription(cr.description);
    setPriority(cr.priority);
    setStatus(cr.status);
    setEditingId(cr.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this change request?')) return;
    try {
      const response = await fetch(`/api/change-requests/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete');
      fetchChangeRequests();
    } catch {
      setError('Failed to delete change request');
    }
  };

  const handleStatusChange = async (id: string, newStatus: ChangeRequest['status']) => {
    try {
      const response = await fetch(`/api/change-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update');
      fetchChangeRequests();
    } catch {
      setError('Failed to update status');
    }
  };

  const handleAddComment = async (changeRequestId: string) => {
    if (!newComment.trim()) return;
    try {
      const response = await fetch(`/api/change-requests/${changeRequestId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          author: commentAuthor.trim() || 'Anonymous'
        }),
      });
      if (!response.ok) throw new Error('Failed to add comment');
      const created = await response.json();
      suppressedNotificationIdsRef.current.add(created.id);
      setReadState((prev) => markCommentsRead(prev, changeRequestId, [created.id]));
      setNewComment('');
      fetchComments(changeRequestId);
    } catch {
      setError('Failed to add comment');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <main style={{ padding: '1rem', fontFamily: 'system-ui, sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '0.75rem' }}>
        <h1 style={{ fontSize: 'clamp(1.25rem, 5vw, 1.75rem)', margin: 0 }}>Change Requests</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: 'var(--accent)', fontSize: '0.875rem' }}>Back to Todos</Link>
          <button
            onClick={() => { resetForm(); setShowForm(!showForm); }}
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-foreground)',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              whiteSpace: 'nowrap',
            }}
          >
            {showForm ? 'Cancel' : 'New Request'}
          </button>
          {notificationsSupported && notificationPermission !== 'granted' && (
            <button
              onClick={requestNotificationPermission}
              disabled={notificationPermission === 'denied'}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--accent)',
                border: '1px solid var(--accent)',
                padding: '0.5rem 0.75rem',
                borderRadius: '4px',
                cursor: notificationPermission === 'denied' ? 'not-allowed' : 'pointer',
                fontSize: '0.75rem',
                opacity: notificationPermission === 'denied' ? 0.6 : 1,
              }}
            >
              {notificationPermission === 'denied' ? 'Notifications Blocked' : 'Enable Notifications'}
            </button>
          )}
          <ThemeToggle />
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: 'var(--error-background)', color: 'var(--error-text)', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--form-background)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h2 style={{ marginTop: 0, fontSize: 'clamp(1.1rem, 4vw, 1.5rem)' }}>{editingId ? 'Edit Request' : 'New Request'}</h2>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem' }}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--input-border)', boxSizing: 'border-box', fontSize: '1rem', backgroundColor: 'var(--input-background)', color: 'var(--foreground)' }}
              placeholder="Brief title for the request"
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem' }}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--input-border)', boxSizing: 'border-box', resize: 'vertical', fontSize: '1rem', backgroundColor: 'var(--input-background)', color: 'var(--foreground)' }}
              placeholder="Detailed description of the feature or issue..."
            />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: '1 1 150px', minWidth: '120px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem' }}>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ChangeRequest['priority'])}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--input-border)', fontSize: '1rem', backgroundColor: 'var(--input-background)', color: 'var(--foreground)' }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            {editingId && (
              <div style={{ flex: '1 1 150px', minWidth: '120px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem' }}>Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ChangeRequest['status'])}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--input-border)', fontSize: '1rem', backgroundColor: 'var(--input-background)', color: 'var(--foreground)' }}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="in_discussion">In Discussion</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            )}
          </div>
          <button
            type="submit"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-foreground)',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              width: '100%',
            }}
          >
            {editingId ? 'Update' : 'Submit'}
          </button>
        </form>
      )}

      {isLoading ? (
        <p>Loading...</p>
      ) : changeRequests.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No change requests yet. Create one to get started!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {changeRequests.map((cr) => {
            const unreadCount = unreadCounts[cr.id] ?? 0;
            return (
              <div
                key={cr.id}
                data-testid={`change-request-card-${cr.id}`}
                style={{
                  border: '1px solid var(--card-border)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  backgroundColor: 'var(--card-background)',
                }}
              >
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, flex: '1 1 auto', minWidth: '150px', fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', wordBreak: 'break-word' }}>{cr.title}</h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                  <span
                    style={{
                      backgroundColor: priorityColors[cr.priority],
                      color: 'var(--accent-foreground)',
                      padding: '0.2rem 0.4rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                    }}
                  >
                    {cr.priority}
                  </span>
                  <select
                    value={cr.status}
                    onChange={(e) => handleStatusChange(cr.id, e.target.value as ChangeRequest['status'])}
                    style={{
                      backgroundColor: statusColors[cr.status],
                      color: 'var(--accent-foreground)',
                      border: 'none',
                      padding: '0.2rem 0.4rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="in_discussion">In Discussion</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', fontSize: '0.9rem', wordBreak: 'break-word' }}>{cr.description}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-light)', gap: '0.5rem' }}>
                <span data-testid="change-request-created-at" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  Created: {formatTimestamp(cr.created_at)}
                </span>
                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => toggleExpand(cr.id)}
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--card-border)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                    data-testid="change-request-comments-toggle"
                  >
                    <span>{expandedId === cr.id ? 'Hide' : 'Comments'}</span>
                    {unreadCount > 0 && (
                      <span
                        data-testid="change-request-unread-count"
                        style={{
                          backgroundColor: 'var(--accent)',
                          color: 'var(--accent-foreground)',
                          borderRadius: '999px',
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          padding: '0.05rem 0.4rem',
                          minWidth: '1.2rem',
                          textAlign: 'center',
                        }}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(cr)}
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--accent)',
                      border: '1px solid var(--accent)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cr.id)}
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--danger)',
                      border: '1px solid var(--danger)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              {expandedId === cr.id && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Comments</h4>

                  {/* Comments List */}
                  {comments[cr.id]?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                      {comments[cr.id].map((comment) => (
                        <div
                          key={comment.id}
                          style={{
                            backgroundColor: 'var(--comment-background)',
                            padding: '0.5rem',
                            borderRadius: '4px',
                            borderLeft: '3px solid var(--accent)',
                          }}
                        >
                          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: '0.25rem', gap: '0.25rem' }}>
                            <strong style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>{comment.author}</strong>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                              {formatTimestamp(comment.created_at)}
                            </span>
                          </div>
                          <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.85rem', wordBreak: 'break-word' }}>{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '1rem', fontSize: '0.85rem' }}>No comments yet</p>
                  )}

                  {/* Add Comment Form */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={commentAuthor}
                      onChange={(e) => setCommentAuthor(e.target.value)}
                      placeholder="Your name (optional)"
                      style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--input-border)', fontSize: '0.9rem', backgroundColor: 'var(--input-background)', color: 'var(--foreground)' }}
                    />
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      rows={2}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--input-border)', resize: 'vertical', fontSize: '0.9rem', boxSizing: 'border-box', backgroundColor: 'var(--input-background)', color: 'var(--foreground)' }}
                    />
                    <button
                      onClick={() => handleAddComment(cr.id)}
                      style={{
                        backgroundColor: 'var(--accent)',
                        color: 'var(--accent-foreground)',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        width: '100%',
                        fontSize: '0.9rem',
                      }}
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
