import { NextResponse } from 'next/server';
import { query, initDatabase } from '@/app/lib/db';
import { ChangeRequest } from '@/app/types/change-request';

// GET - List all change requests
export async function GET() {
  try {
    await initDatabase();
    const changeRequests = await query<ChangeRequest>(
      'SELECT * FROM change_requests ORDER BY created_at DESC'
    );
    return NextResponse.json(changeRequests);
  } catch (error) {
    console.error('Error fetching change requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch change requests' },
      { status: 500 }
    );
  }
}

// POST - Create a new change request
export async function POST(request: Request) {
  try {
    await initDatabase();
    const body = await request.json();
    const { title, description, priority = 'medium' } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const result = await query<ChangeRequest>(
      `INSERT INTO change_requests (title, description, priority)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, description, priority]
    );

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating change request:', error);
    return NextResponse.json(
      { error: 'Failed to create change request' },
      { status: 500 }
    );
  }
}
