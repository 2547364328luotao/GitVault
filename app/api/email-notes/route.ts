import { NextRequest, NextResponse } from 'next/server';
import { getAllEmailNotes, createEmailNote } from '@/lib/db';

export async function GET() {
  try {
    const notes = await getAllEmailNotes();
    return NextResponse.json(notes);
  } catch (error) {
    console.error('Failed to fetch email notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email notes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newNote = await createEmailNote(body);
    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    console.error('Failed to create email note:', error);
    return NextResponse.json(
      { error: 'Failed to create email note' },
      { status: 500 }
    );
  }
}
