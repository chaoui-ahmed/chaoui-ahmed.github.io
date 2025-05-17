"use client"

import Link from "next/link"
import { Montserrat } from "next/font/google"
import { motion } from "framer-motion"
import { useState } from "react"
import Image from "next/image"

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
})

const subjects = [
  {
    name: "Mathematics",
    topics: [
      {
        name: "Analysis",
        subtopics: [
          "Sequences and series",
          "Functions of a real variable",
          "Integration",
          "Differential equations",
          "Functions of several variables",
        ],
      },
      {
        name: "Algebra",
        subtopics: ["Vector spaces", "Linear transformations and matrix theory", "Groups, rings, and fields"],
      },
      {
        name: "Probability and Statistics",
        subtopics: ["Probability spaces", "Discrete and continuous random variables", "Fundamental theorems"],
      },
      {
        name: "Geometry",
        subtopics: ["Affine and Euclidean geometry", "Parametric curves", "Geometric transformations"],
      },
    ],
  },
  {
    name: "Physics",
    topics: [
      {
        name: "Mechanics",
        subtopics: ["Kinematics and dynamics of a point particle", "Systems of point particles", "Solid mechanics"],
      },
      {
        name: "Electromagnetism",
        subtopics: ["Electrostatics", "Magnetostatics", "Induction and electromagnetism"],
      },
      {
        name: "Thermodynamics",
        subtopics: ["Fundamental principles", "Perfect gases and mixtures", "Phase changes and irreversible phenomena"],
      },
      {
        name: "Optics",
        subtopics: ["Geometric optics", "Wave optics"],
      },
    ],
  },
]

export default function FabertPage() {
  const [language, setLanguage] = useState<"en" | "fr">("en")

  const translations = {
    en: {
      title: "Fabert - Metz, France",
      subtitle: "CPGE MPSI - PSI*",
      description:
        "Preparatory classes for engineering schools (Mathematics-Physics) then (Physics-Engineering Sciences)",
      backToResume: "Back to Resume",
    },
    fr: {
      title: "Fabert - Metz, France",
      subtitle: "CPGE MPSI - PSI*",
      description:
        "Classes préparatoires aux grandes écoles (Mathématiques-Physique) puis (Physique-Sciences de l'Ingénieur)",
      backToResume: "Retour au CV",
    },
  }

  const t = translations[language]

  return (
    <div className={`min-h-screen bg-mint-50 text-mint-800 p-8 ${montserrat.variable} font-sans`}>
      <div className="flex justify-between items-center mb-8">
        <Link href="/" className="text-mint-600 hover:underline">
          &larr; {t.backToResume}
        </Link>
        <div className="flex space-x-2">
          <button
            onClick={() => setLanguage("en")}
            className={`p-2 rounded-full ${language === "en" ? "bg-mint-500" : "bg-white"}`}
          >
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Flag_of_the_United_Kingdom_%281-1%29.svg/1200px-Flag_of_the_United_Kingdom_%281-1%29.svg.png"
              alt="English"
              width={24}
              height={24}
            />
          </button>
          <button
            onClick={() => setLanguage("fr")}
            className={`p-2 rounded-full ${language === "fr" ? "bg-mint-500" : "bg-white"}`}
          >
            <Image
              src="https://cdn.countryflags.com/thumbs/france/flag-square-250.png"
              alt="Français"
              width={24}
              height={24}
            />
          </button>
        </div>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl font-bold mb-8 text-mint-800">{t.title}</h1>
        <h2 className="text-2xl font-semibold mb-4 text-mint-700">{t.subtitle}</h2>
        <p className="mb-8 text-mint-600">{t.description}</p>

        <div className="space-y-12">
          {subjects.map((subject, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <h3 className="text-2xl font-semibold mb-4 text-mint-800">{subject.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {subject.topics.map((topic, topicIndex) => (
                  <motion.div
                    key={topicIndex}
                    whileHover={{ y: -5 }}
                    className="bg-mint-50 rounded-lg p-4 shadow-md hover:shadow-lg transition-all"
                  >
                    <h4 className="text-xl font-semibold mb-2 text-mint-700">{topic.name}</h4>
                    <ul className="list-disc list-inside space-y-1 text-mint-600">
                      {topic.subtopics.map((subtopic, subtopicIndex) => (
                        <li key={subtopicIndex}>{subtopic}</li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
