import { format, parseISO } from 'date-fns'

interface Event {
  date: string
  title: string
  text: string
  news_url: string
}

export function Events({ props: events }: { props: Event[] }) {
  return (
    <div className="-mt-2 flex w-full flex-col gap-2 py-4">
      {events.map(event => (
        <a target="_blank" href={`${event?.news_url}`}>
          <div
            key={event.date}
            className="flex shrink-0 flex-col gap-1 rounded-lg bg-zinc-800 p-4"
          >
            <div className="text-sm text-zinc-400">
              {event.date}
            </div>
            <div className="text-base font-bold text-zinc-200">
              {event.title}
            </div>
            <div className="text-zinc-500">
              {event.text.slice(0, 70)}...
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}
