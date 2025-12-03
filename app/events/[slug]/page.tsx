import BookEvent from '@/components/BookEvent'
import Image from 'next/image'
import { notFound } from 'next/navigation'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

const EventDetailItem = ({
  icon,
  alt,
  label
}: {
  icon: string
  alt: string
  label: string
}) => {
  return (
    <div className="flex-row-gap-2 items-center">
      <Image src={icon} alt={alt} width={17} height={17} />
      <p>{label}</p>
    </div>
  )
}

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => {
  return (
    <div className="agenda">
      <h2>Agenda</h2>
      <div className="flex-col-gap-2">
        {agendaItems.map(item => (
          <p key={item}>{item}</p>
        ))}
      </div>
    </div>
  )
}

const EventTags = ({ tags }: { tags: string[] }) => {
  return (
    <div className="flex flex-row gap-2 flex-wrap">
      {tags.map(tag => (
        <div key={tag} className="pill">
          {tag}
        </div>
      ))}
    </div>
  )
}

const EventDetailsPage = async ({
  params
}: {
  params: Promise<{ slug: string }>
}) => {
  const { slug } = await params
  const request = await fetch(`${BASE_URL}/api/events/${slug}`)
  const {
    event: {
      _id: eventId,
      description,
      image,
      title,
      location,
      date,
      time,
      mode,
      agenda,
      audience,
      overview,
      organizer,
      tags
    }
  } = await request.json()

  if (!description) return notFound()

  const bookings = 10

  return (
    <section id="event">
      <div className="header">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      <div className="details">
        <div className="content">
          <Image src={image} alt={`${title} banner`} width={800} height={800} />

          <section className="flex-col-gap-2">
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>

          <section className="flex-col-gap-2">
            <h2>Event Details</h2>

            <EventDetailItem
              icon="/icons/calendar.svg"
              alt="calendar"
              label={date}
            />

            <EventDetailItem icon="/icons/clock.svg" alt="time" label={time} />

            <EventDetailItem icon="/icons/pin.svg" alt="pin" label={location} />

            <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />

            <EventDetailItem
              icon="/icons/audience.svg"
              alt="audience"
              label={audience}
            />
          </section>

          <EventAgenda agendaItems={agenda} />

          <section className="flex-col-gap-2">
            <h2>About the Organizer</h2>
            <p>{organizer}</p>
          </section>

          <EventTags tags={tags} />
        </div>

        <aside className="booking">
          <div className="signup-card">
            <h2>Book Your Spot</h2>
            {bookings > 0 ? (
              <p className="text-sm">
                Join {bookings} people who have already booked their spot!
              </p>
            ) : (
              <p className="text-sm">Be first one to book your spot!</p>
            )}

            <BookEvent eventId={eventId} slug={slug} />
          </div>
        </aside>
      </div>
    </section>
  )
}

export default EventDetailsPage
