"use client"

import { motion } from "framer-motion"
import { Pacifico } from "next/font/google"
import Image from "next/image"
import { cn } from "@/lib/utils"
import type React from "react"

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
})

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: {
  className?: string
  delay?: number
  width?: number
  height?: number
  rotate?: number
  gradient?: string
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border-2 border-white/[0.15]",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]",
          )}
        />
      </motion.div>
    </motion.div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
      {children}
    </div>
  )
}

function Education() {
  const educationData = [
    {
      date: "Sep 2024 - Jun 2027",
      school: "Eurecom - Sophia-Antipolis, France",
      degree: "Engineering Degree",
      description: "Computer science studies, courses taught 100% in English",
    },
    {
      date: "Sep 2022 - Jun 2024",
      school: "Fabert - Metz, France",
      degree: "CPGE MPSI - PSI*",
      description:
        "Preparatory classes for engineering schools (Mathematics-Physics) then (Physics-Engineering Sciences)",
    },
    {
      date: "Sep 2019 - Jun 2022",
      school: "Mendes France - Épinal, France",
      degree: "Scientific Baccalaureate",
      description: "Specialization in Mathematics (+ advanced maths), Engineering Sciences, and Physics/Chemistry",
    },
  ]

  return (
    <Section title="EDUCATION">
      {educationData.map((edu, index) => (
        <div key={index} className="mb-4">
          <p className="text-white/80">{edu.date}</p>
          <p className="font-semibold text-white">{edu.school}</p>
          <p className="text-white/90">{edu.degree}</p>
          <p className="text-white/70">{edu.description}</p>
        </div>
      ))}
    </Section>
  )
}

function Experience() {
  const experienceData = [
    {
      date: "Sep 2024 - Present",
      company: "The Student Dream Team",
      position: "Tutor",
      description: "Personalized support for middle and high school students to improve their academic performance",
    },
    {
      date: "Jun 2022 - Jul 2023",
      company: "LA FABRIQUE À ENTREPRENDRE",
      position: "Facilitator at La Fabrique à Entreprendre, Épinal - France",
      description:
        "Facilitate entrepreneurship awareness programs for young people, aiming to promote economic development and provide support resources in economically disadvantaged neighborhoods.",
    },
  ]

  return (
    <Section title="PROFESSIONAL EXPERIENCE">
      {experienceData.map((exp, index) => (
        <div key={index} className="mb-4">
          <p className="text-white/80">{exp.date}</p>
          <p className="font-semibold text-white">{exp.company}</p>
          <p className="text-white/90">{exp.position}</p>
          <p className="text-white/70">{exp.description}</p>
        </div>
      ))}
    </Section>
  )
}

function Languages() {
  const languages = [
    { name: "French", level: "Native" },
    { name: "Arabic", level: "Native" },
    { name: "English", level: "C1+ (as of 2022)" },
    { name: "Spanish", level: "Conversational" },
  ]

  return (
    <Section title="LANGUAGES">
      {languages.map((lang, index) => (
        <p key={index} className="text-white/90">
          {lang.name}: <span className="text-white/70">{lang.level}</span>
        </p>
      ))}
    </Section>
  )
}

function ProgrammingLanguages() {
  const languages = ["Python", "SQL", "VBA Excel", "BASH", "C++"]

  return (
    <Section title="PROGRAMMING LANGUAGES">
      <div className="flex flex-wrap gap-2">
        {languages.map((lang, index) => (
          <span key={index} className="bg-white/10 text-white px-2 py-1 rounded">
            {lang}
          </span>
        ))}
      </div>
    </Section>
  )
}

function Projects() {
  const projects = [
    "Guidance system for visually impaired (Raspberry Pi, Matlab/Simulink)",
    "Coding a calculator in reverse Polish notation (C + Bash)",
    "Treasury training at La French Tech - Nice, France",
  ]

  return (
    <Section title="PROJECTS">
      <ul className="list-disc list-inside text-white/90">
        {projects.map((project, index) => (
          <li key={index} className="mb-2">
            {project}
          </li>
        ))}
      </ul>
    </Section>
  )
}

function AdditionalExperiences() {
  const experiences = [
    {
      title: "President of the Student Union",
      location: "Eurecom - Sophia-Antipolis, France",
      responsibilities: [
        "Represent the student body.",
        "Lead the student union.",
        "Organize events to improve student life.",
        "Collaborate with school administration to address student needs.",
        "Oversee the union's budget and ensure optimal management.",
      ],
    },
    {
      title: "Member of THE JUNIOR ENTERPRISE",
      location: "Eurecom - Sophia-Antipolis, France",
      responsibilities: [
        "Manage administrative and financial aspects of the Junior Enterprise.",
        "Oversee accounting and treasury.",
        "Collaborate with other board members and project managers.",
      ],
    },
  ]

  return (
    <Section title="ADDITIONAL EXPERIENCES">
      {experiences.map((exp, index) => (
        <div key={index} className="mb-4">
          <p className="font-semibold text-white">{exp.title}</p>
          <p className="text-white/90">{exp.location}</p>
          <ul className="list-disc list-inside text-white/70 mt-2">
            {exp.responsibilities.map((resp, idx) => (
              <li key={idx}>{resp}</li>
            ))}
          </ul>
        </div>
      ))}
    </Section>
  )
}

export default function HeroResume({
  title1 = "Ahmed",
  title2 = "Chaoui Kouraichi",
}: {
  title1?: string
  title2?: string
}) {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#030303]">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />

      <div className="absolute inset-0 overflow-hidden">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-indigo-500/[0.15]"
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
        />
        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-rose-500/[0.15]"
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
        />
        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-violet-500/[0.15]"
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
        />
        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          gradient="from-amber-500/[0.15]"
          className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
        />
        <ElegantShape
          delay={0.7}
          width={150}
          height={40}
          rotate={-25}
          gradient="from-cyan-500/[0.15]"
          className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8 md:mb-12"
          >
            <Image src="/placeholder.svg?height=20&width=20" alt="Eurecom" width={20} height={20} />
            <span className="text-white/60">Eurecom</span>
          </motion.div>

          <motion.div custom={1} variants={fadeUpVariants} initial="hidden" animate="visible">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 md:mb-8 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80 block mb-2 md:mb-4">
                {title1}
              </span>
              <span
                className={cn(
                  "bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300",
                  pacifico.className,
                  "block leading-tight",
                )}
              >
                {title2.trim()}
              </span>
            </h1>
          </motion.div>

          <motion.div custom={2} variants={fadeUpVariants} initial="hidden" animate="visible">
            <p className="text-base sm:text-lg md:text-xl text-white/40 mb-8 leading-relaxed font-light tracking-wide max-w-xl mx-auto px-4">
              Engineering Student
            </p>
          </motion.div>

          <motion.div custom={3} variants={fadeUpVariants} initial="hidden" animate="visible">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Education />
                <Experience />
                <Languages />
              </div>
              <div>
                <ProgrammingLanguages />
                <Projects />
                <AdditionalExperiences />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />
    </div>
  )
}

