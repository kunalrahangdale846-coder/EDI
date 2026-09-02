import React from "react";
import { useNavigate, useParams } from "react-router-dom";

const hackathons = [
  {
    id: "1",
    title: "AI Innovation Hackathon",
    description:
      "Build innovative solutions using artificial intelligence and emerging technologies.",
    date: "20 Aug - 25 Aug 2026",
    participants: 245,
    prize: "₹50,000",
    status: "Upcoming",
    organizer: "DevCollab Pro",
    teamSize: "2 - 4 Members",
    registrationDeadline: "18 Aug 2026",
    technologies: ["AI", "Machine Learning", "Python", "Web"],
    problemStatement:
      "Develop an innovative AI-powered solution that solves a real-world problem and creates measurable impact.",
  },
  {
    id: "2",
    title: "Web Development Challenge",
    description:
      "Create modern and impactful web applications that solve real-world problems.",
    date: "01 Sep - 05 Sep 2026",
    participants: 180,
    prize: "₹75,000",
    status: "Upcoming",
    organizer: "DevCollab Pro",
    teamSize: "1 - 4 Members",
    registrationDeadline: "29 Aug 2026",
    technologies: ["React", "JavaScript", "Node.js", "CSS"],
    problemStatement:
      "Build a responsive and user-friendly web application that addresses a practical problem.",
  },
  {
    id: "3",
    title: "Smart India Hackathon",
    description:
      "Solve real-world problems through technology, innovation and collaboration.",
    date: "10 Sep - 15 Sep 2026",
    participants: 320,
    prize: "₹1,00,000",
    status: "Upcoming",
    organizer: "DevCollab Pro",
    teamSize: "3 - 6 Members",
    registrationDeadline: "08 Sep 2026",
    technologies: ["IoT", "AI", "Cloud", "Web"],
    problemStatement:
      "Create a technology-based solution for a real-world challenge faced by communities and organizations.",
  },
  {
    id: "4",
    title: "Cyber Security Hackathon",
    description:
      "Build innovative solutions to protect applications, systems and users.",
    date: "18 Sep - 22 Sep 2026",
    participants: 150,
    prize: "₹60,000",
    status: "Live",
    organizer: "DevCollab Pro",
    teamSize: "2 - 4 Members",
    registrationDeadline: "17 Sep 2026",
    technologies: ["Cyber Security", "Networking", "Python"],
    problemStatement:
      "Develop a solution that improves the security, privacy and resilience of digital systems.",
  },
  {
    id: "5",
    title: "Green Tech Challenge",
    description:
      "Develop technology-driven solutions for a sustainable future.",
    date: "25 Jul - 30 Jul 2026",
    participants: 210,
    prize: "₹40,000",
    status: "Completed",
    organizer: "DevCollab Pro",
    teamSize: "2 - 5 Members",
    registrationDeadline: "23 Jul 2026",
    technologies: ["IoT", "Green Tech", "AI"],
    problemStatement:
      "Create a technology-driven solution that contributes to environmental sustainability.",
  },
];

function HackathonDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const hackathon = hackathons.find(
    (item) => item.id === id
  );

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-white px-6 py-16 text-black">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold">
            Hackathon Not Found
          </h1>

          <p className="mt-3 text-gray-500">
            The hackathon you are looking for does not exist.
          </p>

          <button
            onClick={() => navigate("/hackathons")}
            className="mt-6 rounded-lg bg-black px-6 py-3 text-sm font-medium text-white"
          >
            Back to Hackathons
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">

      {/* Hero */}
      <section className="border-b border-black/10">
        <div className="mx-auto max-w-6xl px-6 py-12 md:px-10">

          <button
            onClick={() => navigate("/hackathons")}
            className="mb-8 text-sm font-medium underline underline-offset-4"
          >
            ← Back to Hackathons
          </button>

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

            <div>
              <span className="inline-block rounded-full border border-black px-3 py-1 text-xs font-medium">
                {hackathon.status}
              </span>

              <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">
                {hackathon.title}
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
                {hackathon.description}
              </p>

              <p className="mt-5 text-sm text-gray-500">
                Organized by{" "}
                <span className="font-medium text-black">
                  {hackathon.organizer}
                </span>
              </p>
            </div>

            <button
              onClick={() =>
                navigate(`/hackathons/${hackathon.id}/register`)
              }
              className="rounded-lg bg-black px-8 py-3 text-sm font-medium text-white"
            >
              Register Now
            </button>

          </div>
        </div>
      </section>

      {/* Quick Information */}
      <section>
        <div className="mx-auto grid max-w-6xl gap-4 px-6 py-8 sm:grid-cols-2 lg:grid-cols-4 md:px-10">

          <div className="rounded-lg border border-black/10 p-5">
            <p className="text-sm text-gray-500">Date</p>
            <p className="mt-2 font-semibold">{hackathon.date}</p>
          </div>

          <div className="rounded-lg border border-black/10 p-5">
            <p className="text-sm text-gray-500">Participants</p>
            <p className="mt-2 font-semibold">
              {hackathon.participants}
            </p>
          </div>

          <div className="rounded-lg border border-black/10 p-5">
            <p className="text-sm text-gray-500">Prize Pool</p>
            <p className="mt-2 font-semibold">
              {hackathon.prize}
            </p>
          </div>

          <div className="rounded-lg border border-black/10 p-5">
            <p className="text-sm text-gray-500">Team Size</p>
            <p className="mt-2 font-semibold">
              {hackathon.teamSize}
            </p>
          </div>

        </div>
      </section>

      {/* Main Content */}
      <section>
        <div className="mx-auto grid max-w-6xl gap-10 px-6 pb-16 md:grid-cols-3 md:px-10">

          {/* Left */}
          <div className="space-y-10 md:col-span-2">

            {/* About */}
            <div>
              <h2 className="text-2xl font-semibold">
                About the Hackathon
              </h2>

              <p className="mt-4 leading-7 text-gray-600">
                {hackathon.description}
              </p>
            </div>

            {/* Problem Statement */}
            <div>
              <h2 className="text-2xl font-semibold">
                Problem Statement
              </h2>

              <p className="mt-4 leading-7 text-gray-600">
                {hackathon.problemStatement}
              </p>
            </div>

            {/* Timeline */}
            <div>
              <h2 className="text-2xl font-semibold">
                Timeline
              </h2>

              <div className="mt-5 space-y-4">

                <div className="border-l-2 border-black pl-5">
                  <p className="text-sm text-gray-500">
                    Registration
                  </p>

                  <p className="mt-1 font-medium">
                    Until {hackathon.registrationDeadline}
                  </p>
                </div>

                <div className="border-l-2 border-black pl-5">
                  <p className="text-sm text-gray-500">
                    Hackathon
                  </p>

                  <p className="mt-1 font-medium">
                    {hackathon.date}
                  </p>
                </div>

              </div>
            </div>

            {/* Evaluation */}
            <div>
              <h2 className="text-2xl font-semibold">
                Evaluation Criteria
              </h2>

              <div className="mt-5 space-y-3">

                <div className="flex justify-between border-b border-black/10 py-3">
                  <span>Innovation</span>
                  <span className="font-medium">30%</span>
                </div>

                <div className="flex justify-between border-b border-black/10 py-3">
                  <span>Technical Implementation</span>
                  <span className="font-medium">30%</span>
                </div>

                <div className="flex justify-between border-b border-black/10 py-3">
                  <span>Impact</span>
                  <span className="font-medium">25%</span>
                </div>

                <div className="flex justify-between border-b border-black/10 py-3">
                  <span>Presentation</span>
                  <span className="font-medium">15%</span>
                </div>

              </div>
            </div>

          </div>

          {/* Right */}
          <aside>

            <div className="sticky top-6 rounded-xl border border-black/15 p-6">

              <h3 className="text-lg font-semibold">
                Technologies
              </h3>

              <div className="mt-4 flex flex-wrap gap-2">

                {hackathon.technologies.map((technology) => (

                  <span
                    key={technology}
                    className="rounded-full border border-black/20 px-3 py-1.5 text-xs"
                  >
                    {technology}
                  </span>

                ))}

              </div>

              <div className="mt-8 border-t border-black/10 pt-6">

                <p className="text-sm text-gray-500">
                  Registration Deadline
                </p>

                <p className="mt-2 font-semibold">
                  {hackathon.registrationDeadline}
                </p>

              </div>

              <button
                onClick={() =>
                  navigate(`/hackathons/${hackathon.id}/register`)
                }
                className="mt-6 w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white"
              >
                Register Now
              </button>

            </div>

          </aside>

        </div>
      </section>

    </div>
  );
}

export default HackathonDetails;