"use client";

import React from "react";
import { useForm, ValidationError } from "@formspree/react";
import { RiSendInsFill } from "react-icons/ri";

function ContactForm() {
  const [state, handleSubmit] = useForm("myzyjzge");
  if (state.succeeded) {
    return (
      <div className="min-h-screen bg-[#000000] px-6 py-16 text-[#f4f1ea] sm:px-10 lg:px-16">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
          <h1 className="text-xl font-semibold tracking-tight text-[#f4f1ea] sm:text-6xl lg:text-10xl">
            Let&apos;s Talk!
          </h1>
          <p className="max-w-2xl text-lg text-[#c9c3ba]">
            Submitted successfully! Expect to hear back soon!
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#000000] px-6 py-16 text-[#f4f1ea] sm:px-10 lg:px-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <h1 className="text-6xl font-semibold tracking-tight text-[#f4f1ea] sm:text-[8rem] lg:text-[10rem]">
          Let&apos;s Talk!
        </h1>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-8">
          <div className="grid gap-8">
            <label className="grid gap-2" htmlFor="name">
              <span className="text-sm italic text-[#b9b1a7]">
                e.g. Eric Lin
              </span>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="What's Your Name*"
                className="h-16 rounded-2xl border border-white bg-[#111111] px-5 text-lg text-[#f4f1ea] outline-none transition placeholder:text-[#8f867c] focus:border-white focus:ring-2 focus:ring-white/75"
              />
            </label>

            <label className="grid gap-2" htmlFor="email">
              <span className="text-sm italic text-[#b9b1a7]">
                e.g. your_email@gmail.com
              </span>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="What's Your Email*"
                className="h-16 rounded-2xl border border-white bg-[#111111] px-5 text-lg text-[#f4f1ea] outline-none transition placeholder:text-[#8f867c] focus:border-white focus:ring-2 focus:ring-white/75"
              />
              <ValidationError
                prefix="Email"
                field="email"
                errors={state.errors}
              />
            </label>

            <label className="grid gap-2" htmlFor="message">
              <span className="text-sm italic text-[#b9b1a7]">
                What&apos;s on your mind?
              </span>
              <textarea
                id="message"
                name="message"
                placeholder="It is my earnest inclination to inaugurate a discourse concerning the prospective bestowal of a domesticated specimen belonging to the Felis catus taxonomic classification unto your esteemed personage..."
                rows={10}
                className="min-h-72 rounded-2xl border border-white bg-[#111111] px-5 py-4 text-lg text-[#f4f1ea] outline-none transition placeholder:text-[#8f867c] focus:border-white focus:ring-2 focus:ring-white/75"
              />
              <ValidationError
                prefix="Message"
                field="message"
                errors={state.errors}
              />
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={state.submitting}
              className="flex h-28 w-28 items-center justify-center bg-[#181818] text-[4rem] font-semibold text-white transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-70 sm:h-32 sm:w-32"
            >
              <RiSendInsFill />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function App() {
  return <ContactForm />;
}

export default App;
