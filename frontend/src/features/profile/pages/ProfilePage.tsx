import {
  BookOpen,
  Download,
  Edit3,
  ExternalLink,
  GraduationCap,
  Info,
  Landmark,
  Link2,
  MapPin,
  Plus,
  Share2,
  Sparkles,
  TerminalSquare,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const skills = [
  "TypeScript",
  "Python",
  "React",
  "Research",
  "Algorithms",
  "Machine Learning",
  "Golang",
];

const education = [
  {
    school: "University of Prishtina",
    program: "Bachelor of Computer Science",
    detail: "Faculty of Electrical and Computer Engineering",
    years: "2021 - Present",
    icon: Landmark,
  },
  {
    school: "Xhevdet Doda High School",
    program: "Science & Mathematics Track",
    detail: "Focused on Advanced Calculus and Physics",
    years: "2018 - 2021",
    icon: GraduationCap,
  },
];

const courses = [
  {
    code: "UP-CS101",
    name: "Introduction to Programming",
    status: "Completed",
    grade: "A+",
  },
  {
    code: "UP-CS304",
    name: "Operating Systems",
    status: "In Progress",
  },
  {
    code: "UP-MA202",
    name: "Discrete Mathematics",
    status: "Completed",
    grade: "A",
  },
  {
    code: "UP-CS205",
    name: "Data Structures & Algorithms",
    status: "Completed",
    grade: "A",
  },
];

const links = [
  {
    label: "Personal Portfolio",
    icon: ExternalLink,
  },
  {
    label: "GitHub Projects",
    icon: TerminalSquare,
  },
  {
    label: "Academic CV",
    icon: Download,
  },
];

function ProfileAvatar() {
  return (
    <div className="flex size-28 shrink-0 items-center justify-center rounded-md border-8 border-white bg-[linear-gradient(145deg,#d7e5e5,#4f6367)] text-3xl font-bold text-white shadow-lg">
      JS
    </div>
  );
}

function CoverVisual() {
  return (
    <div className="relative z-0 h-54 overflow-hidden rounded-t-md bg-[#0b5557]">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,50,52,0.96),rgba(14,115,116,0.76)),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.18))]" />
      <div className="absolute inset-y-0 left-10 w-40 border-x border-white/10" />
      <div className="absolute inset-y-0 left-28 w-px bg-white/12" />
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-white/8" />
      <div className="absolute right-10 top-0 h-full w-56 border-x border-white/15" />
      <div className="absolute right-28 top-0 h-full w-px bg-white/20" />
      <div className="absolute left-16 top-10 grid grid-cols-4 gap-2 opacity-35">
        {Array.from({ length: 28 }).map((_, index) => (
          <span key={index} className="h-8 w-5 rounded-sm bg-white/30" />
        ))}
      </div>
    </div>
  );
}

