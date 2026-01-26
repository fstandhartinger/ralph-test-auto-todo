import { NextResponse } from 'next/server';
import { query, initDatabase } from '@/app/lib/db';
import { ChangeRequestComment } from '@/app/types/change-request';

type RouteParams = { params: Promise<{ id: string }> };

// Initialize comments table
async function initCommentsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS change_request_comments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      change_request_id UUID NOT NULL REFERENCES change_requests(id) ON DELETE CASCADE,
      author VARCHAR(100) NOT NULL DEFAULT 'Anonymous',
      content TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);
}

// GET - List all comments for a change request
export async function GET(request: Request, { params }: RouteParams) {
  try {
    await initDatabase();
    await initCommentsTable();
    const { id } = await params;

    const comments = await query<ChangeRequestComment>(
      'SELECT * FROM change_request_comments WHERE change_request_id = $1 ORDER BY created_at ASC',
      [id]
    );

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST - Add a comment to a change request
export async function POST(request: Request, { params }: RouteParams) {
  try {
    await initDatabase();
    await initCommentsTable();
    const { id } = await params;
    const body = await request.json();
    const { author = 'Anonymous', content } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Verify the change request exists
    const changeRequest = await query(
      'SELECT id FROM change_requests WHERE id = $1',
      [id]
    );

    if (changeRequest.length === 0) {
      return NextResponse.json(
        { error: 'Change request not found' },
        { status: 404 }
      );
    }

    const result = await query<ChangeRequestComment>(
      `INSERT INTO change_request_comments (change_request_id, author, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, author, content]
    );

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
