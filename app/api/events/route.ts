import { Event } from '@/database'
import { connectToDatabase } from '@/lib/mongodb'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const formData = await request.formData()

    const event = Object.fromEntries(formData.entries())

    const createdEvent = await Event.create(event)

    return NextResponse.json(
      { message: 'Event created successfully', event: createdEvent },
      { status: 201 }
    )
  } catch (e) {
    if (e instanceof Error && e.name === 'ValidationError') {
      return NextResponse.json(
        { message: 'Invalid form data', error: e.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      {
        message: 'Failed to create event',
        error: e instanceof Error ? e.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