function ProfileHero() {
  return (
    <Card className="overflow-hidden border-[#b8c4c7] bg-white">
      <CoverVisual />
      <CardContent className="relative z-10 px-8 pb-7 pt-2">
        <div className="-mt-11 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <ProfileAvatar />
            <div className="pb-3">
              <h1 className="text-3xl font-bold text-[#061f22]">John Santos</h1>
              <p className="mt-1 max-w-xl text-lg font-medium text-[#111827]">
                Computer Science Student at University of Prishtina
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm text-[#4b5563]">
                <MapPin className="size-4" />
                Prishtina, Kosovo
              </p>
            </div>
          </div>

          <div className="flex gap-2 pb-3">
            <Button variant="outline" className="h-11 px-5">
              <Share2 className="size-4" />
              Share
            </Button>
            <Button className="h-11 bg-[#073f43] px-5 text-white hover:bg-[#062f33]">
              <Edit3 className="size-4" />
              Edit Profile
            </Button>
          </div>
        </div>

        <div className="mt-6 grid rounded-md border border-[#c8d1d7] bg-[#edf3fb] py-4 text-center sm:grid-cols-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em]">
              H-index
            </p>
            <p className="mt-1 text-lg font-bold text-[#061f22]">12</p>
          </div>
          <div className="border-t border-[#c8d1d7] pt-4 sm:border-l sm:border-t-0 sm:pt-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em]">
              Citations
            </p>
            <p className="mt-1 text-lg font-bold text-[#061f22]">482</p>
          </div>
          <div className="border-t border-[#c8d1d7] pt-4 sm:border-l sm:border-t-0 sm:pt-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em]">
              Papers
            </p>
            <p className="mt-1 text-lg font-bold text-[#061f22]">8</p>
          </div>
          <div className="border-t border-[#c8d1d7] pt-4 sm:border-l sm:border-t-0 sm:pt-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em]">
              Affiliation
            </p>
            <p className="mt-1 text-sm font-bold text-[#061f22]">
              UP-CS Faculty
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AboutCard() {
  return (
    <Card className="border-[#b8c4c7] bg-white">
      <CardHeader className="p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Info className="size-5" />
          About
        </h2>
      </CardHeader>
      <CardContent className="px-5 pb-6">
        <p className="text-sm leading-7 text-[#1f2937]">
          Passionate Computer Science student specializing in Distributed Systems
          and Artificial Intelligence. Currently focusing my research on optimizing
          blockchain consensus mechanisms for academic credential verification. I
          enjoy bridging the gap between theoretical algorithms and practical,
          scalable software solutions.
        </p>
      </CardContent>
    </Card>
  );
}

function EducationCard() {
  return (
    <Card className="border-[#b8c4c7] bg-white">
      <CardHeader className="p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <GraduationCap className="size-5" />
          Education
        </h2>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="divide-y divide-[#d6dde3]">
          {education.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.school} className="flex gap-4 py-5 first:pt-0">
                <div className="flex size-10 shrink-0 items-center justify-center rounded bg-[#dbe8fb]">
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold">{item.school}</h3>
                      <p className="mt-1 text-sm font-medium">{item.program}</p>
                    </div>
                    <span className="shrink-0 text-xs font-medium">
                      {item.years}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-medium tracking-[0.04em]">
                    {item.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function CoursesCard() {
  return (
    <Card className="border-[#b8c4c7] bg-white">
      <CardHeader className="p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <BookOpen className="size-5" />
          Courses
        </h2>
        <Button variant="ghost" size="sm">
          View Transcript
        </Button>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course) => (
            <div
              key={course.code}
              className="rounded-md border-l-4 border-[#0b5557] bg-[#edf3fb] p-4"
            >
              <p className="text-xs font-medium tracking-[0.06em]">
                {course.code}
              </p>
              <h3 className="mt-2 text-sm font-bold">{course.name}</h3>
              <p className="mt-3 text-xs font-semibold text-[#6b4a05]">
                {course.status}
                {course.grade ? ` - Grade: ${course.grade}` : ""}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SocialStatsCard() {
  return (
    <Card className="border-[#b8c4c7] bg-white">
      <CardContent className="grid grid-cols-2 p-6 text-center">
        <div>
          <p className="text-xl font-bold">1,240</p>
          <p className="text-xs font-semibold tracking-[0.08em]">Followers</p>
        </div>
        <div className="border-l border-[#c8d1d7]">
          <p className="text-xl font-bold">856</p>
          <p className="text-xs font-semibold tracking-[0.08em]">Following</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SkillsCard() {
  return (
    <Card className="border-[#b8c4c7] bg-white">
      <CardHeader className="p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Sparkles className="size-5" />
          Skills
        </h2>
        <Button
          size="icon-sm"
          className="bg-[#8a5a00] text-white hover:bg-[#714900]"
          aria-label="Add skill"
        >
          <Plus className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="px-5 pb-6">
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="rounded-md border border-[#b8c4c7] bg-[#dceaff] px-3 py-2 text-sm text-[#1f2937]"
            >
              {skill}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function LinksCard() {
  return (
    <Card className="border-[#b8c4c7] bg-white">
      <CardHeader className="p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Link2 className="size-5" />
          Links
        </h2>
      </CardHeader>
      <CardContent className="space-y-5 px-5 pb-6">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <button
              key={link.label}
              className="flex w-full items-center justify-between gap-4 text-left text-sm font-medium"
              type="button"
            >
              <span className="flex items-center gap-3">
                <Icon className="size-4" />
                {link.label}
              </span>
              <ExternalLink className="size-3 text-[#4b5563]" />
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

function CollaborativeCard() {
  return (
    <Card className="overflow-hidden border-[#b8c4c7] bg-white">
      <CardContent className="relative p-6">
        <div className="absolute -right-8 -top-8 size-28 rounded-full border-[12px] border-[#d9dde4]" />
        <div className="relative border-l-4 border-[#0b5557] pl-6">
          <h2 className="text-sm font-bold">Collaborative Space</h2>
          <p className="mt-2 max-w-[13rem] text-xs font-medium leading-5">
            Join the Advanced AI Ethics research group to collaborate on your next
            paper.
          </p>
          <Button className="mt-5 w-full bg-[#073f43] text-white hover:bg-[#062f33]">
            View Groups
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RightRail() {
  return (
    <div className="space-y-5">
      <SocialStatsCard />
      <SkillsCard />
      <LinksCard />
      <CollaborativeCard />
    </div>
  );
}

export function ProfilePage() {
  return (
    <AppShell activeItem="Profile" rightRail={<RightRail />}>
      <div className="mx-auto max-w-[56rem] space-y-5">
        <ProfileHero />
        <div className="grid gap-5 xl:hidden">
          <RightRail />
        </div>
        <AboutCard />
        <EducationCard />
        <CoursesCard />
      </div>
    </AppShell>
  );
}
