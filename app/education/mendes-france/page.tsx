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
    name: "Mathematics (Specialization)",
    topics: [
      {
        name: "Analysis",
        subtopics: [
          "Numerical functions: continuity, differentiability, convexity",
          "Study of limits, asymptotic developments",
          "Numerical sequences: limits, monotonicity",
          "Integral calculus: primitives, integrals on a segment",
          "Differential equations",
        ],
      },
      {
        name: "Algebra and Geometry",
        subtopics: ["Orthogonality and distances in space", "Affine transformations and isometries"],
      },
      {
        name: "Probability and Statistics",
        subtopics: [
          "Discrete and continuous random variables",
          "Expectation, variance and standard deviation",
          "Common distributions (binomial, exponential, normal)",
          "Law of large numbers theorem",
        ],
      },
      {
        name: "Algorithms and Programming",
        subtopics: [
          "Manipulation of sequences and functions",
          "Simulation of random phenomena",
          "Numerical approximation",
        ],
      },
    ],
  },
  {
    name: "Physics-Chemistry (Specialization)",
    topics: [
      {
        name: "Mechanics",
        subtopics: [
          "Forces and interactions: fundamental principle of dynamics",
          "Energy and work: conservation of mechanical energy",
          "Mechanical oscillators: period, damping, resonance",
        ],
      },
      {
        name: "Waves and Optics",
        subtopics: [
          "Progressive and stationary waves",
          "Diffraction and interference",
          "Light spectra and applications (Doppler effect, spectroscopy)",
        ],
      },
      {
        name: "Electricity and Electromagnetism",
        subtopics: [
          "Electrical circuits (RLC, transients, RC filters)",
          "Induction and Lenz-Faraday law",
          "Electromagnetic waves (light, radio, microwaves)",
        ],
      },
      {
        name: "Thermodynamics and Physical Chemistry",
        subtopics: [
          "Heat and internal energy",
          "Spontaneous evolution of systems: entropy and free energy",
          "Chemical reactions and reaction kinetics",
        ],
      },
    ],
  },
  {
    name: "Advanced Mathematics (Option)",
    topics: [
      {
        name: "Linear Algebra and Matrices",
        subtopics: [
          "Matrices and operations: sum, product, inverse",
          "Eigenvalues and eigenvectors",
          "Application to linear systems",
        ],
      },
      {
        name: "Complex Numbers and Applications",
        subtopics: [
          "Algebraic, trigonometric and exponential forms",
          "Plane transformations: rotations, homotheties",
          "Application to differential equations",
        ],
      },
      {
        name: "Analysis",
        subtopics: [
          "Numerical sequences and series (convergence, Taylor series)",
          "In-depth study of functions: limited developments, generalized integrals",
        ],
      },
      {
        name: "Probability and Statistics",
        subtopics: [
          "Continuous random variables, probability density",
          "Common distributions: normal law, exponential",
          "Estimation and statistical tests",
        ],
      },
    ],
  },
]

export default function MendesFrancePage() {
  const [language, setLanguage] = useState<"en" | "fr">("en")

  const translations = {
    en: {
      title: "Mendes France - Épinal, France",
      subtitle: "Scientific Baccalaureate",
      description: "Specialization in Mathematics (+ advanced maths), Engineering Sciences, and Physics/Chemistry",
      backToResume: "Back to Resume",
    },
    fr: {
      title: "Mendes France - Épinal, France",
      subtitle: "Baccalauréat Scientifique",
      description: "Spécialisation en Mathématiques (+ maths expertes), Sciences de l'Ingénieur et Physique/Chimie",
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
