const EventDetailsPage = async ({
  params
}: {
  params: Promise<{ slug: string }>
}) => {
  const { slug } = await params

  return <section id="event">EventDetailsPage - {slug}</section>
}

export default EventDetailsPage
