import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const hackathons = [
  {
    id: 1,
    title: "AI Innovation Hackathon",
    description:
      "Build innovative solutions using artificial intelligence and emerging technologies.",
    date: "20 Aug - 25 Aug 2026",
    participants: 245,
    prize: "₹50,000",
    status: "Upcoming",
  },
  {
    id: 2,
    title: "Web Development Challenge",
    description:
      "Create modern and impactful web applications that solve real-world problems.",
    date: "01 Sep - 05 Sep 2026",
    participants: 180,
    prize: "₹75,000",
    status: "Upcoming",
  },
  {
    id: 3,
    title: "Smart India Hackathon",
    description:
      "Solve real-world problems through technology, innovation and collaboration.",
    date: "10 Sep - 15 Sep 2026",
    participants: 320,
    prize: "₹1,00,000",
    status: "Upcoming",
  },
  {
    id: 4,
    title: "Cyber Security Hackathon",
    description:
      "Build innovative solutions to protect applications, systems and users.",
    date: "18 Sep - 22 Sep 2026",
    participants: 150,
    prize: "₹60,000",
    status: "Live",
  },
  {
    id: 5,
    title: "Green Tech Challenge",
    description:
      "Develop technology-driven solutions for a sustainable future.",
    date: "25 Jul - 30 Jul 2026",
    participants: 210,
    prize: "₹40,000",
    status: "Completed",
  },
];

function HackathonHome() {
  // Search text
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // Selected filter
  const [filter, setFilter] = useState("All");

  // Filter hackathons
  const filteredHackathons = hackathons.filter((hackathon) => {
    const matchesSearch =
      hackathon.title.toLowerCase().includes(search.toLowerCase()) ||
      hackathon.description.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === "All" || hackathon.status === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <section className="border-b border-black/10">
        <div className="mx-auto max-w-7xl px-6 py-14 md:px-10">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
            DevCollab Pro
          </p>

          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Hackathons
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600 md:text-lg">
            Discover, build and participate in hackathons that turn ideas into
            real-world solutions.
          </p>
        </div>
      </section>

      {/* Search and Filter */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
          <div className="flex flex-col gap-4 md:flex-row">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search hackathons..."
                className="w-full rounded-lg border border-black/20 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
              />
            </div>

            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border border-black/20 bg-white px-4 py-3 text-sm outline-none focus:border-black"
            >
              <option value="All">All Hackathons</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Live">Live</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </section>

      {/* Hackathon Section */}
      <section>
        <div className="mx-auto max-w-7xl px-6 pb-16 md:px-10">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                {filter === "All" ? "All Hackathons" : `${filter} Hackathons`}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Find your next challenge and start building.
              </p>
            </div>

            <span className="hidden text-sm text-gray-500 md:block">
              {filteredHackathons.length} hackathons
            </span>
          </div>

          {/* Cards */}
          {filteredHackathons.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredHackathons.map((hackathon) => (
                <article
                  key={hackathon.id}
                  className="flex flex-col rounded-xl border border-black/15 bg-white p-6 transition hover:border-black"
                >
                  {/* Status */}
                  <div className="mb-6 flex items-center justify-between">
                    <span className="rounded-full border border-black px-3 py-1 text-xs font-medium">
                      {hackathon.status}
                    </span>

                    <span className="text-xs text-gray-500">
                      #{String(hackathon.id).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold tracking-tight">
                    {hackathon.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-3 flex-1 text-sm leading-6 text-gray-600">
                    {hackathon.description}
                  </p>

                  {/* Information */}
                  <div className="mt-6 space-y-3 border-t border-black/10 pt-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Date</span>

                      <span className="font-medium">{hackathon.date}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Participants</span>

                      <span className="font-medium">
                        {hackathon.participants}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Prize Pool</span>

                      <span className="font-semibold">{hackathon.prize}</span>
                    </div>
                  </div>

                  {/* Button */}
                  <button
                    onClick={() => navigate(`/hackathons/${hackathon.id}`)}
                    className="mt-6 w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                  >
                    View Details
                  </button>
                </article>
              ))}
            </div>
          ) : (
            /* No Results */
            <div className="rounded-xl border border-black/10 py-16 text-center">
              <h3 className="text-lg font-semibold">No hackathons found</h3>

              <p className="mt-2 text-sm text-gray-500">
                Try changing your search or filter.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default HackathonHome;
