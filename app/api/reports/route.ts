import { NextRequest, NextResponse } from 'next/server';
import { getAllReports, createReport } from '@/lib/db';

export async function GET() {
  try {
    const reports = await getAllReports();
    return NextResponse.json(reports);
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newReport = await createReport(body);
    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    console.error('Failed to create report:', error);
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    );
  }
}
