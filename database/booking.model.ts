import mongoose, {
  HydratedDocument,
  InferSchemaType,
  Model,
  Schema,
  Types
} from 'mongoose'
import { Event } from './event.model'

const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

const BookingSchema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      validate: {
        validator: (value: Types.ObjectId) => Types.ObjectId.isValid(value),
        message: 'eventId must be a valid ObjectId'
      }
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string) => emailRegex.test(value),
        message: 'Email must be valid'
      }
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

BookingSchema.index({ eventId: 1 })

export type Booking = InferSchemaType<typeof BookingSchema>
export type BookingDocument = HydratedDocument<Booking>
export type BookingModel = Model<Booking>

/**
 * Pre-save hook ensures referenced events exist before persisting a booking.
 */
BookingSchema.pre<BookingDocument>('save', async function preSave() {
  if (!this.isModified('eventId') && !this.isNew) {
    return
  }

  const eventExists = await Event.exists({ _id: this.eventId })
  if (!eventExists) {
    throw new Error('Cannot create a booking for a non-existent event.')
  }
})

export const Booking =
  (mongoose.models.Booking as BookingModel) ||
  mongoose.model<Booking>('Booking', BookingSchema)
