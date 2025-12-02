import { v2 as cloudinary } from 'cloudinary'
import { NextRequest, NextResponse } from 'next/server'

import { Event } from '@/database'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const formData = await request.formData()

    const event = Object.fromEntries(formData.entries())

    const file = formData.get('image') as File
    if (!file) {
      return NextResponse.json(
        { message: 'Image is required' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: 'image', folder: 'events' },
          (error, result) => {
            if (error) {
              reject(error)
            } else {
              resolve(result)
            }
          }
        )
        .end(buffer)
    })

    event.image = (uploadResult as { secure_url: string }).secure_url

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
