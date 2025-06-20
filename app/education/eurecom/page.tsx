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

interface Course {
  name: string
  professor: string
  description: string
  linkedin?: string
}

const courses: Course[] = [
  {
    name: "ComLab",
    professor: "Florian KALTENBERGER",
    description: "Theoretical and practical work",
    linkedin: "https://www.linkedin.com/in/florian-kaltenberger/",
  },
  {
    name: "ImProc",
    professor: "Jean-luc DUGELAY",
    description: "Digital Image Processing",
    linkedin: "https://www.linkedin.com/in/jean-luc-dugelay-b66b3512/",
  },
  {
    name: "SoundProc",
    professor: "Massimiliano TODISCO",
    description: "Sound and Music Processing",
    linkedin: "https://www.linkedin.com/in/massimiliano-todisco-5b3b111a/",
  },
  {
    name: "BasicOS",
    professor: "Ludovic APVRILLE & Renaud PACALET",
    description: "Basics of Operating Systems",
    linkedin:
      "https://www.linkedin.com/in/ludovic-apvrille-70b9b611/, https://www.linkedin.com/in/renaud-pacalet-64015a20/",
  },
  {
    name: "ComProg",
    professor: "Mohamed BELLEBNA",
    description: "Computer Programming",
  },
  {
    name: "ITBasics",
    professor: "Aurélien HERNANDEZ, Thomas",
    description: "IT Fundamentals",
  },
  {
    name: "IntroArchi",
    professor: "Renaud PACALET",
    description: "Introduction to Computer Architecture",
    linkedin: "https://www.linkedin.com/in/renaud-pacalet-64015a20/",
  },
  {
    name: "IntroNet_1",
    professor: "Adlen KSENTINI",
    description: "Introduction to Computer Networks and Internet 1",
    linkedin: "https://www.linkedin.com/in/adlen-ksentini-489b3432/",
  },
  {
    name: "ComEng",
    professor: "Arnaud LEGOUT",
    description: "Communication for Engineers",
    linkedin: "https://www.linkedin.com/in/arnaud-legout-645a204/",
  },
  {
    name: "DataBase",
    professor: "Raphaël TRONCY",
    description: "Introduction to Databases",
    linkedin: "https://www.linkedin.com/in/raphaeltroncy/",
  },
  {
    name: "IntroNet_2",
    professor: "Adlen KSENTINI & Karim BOUTIBA",
    description: "Introduction to Computer Networks and Internet 2",
    linkedin: "https://www.linkedin.com/in/adlen-ksentini-489b3432/",
  },
  {
    name: "IntroSec",
    professor: "Simone AONZO",
    description: "Introduction to Cybersecurity",
    linkedin: "https://www.linkedin.com/in/simone-aonzo-6477b6b7/",
  },
  {
    name: "DigiPro",
    professor: "Jean-luc DUGELAY & Franck JOURNEAU",
    description: "Discovery of Digital Professions",
    linkedin:
      "https://www.linkedin.com/in/jean-luc-dugelay-b66b3512/, https://www.linkedin.com/in/franck-journeau-351b3924/",
  },
  {
    name: "InfoTheo_1",
    professor: "Derya MALAK & Petros ELIA",
    description: "Information Theory 1",
    linkedin: "https://www.linkedin.com/in/petros-elia-24b3a5b8/",
  },
  {
    name: "IntroStat",
    professor: "Motonobu KANAGAWA",
    description: "Introduction to Statistics",
    linkedin: "https://www.linkedin.com/in/motonobu-kanagawa-6473b1b5/",
  },
]

export default function EurecomPage() {
  const [language, setLanguage] = useState<"en" | "fr">("en")

  const translations = {
    en: {
      title: "Eurecom - Sophia-Antipolis, France",
      subtitle: "Engineering Degree in Digital Science",
      description: "Specializing in Data Science and Artificial Intelligence, courses taught 100% in English",
      viewDetails: "View Details",
      backToResume: "Back to Resume",
      professor: "Professor",
    },
    fr: {
      title: "Eurecom - Sophia-Antipolis, France",
      subtitle: "Diplôme d'Ingénieur en Science Numérique",
      description:
        "Spécialisation en Science des Données et Intelligence Artificielle, cours enseignés 100% en anglais",
      viewDetails: "Voir les détails",
      backToResume: "Retour au CV",
      professor: "Professeur",
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {courses.map((course, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <h3 className="text-xl font-semibold mb-2 text-mint-800">{course.name}</h3>
              <p className="mb-2 text-mint-700">
                <span className="font-semibold">{t.professor}: </span>
                {course.linkedin ? (
                  <a
                    href={course.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-mint-600 hover:underline"
                  >
                    {course.professor}
                  </a>
                ) : (
                  course.professor
                )}
              </p>
              <p className="text-mint-600">{course.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
