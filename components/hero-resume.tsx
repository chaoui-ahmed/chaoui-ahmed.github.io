"use client"

import { motion } from "framer-motion"
import { Montserrat } from "next/font/google"
import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Navigation } from "./navigation"
import { ContactBlock } from "./contact-block"
import { ProgrammingLanguages } from "./programming-languages"

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
})

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-12"
    >
      <h2 className="text-2xl font-bold mb-4 text-mint-600">{title}</h2>
      {children}
    </motion.div>
  )
}

function Education({ language }: { language: string }) {
  const educationData = {
    en: [
      {
        date: "Sep 2024 - Jun 2027",
        school: "Eurecom - Sophia-Antipolis, France",
        degree: "Engineering Degree",
        description: "Digital Science studies, courses taught 100% in English",
        slug: "eurecom",
      },
      {
        date: "Sep 2022 - Jun 2024",
        school: "Fabert - Metz, France",
        degree: "CPGE MPSI - PSI*",
        description:
          "Preparatory classes for engineering schools (Mathematics-Physics) then (Physics-Engineering Sciences)",
        slug: "fabert",
      },
      {
        date: "Sep 2019 - Jun 2022",
        school: "Mendes France - Épinal, France",
        degree: "Scientific Baccalaureate",
        description: "Specialization in Mathematics (+ advanced maths), Engineering Sciences, and Physics/Chemistry",
        slug: "mendes-france",
      },
    ],
    fr: [
      {
        date: "Sep 2024 - juin 2027",
        school: "Eurecom - Sophia-Antipolis, France",
        degree: "Diplôme d'ingénieur",
        description: "Études en informatique, cours dispensés à 100 % en anglais",
        slug: "eurecom",
      },
      {
        date: "Sep 2022 - juin 2024",
        school: "Fabert - Metz, France",
        degree: "CPGE MPSI - PSI*",
        description:
          "Classes préparatoires aux grandes écoles (Maths-physique) puis (Physique-sciences de l'ingénieur)",
        slug: "fabert",
      },
      {
        date: "Sep 2019 - juin 2022",
        school: "Mendes France - Épinal, France",
        degree: "Baccalauréat Scientifique",
        description: "Spécialité Mathématiques (+ maths expertes), sciences de l'ingénieur et Physique/Chimie",
        slug: "mendes-france",
      },
    ],
  }

  const data = educationData[language as keyof typeof educationData]

  return (
    <Section title={language === "en" ? "EDUCATION" : "FORMATION"}>
      {data.map((edu, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="mb-4 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-mint-600">{edu.date}</p>
              <Link href={`/education/${edu.slug}`} className="font-semibold text-mint-800 text-lg hover:underline">
                {edu.school}
              </Link>
              <p className="text-mint-700">{edu.degree}</p>
              <p className="text-mint-600">{edu.description}</p>
            </div>
            <Link href={`/education/${edu.slug}`} className="text-mint-600 hover:underline">
              {language === "en" ? "View Details" : "Voir les détails"}
            </Link>
          </div>
        </motion.div>
      ))}
    </Section>
  )
}

function Experience({ language }: { language: string }) {
  const experienceData = {
    en: [
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
    ],
    fr: [
      {
        date: "Sep 2024 - en cours",
        company: "La dream team des étudiants",
        position: "Prof",
        description:
          "Accompagnement personnalisé d'élèves de collège-Lycée pour améliorer leurs performances académiques",
      },
      {
        date: "Juin 2022 - Juillet 2023",
        company: "LA FABRIQUE À ENTREPRENDRE",
        position: "Animateur à La Fabrique à Entreprendre, Épinal - France",
        description:
          "Animer des programmes de sensibilisation à l'entrepreneuriat pour les jeunes, visant à promouvoir le développement économique et à fournir des ressources de soutien dans les quartiers économiquement défavorisés.",
      },
    ],
  }

  const data = experienceData[language as keyof typeof experienceData]

  return (
    <Section title={language === "en" ? "PROFESSIONAL EXPERIENCE" : "EXPÉRIENCE PROFESSIONNELLE"}>
      {data.map((exp, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="mb-4 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <p className="text-mint-600">{exp.date}</p>
          <p className="font-semibold text-mint-800 text-lg">{exp.company}</p>
          <p className="text-mint-700">{exp.position}</p>
          <p className="text-mint-600">{exp.description}</p>
        </motion.div>
      ))}
    </Section>
  )
}

