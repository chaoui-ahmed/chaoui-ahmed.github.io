"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Linkedin, Mail, FileDown, Phone } from "lucide-react"

export function ContactBlock({ language }: { language: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col md:flex-row items-center justify-center gap-8 bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow mb-12"
    >
      <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-md">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_8307%202.jpg-xvyfZapAP5sbr1vB7DR5AfEL8SEnqZ.jpeg"
          alt="Ahmed Chaoui Kouraichi"
          fill
          className="object-cover"
        />
      </div>
      <div className="flex flex-col items-center md:items-start gap-4">
        <h2 className="text-2xl font-bold text-mint-800">
          {language === "en" ? "Contact Information" : "Informations de Contact"}
        </h2>
        <div className="flex gap-4">
          <motion.a
            href="https://www.linkedin.com/in/ahmed-chaoui-51b429265/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-mint-500 text-white p-2 rounded-full hover:bg-mint-600 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Linkedin size={24} />
          </motion.a>
          <motion.a
            href="mailto:ahmed.chaoui@eurecom.fr"
            className="bg-mint-500 text-white p-2 rounded-full hover:bg-mint-600 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Mail size={24} />
          </motion.a>
          <motion.a
            href="tel:+33635477019"
            className="bg-mint-500 text-white p-2 rounded-full hover:bg-mint-600 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Phone size={24} />
          </motion.a>
          <motion.a
            href="/path-to-your-cv.pdf"
            download
            className="bg-mint-500 text-white p-2 rounded-full hover:bg-mint-600 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FileDown size={24} />
          </motion.a>
        </div>
      </div>
    </motion.div>
  )
}
