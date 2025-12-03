import EventCard from '@/components/EventCard'
import ExploreBtn from '@/components/ExploreBtn'
import { EventAttributes } from '@/database'
import { slugify } from '@/database/event.model'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

const HomePage = async () => {
  const response = await fetch(`${BASE_URL}/api/events`)
  const { events } = await response.json()

  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev Event <br />
        You Cannot Miss
      </h1>
      <p className="text-center mt-5">
        Hackathons, Workshops, Conferences, and More, All in One Place
      </p>

      <ExploreBtn />

      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>

        <ul className="events">
          {events &&
            events.length > 0 &&
            events.map((event: EventAttributes) => {
              const slug = slugify(event.title)

              return (
                <li key={slug} className="list-none">
                  <EventCard
                    title={event.title}
                    image={event.image}
                    slug={slug}
                    location={event.location}
                    date={event.date}
                    time={event.time}
                  />
                </li>
              )
            })}
        </ul>
      </div>
    </section>
  )
}

export default HomePage
