import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const hackathons = {
  1: {
    title: "AI Innovation Hackathon",
    date: "20 Aug - 25 Aug 2026",
    teamSize: "2 - 4 Members",
  },
  2: {
    title: "Web Development Challenge",
    date: "01 Sep - 05 Sep 2026",
    teamSize: "1 - 4 Members",
  },
  3: {
    title: "Smart India Hackathon",
    date: "10 Sep - 15 Sep 2026",
    teamSize: "3 - 6 Members",
  },
  4: {
    title: "Cyber Security Hackathon",
    date: "18 Sep - 22 Sep 2026",
    teamSize: "2 - 4 Members",
  },
  5: {
    title: "Green Tech Challenge",
    date: "25 Jul - 30 Jul 2026",
    teamSize: "2 - 5 Members",
  },
};

function HackathonRegister() {
  const { id } = useParams();
  const navigate = useNavigate();

  const hackathon = hackathons[id];

  const [formData, setFormData] = useState({
    teamName: "",
    leaderName: "",
    email: "",
    college: "",
    teamSize: "1",
    technologies: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setSubmitted(true);
  };

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-white px-6 py-16 text-black">
        <div className="mx-auto max-w-3xl text-center">

          <h1 className="text-3xl font-bold">
            Hackathon Not Found
          </h1>

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

  if (submitted) {
    return (
      <div className="min-h-screen bg-white px-6 py-16 text-black">

        <div className="mx-auto max-w-2xl text-center">

          <div className="rounded-xl border border-black/15 p-10">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-black text-xl text-white">
              ✓
            </div>

            <h1 className="mt-6 text-3xl font-bold">
              Registration Successful
            </h1>

            <p className="mt-4 leading-7 text-gray-600">
              Your team has been registered for{" "}
              <span className="font-medium text-black">
                {hackathon.title}
              </span>
              .
            </p>

            <div className="mt-8 border-y border-black/10 py-5 text-left">

              <div className="flex justify-between py-2 text-sm">
                <span className="text-gray-500">
                  Team Name
                </span>

                <span className="font-medium">
                  {formData.teamName}
                </span>
              </div>

              <div className="flex justify-between py-2 text-sm">
                <span className="text-gray-500">
                  Team Leader
                </span>

                <span className="font-medium">
                  {formData.leaderName}
                </span>
              </div>

              <div className="flex justify-between py-2 text-sm">
                <span className="text-gray-500">
                  Hackathon
                </span>

                <span className="font-medium">
                  {hackathon.title}
                </span>
              </div>

            </div>

            <button
              onClick={() => navigate("/hackathons")}
              className="mt-8 rounded-lg bg-black px-6 py-3 text-sm font-medium text-white"
            >
              Browse More Hackathons
            </button>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">

      {/* Header */}
      <section className="border-b border-black/10">

        <div className="mx-auto max-w-4xl px-6 py-10 md:px-10">

          <button
            onClick={() => navigate(`/hackathons/${id}`)}
            className="mb-7 text-sm font-medium underline underline-offset-4"
          >
            ← Back to Hackathon
          </button>

          <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
            Registration
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            {hackathon.title}
          </h1>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
            <span>{hackathon.date}</span>
            <span>Team Size: {hackathon.teamSize}</span>
          </div>

        </div>

      </section>

      {/* Form */}
      <section>

        <div className="mx-auto max-w-4xl px-6 py-10 md:px-10">

          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-black/15 p-6 md:p-8"
          >

            <div className="mb-8">

              <h2 className="text-xl font-semibold">
                Team Information
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Enter the details of your team to register.
              </p>

            </div>

            {/* Team Name */}
            <div className="mb-6">

              <label className="mb-2 block text-sm font-medium">
                Team Name
              </label>

              <input
                type="text"
                name="teamName"
                value={formData.teamName}
                onChange={handleChange}
                placeholder="Enter team name"
                required
                className="w-full rounded-lg border border-black/20 px-4 py-3 text-sm outline-none focus:border-black"
              />

            </div>

            {/* Leader + Email */}
            <div className="grid gap-6 md:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Team Leader
                </label>

                <input
                  type="text"
                  name="leaderName"
                  value={formData.leaderName}
                  onChange={handleChange}
                  placeholder="Enter leader name"
                  required
                  className="w-full rounded-lg border border-black/20 px-4 py-3 text-sm outline-none focus:border-black"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                  className="w-full rounded-lg border border-black/20 px-4 py-3 text-sm outline-none focus:border-black"
                />

              </div>

            </div>

            {/* College */}
            <div className="mt-6">

              <label className="mb-2 block text-sm font-medium">
                College / University
              </label>

              <input
                type="text"
                name="college"
                value={formData.college}
                onChange={handleChange}
                placeholder="Enter your college or university"
                required
                className="w-full rounded-lg border border-black/20 px-4 py-3 text-sm outline-none focus:border-black"
              />

            </div>

            {/* Team Size */}
            <div className="mt-6">

              <label className="mb-2 block text-sm font-medium">
                Number of Team Members
              </label>

              <select
                name="teamSize"
                value={formData.teamSize}
                onChange={handleChange}
                className="w-full rounded-lg border border-black/20 bg-white px-4 py-3 text-sm outline-none focus:border-black"
              >
                <option value="1">1 Member</option>
                <option value="2">2 Members</option>
                <option value="3">3 Members</option>
                <option value="4">4 Members</option>
                <option value="5">5 Members</option>
                <option value="6">6 Members</option>
              </select>

            </div>

            {/* Technologies */}
            <div className="mt-6">

              <label className="mb-2 block text-sm font-medium">
                Technologies / Skills
              </label>

              <textarea
                name="technologies"
                value={formData.technologies}
                onChange={handleChange}
                placeholder="Example: React, Node.js, Python, AI..."
                rows="4"
                className="w-full resize-none rounded-lg border border-black/20 px-4 py-3 text-sm outline-none focus:border-black"
              />

            </div>

            {/* Submit */}
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() => navigate(`/hackathons/${id}`)}
                className="rounded-lg border border-black/20 px-6 py-3 text-sm font-medium"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white"
              >
                Complete Registration
              </button>

            </div>

          </form>

        </div>

      </section>

    </div>
  );
}

export default HackathonRegister;