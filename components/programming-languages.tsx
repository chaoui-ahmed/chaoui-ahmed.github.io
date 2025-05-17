"use client"

import { motion } from "framer-motion"

const programmingLanguages = [
  {
    name: "Python",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  },
  {
    name: "SQL",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
  },
  {
    name: "VBA Excel",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/microsoftsqlserver/microsoftsqlserver-plain.svg",
  },
  {
    name: "BASH",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bash/bash-original.svg",
  },
  {
    name: "C++",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
  },
  {
    name: "MATLAB",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/matlab/matlab-original.svg",
  },
]

export function ProgrammingLanguages({ language }: { language: string }) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mb-12"
      id="programming-languages"
    >
      <h2 className="text-2xl font-bold mb-4 text-mint-600">
        {language === "en" ? "PROGRAMMING LANGUAGES" : "LANGAGES"}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {programmingLanguages.map((lang, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5, shadow: "lg" }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-all flex flex-col items-center gap-2"
          >
            <img
              src={lang.logo || "/placeholder.svg"}
              alt={lang.name}
              className="w-12 h-12 grayscale hover:grayscale-0 transition-all"
            />
            <span className="text-mint-800 text-sm font-medium">{lang.name}</span>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
