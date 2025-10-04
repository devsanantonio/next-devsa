import Image from "next/image"
import Link from "next/link"

export const metadata = {
  title: "Python San Antonio - DEVSA",
  description: "Join Python San Antonio for our next meetup. Connect with Python developers in San Antonio.",
}

export default function PySanAntonioPage() {
  return (
    <main className="min-h-screen flex items-center justify-center py-20 lg:py-28">
      <div className="w-full max-w-5xl flex flex-col items-center gap-8 px-4">
        {/* Mobile Image */}
        <div className="block md:hidden w-full max-w-md">
          <div className="relative w-full aspect-[3/4] shadow-2xl rounded-lg overflow-hidden">
            <Image
              src="https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-10-python.png"
              alt="Python San Antonio Meetup - Mobile"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Desktop Image */}
        <div className="hidden md:block w-full">
          <div className="relative w-full aspect-[16/9] shadow-2xl rounded-lg overflow-hidden">
            <Image
              src="https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-9-python+(2).png"
              alt="Python San Antonio Meetup - Desktop"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* RSVP Button */}
        <Link
          href="https://www.meetup.com/alamo-python/events/311325578/"
          className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-black rounded-lg shadow-lg hover:bg-gray-900 hover:shadow-xl transition-all duration-200 active:scale-95"
          target="_blank"
          rel="noopener noreferrer"
        >
          RSVP Now
        </Link>
      </div>
    </main>
  )
}
