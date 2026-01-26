import { NextResponse } from 'next/server';
import { query, initDatabase } from '@/app/lib/db';
import { ChangeRequest } from '@/app/types/change-request';

type RouteParams = { params: Promise<{ id: string }> };

// GET - Get a single change request by ID
export async function GET(request: Request, { params }: RouteParams) {
  try {
    await initDatabase();
    const { id } = await params;
    const result = await query<ChangeRequest>(
      'SELECT * FROM change_requests WHERE id = $1',
      [id]
    );

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Change request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error fetching change request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch change request' },
      { status: 500 }
    );
  }
}

// PUT - Update a change request
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    await initDatabase();
    const { id } = await params;
    const body = await request.json();
    const { title, description, status, priority } = body;

    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }
    if (priority !== undefined) {
      updates.push(`priority = $${paramIndex++}`);
      values.push(priority);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query<ChangeRequest>(
      `UPDATE change_requests
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Change request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating change request:', error);
    return NextResponse.json(
      { error: 'Failed to update change request' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a change request
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    await initDatabase();
    const { id } = await params;
    const result = await query<ChangeRequest>(
      'DELETE FROM change_requests WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Change request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Change request deleted' });
  } catch (error) {
    console.error('Error deleting change request:', error);
    return NextResponse.json(
      { error: 'Failed to delete change request' },
      { status: 500 }
    );
  }
}
