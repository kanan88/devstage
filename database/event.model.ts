import mongoose, {
  HydratedDocument,
  InferSchemaType,
  Model,
  Schema
} from 'mongoose'

type RequiredString = {
  type: StringConstructor
  required: true
  trim: true
  validate: {
    validator: (value: string) => boolean
    message: string
  }
}

const nonEmptyString = (field: string): RequiredString => ({
  type: String,
  required: true,
  trim: true,
  validate: {
    validator: (value: string) => value.trim().length > 0,
    message: `${field} cannot be empty`
  }
})

const EventSchema = new Schema(
  {
    title: nonEmptyString('Title'),
    slug: {
      type: String,
      unique: true,
      trim: true
    },
    description: nonEmptyString('Description'),
    overview: nonEmptyString('Overview'),
    image: nonEmptyString('Image'),
    venue: nonEmptyString('Venue'),
    location: nonEmptyString('Location'),
    date: nonEmptyString('Date'),
    time: nonEmptyString('Time'),
    mode: nonEmptyString('Mode'),
    audience: nonEmptyString('Audience'),
    agenda: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]) =>
          Array.isArray(value) &&
          value.length > 0 &&
          value.every(entry => entry.trim().length > 0),
        message: 'Agenda must contain at least one non-empty entry'
      }
    },
    organizer: nonEmptyString('Organizer'),
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]) =>
          Array.isArray(value) &&
          value.length > 0 &&
          value.every(entry => entry.trim().length > 0),
        message: 'Tags must contain at least one non-empty entry'
      }
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

export type EventAttributes = InferSchemaType<typeof EventSchema>
export type EventDocument = HydratedDocument<EventAttributes>

const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const toIsoDate = (value: string): string => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Invalid date format. Provide a valid date string.')
  }
  return parsed.toISOString()
}

const TIME_24H_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/
const TIME_12H_REGEX = /^(1[0-2]|0?[1-9]):([0-5]\d)\s?(AM|PM)$/i

const normalizeTime = (value: string): string => {
  const trimmed = value.trim()
  const match24 = trimmed.match(TIME_24H_REGEX)
  if (match24) {
    return `${match24[1]}:${match24[2]}`
  }

  const match12 = trimmed.match(TIME_12H_REGEX)
  if (match12) {
    let hours = Number(match12[1]) % 12
    if (match12[3].toUpperCase() === 'PM') {
      hours += 12
    }
    return `${hours.toString().padStart(2, '0')}:${match12[2]}`
  }

  throw new Error('Time must be in HH:mm (24h) or hh:mm AM/PM format.')
}

/**
 * Pre-save hook handles slug generation and temporal normalization.
 * Ensures slug stays in sync with title changes and date/time stay standardized.
 */
EventSchema.pre<EventDocument>('save', function preSave() {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title)
  }

  this.date = toIsoDate(this.date)
  this.time = normalizeTime(this.time)
})

EventSchema.index({ slug: 1 }, { unique: true })

export type EventModel = Model<EventAttributes>

export const Event =
  (mongoose.models.Event as EventModel) ||
  mongoose.model<EventAttributes>('Event', EventSchema)