function Languages({ language }: { language: string }) {
  const languages = [
    { name: language === "en" ? "French" : "Français", level: language === "en" ? "Native" : "Natif" },
    { name: language === "en" ? "Arabic" : "Arabe", level: language === "en" ? "Native" : "Natif" },
    { name: language === "en" ? "English" : "Anglais", level: "C1+ (2022)" },
    {
      name: language === "en" ? "Spanish" : "Espagnol",
      level: language === "en" ? "Conversational" : "Conversationnel",
    },
  ]

  return (
    <Section title={language === "en" ? "LANGUAGES" : "LANGUES"}>
      <div className="grid grid-cols-2 gap-4">
        {languages.map((lang, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
          >
            <p className="text-mint-800 font-semibold">{lang.name}</p>
            <p className="text-mint-600">{lang.level}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}

function Projects({ language }: { language: string }) {
  const projects = {
    en: [
      "Remote Gaming Othello with AI and Audio Controls (Raspberry Pi, Python, Deep Learning)",
      "Personal Journal Application (Python, PyQt6)",
      "Guidance system for visually impaired (Raspberry Pi, Matlab/Simulink)",
      "Coding a calculator in reverse Polish notation (C + Bash)",
    ],
    fr: [
      "Jeu d'Othello à distance avec IA et Contrôles Audio (Raspberry Pi, Python, Deep Learning)",
      "Application de Journal Personnel (Python, PyQt6)",
      "Système de guidage pour déficients visuels (Raspberry Pi, Matlab/Simulink)",
      "Coder une calculatrice en notation polonaise inversée (C + Bash)",
    ],
  }

  const data = projects[language as keyof typeof projects]

  return (
    <Section title={language === "en" ? "PROJECTS" : "PROJETS"}>
      <ul className="space-y-2">
        {data.map((project, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-lg p-3 shadow-sm text-mint-700 hover:shadow-md transition-shadow"
          >
            {project}
          </motion.li>
        ))}
      </ul>
    </Section>
  )
}

function AdditionalExperiences({ language }: { language: string }) {
  const experiences = {
    en: [
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
      {
        title: "Treasury Training",
        location: "La French Tech - Nice, France",
        responsibilities: [
          "Manage a company's cash flow.",
          "Optimize liquidity.",
          "Understand financial instruments and associated risks.",
        ],
      },
    ],
    fr: [
      {
        title: "Président du bureau des étudiants",
        location: "Eurecom - Sophia-Antipolis, France",
        responsibilities: [
          "Représenter le corps étudiant.",
          "Diriger le bureau des étudiants.",
          "Organiser des événements pour améliorer la vie étudiante.",
          "Collaborer avec l'administration de l'école pour répondre aux besoins des étudiants.",
          "Superviser le budget du bureau et en assurer une gestion optimale.",
        ],
      },
      {
        title: "Membre de LA JUNIOR ENTREPRISE",
        location: "Eurecom - Sophia-Antipolis, France",
        responsibilities: [
          "Gérer les finances de la Junior-Entreprise.",
          "Travailler avec le conseil d'administration et les chefs de projet.",
        ],
      },
      {
        title: "Formation trésorerie",
        location: "La French Tech - Nice, France",
        responsibilities: [
          "Gérer la trésorerie d'une entreprise.",
          "Optimiser la liquidité.",
          "Comprendre les instruments financiers ainsi que les risques associés.",
        ],
      },
    ],
  }

  const data = experiences[language as keyof typeof experiences]

  return (
    <Section title={language === "en" ? "ADDITIONAL EXPERIENCES" : "EXPÉRIENCES SUPPLÉMENTAIRES"}>
      {data.map((exp, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="mb-4 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <p className="font-semibold text-mint-800 text-lg">{exp.title}</p>
          <p className="text-mint-700 mb-2">{exp.location}</p>
          <ul className="list-disc list-inside text-mint-600">
            {exp.responsibilities.map((resp, idx) => (
              <li key={idx} className="mb-1">
                {resp}
              </li>
            ))}
          </ul>
        </motion.div>
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
  const [language, setLanguage] = useState<string>("fr") // Set default language to French

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
    <div
      className={`relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-mint-50 ${montserrat.variable} font-sans pt-16`}
    >
      <Navigation language={language} setLanguage={setLanguage} />

      <div className="relative z-10 container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <motion.div custom={1} variants={fadeUpVariants} initial="hidden" animate="visible">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 md:mb-8 tracking-tight text-center">
              <span className="text-mint-800 block mb-2 md:mb-4">{title1}</span>
              <span className="text-mint-600 block leading-tight">{title2.trim()}</span>
            </h1>
          </motion.div>

          <motion.div custom={2} variants={fadeUpVariants} initial="hidden" animate="visible">
            <p className="text-base sm:text-lg md:text-xl text-mint-600 mb-8 leading-relaxed font-light tracking-wide max-w-xl mx-auto px-4 text-center">
              {language === "en" ? "Engineering Student" : "Étudiant en ingénierie"}
            </p>
          </motion.div>

          <ContactBlock language={language} />

          <motion.div custom={4} variants={fadeUpVariants} initial="hidden" animate="visible">
            <div className="grid grid-cols-1 gap-12">
              <div id="education">
                <Education language={language} />
              </div>
              <div id="experience">
                <Experience language={language} />
              </div>
              <div id="languages">
                <Languages language={language} />
              </div>
              <div id="programming-languages">
                <ProgrammingLanguages language={language} />
              </div>
              <div id="projects">
                <Projects language={language} />
              </div>
              <AdditionalExperiences language={language} />
            </div>
          </motion.div>
        </div>
      </div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-4 left-0 right-0 text-center text-mint-600"
      >
        © 2025 Ahmed. {language === "en" ? "All rights reserved." : "Tous droits réservés."}
      </motion.footer>
    </div>
  )
}
