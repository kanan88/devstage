import { Event } from '@/database'
import { connectToDatabase } from '@/lib/mongodb'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const formData = await request.formData()

    let event

    try {
      event = Object.fromEntries(formData.entries())
    } catch (e) {
      return NextResponse.json(
        {
          message: 'Invalid JSON data format',
          error: e instanceof Error ? e.message : 'Unknown error'
        },
        { status: 400 }
      )
    }

    const createdEvent = await Event.create(event)

    return NextResponse.json(
      { message: 'Event created successfully', event: createdEvent },
      { status: 201 }
    )
  } catch (e) {
    return NextResponse.json(
      {
        message: 'Failed to create event',
        error: e instanceof Error ? e.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
