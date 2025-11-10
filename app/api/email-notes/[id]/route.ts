import { NextRequest, NextResponse } from 'next/server';
import { getEmailNoteById, updateEmailNote, deleteEmailNote } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const note = await getEmailNoteById(id);
    
    if (!note) {
      return NextResponse.json(
        { error: 'Email note not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(note);
  } catch (error) {
    console.error('Failed to fetch email note:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email note' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    
    const updatedNote = await updateEmailNote(id, body);
    
    if (!updatedNote) {
      return NextResponse.json(
        { error: 'Email note not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error('Failed to update email note:', error);
    return NextResponse.json(
      { error: 'Failed to update email note' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    
    const updatedNote = await updateEmailNote(id, body);
    
    if (!updatedNote) {
      return NextResponse.json(
        { error: 'Email note not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error('Failed to update email note:', error);
    return NextResponse.json(
      { error: 'Failed to update email note' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const success = await deleteEmailNote(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Email note not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete email note:', error);
    return NextResponse.json(
      { error: 'Failed to delete email note' },
      { status: 500 }
    );
  }
}
