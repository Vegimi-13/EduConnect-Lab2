import type { ReactNode } from "react";
import { BookOpen, GraduationCap, MessageSquareText, Users } from "lucide-react";

import heroImage from "../../../assets/hero.png";

type AuthLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

const highlights = [
  {
    icon: BookOpen,
    label: "Course spaces",
  },
  {
    icon: Users,
    label: "Study circles",
  },
  {
    icon: MessageSquareText,
    label: "Academic posts",
  },
];

export function AuthLayout({
  eyebrow,
  title,
  description,
  children,
}: AuthLayoutProps) {
  return (
    <main className="h-dvh overflow-hidden bg-[#eef3f1] p-0 text-foreground">
      <section className="grid h-full overflow-hidden bg-background lg:grid-cols-[1.02fr_0.98fr]">
        <div className="flex h-full flex-col overflow-hidden bg-white px-6 py-7 sm:px-10 lg:px-16">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#0b4f53] text-white shadow-sm">
              <GraduationCap className="size-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-semibold tracking-normal text-[#102a2c]">
              EduConnect
            </span>
          </div>

          <div className="flex flex-1 items-center">
            <div className="w-full max-w-[25.5rem] py-12">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#0b6d70]">
                {eyebrow}
              </p>
              <h1 className="text-3xl font-semibold leading-tight text-[#111827] sm:text-4xl">
                {title}
              </h1>
              <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                {description}
              </p>

              <div className="mt-8">{children}</div>
            </div>
          </div>
        </div>

        <aside className="relative hidden h-full overflow-hidden bg-[#073f43] text-white lg:block">
          <div className="absolute inset-0 bg-[linear-gradient(145deg,#073f43_0%,#0e5b5e_52%,#d8a44a_145%)]" />
          <div className="absolute inset-x-0 top-0 h-40 bg-white/5" />
          <div className="relative flex h-full flex-col justify-between px-12 py-14">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f2d38c]">
                Built for learning communities
              </p>
              <h2 className="mt-5 max-w-md text-4xl font-semibold leading-tight">
                Connect students, mentors, and ideas in one focused campus space.
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-white/78">
                Share course updates, follow classmates, join groups, and keep academic
                conversations moving without leaving the community.
              </p>
            </div>

            <div className="relative my-10 flex min-h-56 items-center justify-center">
              <div className="absolute h-48 w-48 rounded-full border border-white/15" />
              <div className="absolute h-72 w-72 rounded-full border border-white/10" />
              <img
                src={heroImage}
                alt=""
                className="relative z-10 h-56 w-56 object-contain drop-shadow-[0_28px_48px_rgba(0,0,0,0.35)]"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 border-t border-white/15 pt-6">
              {highlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.label} className="rounded-lg bg-white/8 p-3">
                    <Icon className="size-5 text-[#f2d38c]" aria-hidden="true" />
                    <p className="mt-3 text-sm font-medium text-white">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
