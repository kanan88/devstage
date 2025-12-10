'use server'

import { Event } from '@/database'
import { connectToDatabase } from '@/lib/mongodb'

export const getSimilarEventsBySlug = async (slug: string) => {
  try {
    await connectToDatabase()

    const event = await Event.findOne({ slug })

    const tags = event?.tags ?? []
    if (!event || tags.length === 0) return []

    return await Event.find({
      _id: { $ne: event?._id },
      tags: { $in: tags }
    }).lean()
  } catch {
    return []
  }
}
