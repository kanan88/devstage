import { NextRequest, NextResponse } from 'next/server'

import { Event, type EventAttributes } from '@/database'
import { connectToDatabase } from '@/lib/mongodb'

type RouteParams = {
  params:
    | {
        slug?: string
      }
    | Promise<{
        slug?: string
      }>
}

const SLUG_PATTERN = /^[a-z0-9-]+$/

/**
 * Retrieves a single event by slug with guard rails for invalid input.
 */
export async function GET(_: NextRequest, context: RouteParams) {
  const params = await context.params
  const rawSlug = params?.slug?.trim()

  if (!rawSlug) {
    return NextResponse.json(
      { message: 'Event slug is required' },
      { status: 400 }
    )
  }

  const normalizedSlug = rawSlug.toLowerCase()

  if (!SLUG_PATTERN.test(normalizedSlug)) {
    return NextResponse.json(
      {
        message:
          'Event slug must contain lowercase letters, numbers, or hyphens only'
      },
      { status: 400 }
    )
  }

  try {
    await connectToDatabase()

    const event = await Event.findOne({
      slug: normalizedSlug
    }).lean<EventAttributes>()

    if (!event) {
      return NextResponse.json(
        { message: `Event with slug "${normalizedSlug}" not found` },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: 'Event fetched successfully', event },
      { status: 200 }
    )
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : 'Unexpected error occurred'

    return NextResponse.json(
      { message: 'Failed to fetch event', error: detail },
      { status: 500 }
    )
  }
}
