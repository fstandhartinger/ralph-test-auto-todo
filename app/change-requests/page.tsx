'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChangeRequest, ChangeRequestComment } from '../types/change-request';

const statusColors: Record<ChangeRequest['status'], string> = {
  open: '#4CAF50',
  in_progress: '#2196F3',
  completed: '#9E9E9E',
  rejected: '#f44336',
};

const priorityColors: Record<ChangeRequest['priority'], string> = {
  low: '#8BC34A',
  medium: '#FF9800',
  high: '#f44336',
};

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

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ChangeRequest['priority']>('medium');
  const [status, setStatus] = useState<ChangeRequest['status']>('open');

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

  const fetchComments = useCallback(async (changeRequestId: string) => {
    try {
      const response = await fetch(`/api/change-requests/${changeRequestId}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      setComments(prev => ({ ...prev, [changeRequestId]: data }));
    } catch {
      console.error('Failed to load comments');
    }
  }, []);

  useEffect(() => {
    fetchChangeRequests();
  }, [fetchChangeRequests]);

  useEffect(() => {
    if (expandedId) {
      fetchComments(expandedId);
    }
  }, [expandedId, fetchComments]);

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
          <a href="/" style={{ color: '#722F37', fontSize: '0.875rem' }}>Back to Todos</a>
          <button
            onClick={() => { resetForm(); setShowForm(!showForm); }}
            style={{
              backgroundColor: '#722F37',
              color: 'white',
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
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ backgroundColor: '#f5f5f5', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h2 style={{ marginTop: 0 }}>{editingId ? 'Edit Request' : 'New Request'}</h2>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
              placeholder="Brief title for the request"
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box', resize: 'vertical' }}
              placeholder="Detailed description of the feature or issue..."
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ChangeRequest['priority'])}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            {editingId && (
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ChangeRequest['status'])}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            )}
          </div>
          <button
            type="submit"
            style={{
              backgroundColor: '#722F37',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            {editingId ? 'Update' : 'Submit'}
          </button>
        </form>
      )}

      {isLoading ? (
        <p>Loading...</p>
      ) : changeRequests.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>No change requests yet. Create one to get started!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {changeRequests.map((cr) => (
            <div
              key={cr.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '1rem',
                backgroundColor: 'white',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, flex: 1 }}>{cr.title}</h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span
                    style={{
                      backgroundColor: priorityColors[cr.priority],
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
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
                      color: 'white',
                      border: 'none',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <p style={{ margin: '0.5rem 0', color: '#333', whiteSpace: 'pre-wrap' }}>{cr.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px solid #eee' }}>
                <span style={{ color: '#666', fontSize: '0.875rem' }}>
                  Created: {new Date(cr.created_at).toLocaleDateString()}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => toggleExpand(cr.id)}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#666',
                      border: '1px solid #ddd',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    {expandedId === cr.id ? 'Hide Comments' : 'Comments'}
                  </button>
                  <button
                    onClick={() => handleEdit(cr)}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#722F37',
                      border: '1px solid #722F37',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cr.id)}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#f44336',
                      border: '1px solid #f44336',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              {expandedId === cr.id && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Comments</h4>

                  {/* Comments List */}
                  {comments[cr.id]?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                      {comments[cr.id].map((comment) => (
                        <div
                          key={comment.id}
                          style={{
                            backgroundColor: '#f9f9f9',
                            padding: '0.75rem',
                            borderRadius: '4px',
                            borderLeft: '3px solid #722F37',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <strong style={{ color: '#722F37' }}>{comment.author}</strong>
                            <span style={{ color: '#999', fontSize: '0.75rem' }}>
                              {new Date(comment.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#999', fontStyle: 'italic', marginBottom: '1rem' }}>No comments yet</p>
                  )}

                  {/* Add Comment Form */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={commentAuthor}
                      onChange={(e) => setCommentAuthor(e.target.value)}
                      placeholder="Your name (optional)"
                      style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        rows={2}
                        style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', resize: 'vertical' }}
                      />
                      <button
                        onClick={() => handleAddComment(cr.id)}
                        style={{
                          backgroundColor: '#722F37',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          alignSelf: 'flex-end',
                        }}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
