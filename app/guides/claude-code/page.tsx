"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Montserrat } from "next/font/google"
import { ArrowLeft, Check, Copy, Terminal, FolderOpen, FileText, Play, RefreshCw, Cpu } from "lucide-react"

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
})

export default function ClaudeCodeGuide() {
  const [language, setLanguage] = useState<"en" | "fr">("fr")
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(key)
    setTimeout(() => setCopiedText(null), 2000)
  }

  const content = {
    en: {
      back: "Back to Portfolio",
      title: "Building Your First Autonomous AI Agent with Claude Code",
      subtitle: "Learn how to install Claude Code, write your first agent from scratch, and end up with something real: a working agent that reads a folder, spots problems, and writes a report, with no coding experience required.",
      distinctionTitle: "Chatbot vs. AI Agent",
      distinctionText: "A chatbot waits for you to ask a question and answers it. An AI agent is different: you give it a goal, and it figures out the steps, reads files, runs commands, and takes action on its own until the job is done. You are not driving every move. You are setting the destination. That distinction matters because it changes what you can automate. You are not typing prompts one at a time. You are building something that does the work while you focus elsewhere.",
      requirementsTitle: "What You Need Before You Start",
      requirementsList: [
        "A Claude account with a paid plan (Pro at $20/month is the minimum; Claude Code is included)",
        "A Mac running macOS 13 or later, or a Windows PC, or a Linux machine",
        "An internet connection",
        "Roughly 30 to 45 minutes for the full setup and first build"
      ],
      requirementsNote: "No prior coding experience needed. Every command in this guide is written out in full. You copy, paste, and press Enter. Cost to follow this guide: $0 beyond your subscription.",
      installTitle: "Install Claude Code (Desktop App Route, No Terminal Required)",
      installText: "The easiest path for a beginner is the desktop app. It gives you all of Claude Code's power without needing to learn terminal commands first. Go to claude.ai and download the desktop app for your platform. On macOS, open the .dmg file and drag Claude into your Applications folder. On Windows, run the installer. Launch the app, sign in with your Claude account, and click the Code tab at the top center of the screen. If the Code tab asks you to upgrade your plan, your current plan does not include Claude Code. Launching the workspace presents you with a blank prompt box where the agent lives.",
      buildGoalTitle: "What You Are Going to Build",
      buildGoalText: "You are going to build one specific agent, and you will use it all the way through this guide. The agent's job: read a folder of text files, find any file that is missing a title line at the top, and write a report called 'missing-titles.txt' listing every file that needs fixing. This is a real, useful task. It shows every core agent behavior: reading files, making decisions, and writing output. And it is simple enough to verify by eye when it works.",
      step1Title: "Step 1: Create Your Working Folder",
      step1Text: "Create a new folder on your Desktop called `my-agent`. This is where the agent will work. It can only see and touch files inside this folder, keeping everything safe and contained. Inside `my-agent`, create a second folder called `articles`. Now create four plain text files inside `articles`: `post-one.txt`, `post-two.txt`, `post-three.txt`, and `post-four.txt`. Open two of them and add this as the very first line:",
      step1Success: "Success Look: Your folder structure is my-agent/articles/ containing four files, two with titles and two left empty.",
      step2Title: "Step 2: Write the CLAUDE.md Instruction File",
      step2Text: "CLAUDE.md is a plain text file that Claude Code reads at the start of every session. It serves as your agent's standing instructions or job description. Inside the `my-agent` folder (not inside `articles`), create a file called `CLAUDE.md` and paste this exactly:",
      step3Title: "Step 3: Point Claude Code at Your Folder",
      step3Text: "Open the Claude Code desktop app, click 'Open folder' and select your `my-agent` folder. Claude Code will read CLAUDE.md automatically in the background.",
      step3Terminal: "If you prefer the command line terminal, run:",
      step4Title: "Step 4: Run the Agent",
      step4Text: "In the prompt box at the bottom of the Claude Code interface, type this exactly and press Enter:",
      step4Prompt: "Read every .txt file in the articles folder. Find any file missing a Title line at the top. Write the results to missing-titles.txt as instructed in CLAUDE.md.",
      step4Success: "Claude Code will execute the instructions step-by-step: reading files, identifying those missing titles, and creating `missing-titles.txt` listing the empty files.",
      mistakeTitle: "Common Beginner Mistake: Empty Output File",
      mistakeText: "If the agent writes `missing-titles.txt` but leaves it empty, the cause is usually vague instructions. Fix it by making CLAUDE.md output instructions more explicit. Concrete examples in instructions produce concrete output every time.",
      step5Title: "Step 5: Verify and Extend",
      step5Text: "Open `missing-titles.txt` and confirm it lists the two empty files. You now have a working agent! To extend it to check if files are longer than 5 lines, add this to CLAUDE.md under 'What to look for':",
      step5ExtText: "A valid file also has more than 5 lines of content. If a file has 5 lines or fewer, flag it as 'too short' alongside the title check.",
      whyMattersTitle: "Why This Matters",
      whyMattersText: "You built an agent that reads, decides, and writes output without your constant supervision. The prompt stays the same, but the agent's behavior scales simply by updating the CLAUDE.md instruction file."
    },
    fr: {
      back: "Retour au Portfolio",
      title: "Créer votre premier Agent IA autonome avec Claude Code",
      subtitle: "Apprenez à installer Claude Code, concevoir votre premier agent à partir de zéro et aboutir à un projet concret : un agent autonome fonctionnel qui parcourt un dossier, détecte les anomalies et génère un rapport, le tout sans expérience préalable en programmation.",
      distinctionTitle: "Chatbot vs. Agent IA",
      distinctionText: "Un chatbot attend votre question pour y répondre. Un agent IA fonctionne différemment : vous lui donnez un objectif, et il planifie les étapes, lit les fichiers, exécute les commandes et effectue des actions de manière autonome jusqu'à ce que la tâche soit accomplie. Vous ne pilotez pas chaque action, vous définissez la destination. Cette distinction permet d'automatiser des flux entiers de travail pendant que vous vous concentrez sur autre chose.",
      requirementsTitle: "Prérequis avant de commencer",
      requirementsList: [
        "Un compte Claude avec un abonnement payant (le forfait Pro à 20$/mois minimum comprend Claude Code)",
        "Un ordinateur fonctionnant sous macOS 13+, Windows ou Linux",
        "Une connexion Internet stable",
        "Environ 30 à 45 minutes pour la configuration et le premier test"
      ],
      requirementsNote: "Aucune expérience préalable en développement n'est requise. Toutes les instructions sont détaillées pas à pas. Il vous suffit de copier, coller et valider. Aucun coût supplémentaire en dehors de votre abonnement.",
      installTitle: "Installation de Claude Code (Via l'application de bureau)",
      installText: "La méthode la plus simple pour débuter consiste à utiliser l'application de bureau. Rendez-vous sur claude.ai et téléchargez l'application. Sur macOS, ouvrez le fichier .dmg et glissez Claude dans vos Applications. Sur Windows, lancez l'installateur. Une fois l'application ouverte, connectez-vous et cliquez sur l'onglet 'Code' au centre de l'écran pour accéder à votre espace de travail.",
      buildGoalTitle: "Ce que vous allez construire",
      buildGoalText: "Vous allez concevoir un agent spécifique pour cette tâche : lire un dossier contenant des articles textuels, identifier les fichiers auxquels il manque une ligne de titre, et rédiger un rapport nommé `missing-titles.txt` répertoriant les fichiers à corriger. Ce cas pratique illustre parfaitement les capacités de lecture, d'analyse et d'écriture d'un agent.",
      step1Title: "Étape 1 : Créer votre dossier de travail",
      step1Text: "Créez un dossier nommé `my-agent` sur votre Bureau. À l'intérieur, créez un sous-dossier appelé `articles`. Ensuite, créez-y 4 fichiers texte : `post-one.txt`, `post-two.txt`, `post-three.txt` et `post-four.txt`. Ouvrez-en deux d'entre eux et ajoutez cette ligne tout au début :",
      step1Success: "Structure cible : my-agent/articles/ contenant 4 fichiers .txt (2 contenant un titre, et 2 laissés vides).",
      step2Title: "Étape 2 : Rédiger les instructions dans CLAUDE.md",
      step2Text: "Le fichier CLAUDE.md contient les règles de conduite de l'agent. Créez-le directement dans le dossier `my-agent` (pas dans `articles`) et insérez le contenu suivant :",
      step3Title: "Étape 3 : Ouvrir le dossier dans Claude Code",
      step3Text: "Dans l'application de bureau Claude Code, cliquez sur 'Open folder' et sélectionnez votre dossier `my-agent`. Le fichier CLAUDE.md sera automatiquement lu par l'agent.",
      step3Terminal: "Si vous préférez utiliser votre terminal de commande, exécutez :",
      step4Title: "Étape 4 : Lancer l'agent autonome",
      step4Text: "Dans la zone de saisie en bas de l'interface de Claude Code, collez le message suivant et validez :",
      step4Prompt: "Read every .txt file in the articles folder. Find any file missing a Title line at the top. Write the results to missing-titles.txt as instructed in CLAUDE.md.",
      step4Success: "Claude Code va s'activer et afficher en temps réel ses actions : lecture des articles, détection des anomalies et création du rapport final.",
      mistakeTitle: "Erreurs fréquentes : Rapport vide",
      mistakeText: "Si le fichier `missing-titles.txt` est créé mais reste vide, cela signifie que vos instructions dans CLAUDE.md sont trop floues. Donnez des exemples clairs à votre agent pour obtenir un résultat précis à chaque exécution.",
      step5Title: "Étape 5 : Valider et étendre les consignes",
      step5Text: "Vérifiez que le rapport liste bien les deux fichiers restés vides. Vous pouvez ensuite enrichir ses fonctionnalités. Pour vérifier aussi la longueur des articles, rajoutez ceci sous la section 'What to look for' dans CLAUDE.md :",
      step5ExtText: "A valid file also has more than 5 lines of content. If a file has 5 lines or fewer, flag it as 'too short' alongside the title check.",
      whyMattersTitle: "Pourquoi c'est important",
      whyMattersText: "Vous venez de créer un agent autonome capable de s'adapter simplement en modifiant ses instructions de base (CLAUDE.md). Le prompt de départ reste identique, mais la logique interne de votre agent évolue de manière transparente."
    }
  }

  const lang = content[language]

  return (
    <div className={`min-h-screen bg-mint-50 text-mint-900 ${montserrat.variable} font-sans py-12 px-4 md:px-6`}>
      <div className="max-w-3xl mx-auto">
        
        {/* Header navigation */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="flex items-center text-mint-600 hover:text-mint-800 transition-colors font-medium">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {lang.back}
          </Link>
          
          <div className="flex bg-white rounded-full p-1 shadow-sm border border-mint-200">
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${language === "en" ? "bg-mint-500 text-white" : "text-mint-600 hover:text-mint-800"}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("fr")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${language === "fr" ? "bg-mint-500 text-white" : "text-mint-600 hover:text-mint-800"}`}
            >
              FR
            </button>
          </div>
        </div>

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-12 text-center md:text-left">
          <span className="bg-mint-200 text-mint-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">
            Guide / Tutorial
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-mint-800 leading-tight mb-4">
            {lang.title}
          </h1>
          <p className="text-mint-600 text-lg font-light leading-relaxed">
            {lang.subtitle}
          </p>
        </motion.div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-mint-100 space-y-8">
          
          {/* Chatbot vs Agent */}
          <div className="bg-mint-50/50 rounded-xl p-5 border border-mint-100 flex gap-4 items-start">
            <Cpu className="h-6 w-6 text-mint-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-mint-800 mb-2">{lang.distinctionTitle}</h3>
              <p className="text-mint-700 text-sm leading-relaxed">{lang.distinctionText}</p>
            </div>
          </div>

          {/* Requirements */}
          <div>
            <h2 className="text-xl font-bold text-mint-800 mb-4 flex items-center gap-2">
              <Check className="h-5 w-5 text-mint-500" />
              {lang.requirementsTitle}
            </h2>
            <ul className="list-disc list-inside space-y-2 text-mint-700 text-sm pl-2">
              {lang.requirementsList.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
            <p className="text-xs text-mint-500 mt-4 italic bg-mint-50 p-3 rounded-lg">
              {lang.requirementsNote}
            </p>
          </div>

          {/* Installation */}
          <div>
            <h2 className="text-xl font-bold text-mint-800 mb-3 flex items-center gap-2">
              <Terminal className="h-5 w-5 text-mint-600" />
              {lang.installTitle}
            </h2>
            <p className="text-mint-700 text-sm leading-relaxed mb-4">
              {lang.installText}
            </p>
          </div>

          {/* What to Build */}
          <div className="border-t border-mint-100 pt-6">
            <h2 className="text-xl font-bold text-mint-800 mb-3 flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-mint-600" />
              {lang.buildGoalTitle}
            </h2>
            <p className="text-mint-700 text-sm leading-relaxed">
              {lang.buildGoalText}
            </p>
          </div>

          {/* Step 1 */}
          <div className="border-t border-mint-100 pt-6 space-y-4">
            <h2 className="text-xl font-bold text-mint-800 flex items-center gap-2">
              <span className="bg-mint-100 text-mint-700 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
              {lang.step1Title}
            </h2>
            <p className="text-mint-700 text-sm leading-relaxed">
              {lang.step1Text}
            </p>
            <div className="relative bg-slate-950 rounded-lg p-4 font-mono text-xs text-slate-200">
              <button 
                onClick={() => handleCopy("Title: My Article", "step1")} 
                className="absolute top-2 right-2 text-slate-400 hover:text-slate-200 p-1 rounded"
              >
                {copiedText === "step1" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </button>
              <code>Title: My Article</code>
            </div>
            <p className="text-xs text-mint-500 italic bg-mint-50 p-2 rounded">
              {lang.step1Success}
            </p>
          </div>

          {/* Step 2 */}
          <div className="border-t border-mint-100 pt-6 space-y-4">
            <h2 className="text-xl font-bold text-mint-800 flex items-center gap-2">
              <span className="bg-mint-100 text-mint-700 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
              {lang.step2Title}
            </h2>
            <p className="text-mint-700 text-sm leading-relaxed">
              {lang.step2Text}
            </p>
            <div className="relative bg-slate-950 rounded-lg p-4 font-mono text-xs text-slate-200 overflow-x-auto">
              <button 
                onClick={() => handleCopy(`# My File Checker Agent
## Your job
Check every .txt file inside the /articles folder.
## What to look for
A valid file starts with a line that reads exactly: Title:
If the first line does not start with "Title:", the file is missing its title.
## What to do
1. Read every .txt file in /articles one by one.
2. Note which files are missing the Title line.
3. Write a file called missing-titles.txt in the main folder.
4. In that file, list every filename that failed the check, one per line.
5. If all files pass, write "All files have titles." in missing-titles.txt instead.
## What not to do
Do not edit any of the article files. Read only. Write only to missing-titles.txt.`, "step2")} 
                className="absolute top-2 right-2 text-slate-400 hover:text-slate-200 p-1 rounded"
              >
                {copiedText === "step2" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </button>
              <pre>{`# My File Checker Agent
## Your job
Check every .txt file inside the /articles folder.

## What to look for
A valid file starts with a line that reads exactly: Title:
If the first line does not start with "Title:", the file is missing its title.

## What to do
1. Read every .txt file in /articles one by one.
2. Note which files are missing the Title line.
3. Write a file called missing-titles.txt in the main folder.
4. In that file, list every filename that failed the check, one per line.
5. If all files pass, write "All files have titles." in missing-titles.txt instead.

## What not to do
Do not edit any of the article files. Read only. Write only to missing-titles.txt.`}</pre>
            </div>
          </div>

          {/* Step 3 */}
          <div className="border-t border-mint-100 pt-6 space-y-4">
            <h2 className="text-xl font-bold text-mint-800 flex items-center gap-2">
              <span className="bg-mint-100 text-mint-700 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold">3</span>
              {lang.step3Title}
            </h2>
            <p className="text-mint-700 text-sm leading-relaxed">
              {lang.step3Text}
            </p>
            <p className="text-xs text-mint-600 font-semibold uppercase tracking-wider">{lang.step3Terminal}</p>
            <div className="relative bg-slate-950 rounded-lg p-4 font-mono text-xs text-slate-200">
              <button 
                onClick={() => handleCopy("cd ~/Desktop/my-agent\nclaude", "step3")} 
                className="absolute top-2 right-2 text-slate-400 hover:text-slate-200 p-1 rounded"
              >
                {copiedText === "step3" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </button>
              <pre>{`cd ~/Desktop/my-agent\nclaude`}</pre>
            </div>
          </div>

          {/* Step 4 */}
          <div className="border-t border-mint-100 pt-6 space-y-4">
            <h2 className="text-xl font-bold text-mint-800 flex items-center gap-2">
              <span className="bg-mint-100 text-mint-700 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold">4</span>
              {lang.step4Title}
            </h2>
            <p className="text-mint-700 text-sm leading-relaxed">
              {lang.step4Text}
            </p>
            <div className="relative bg-slate-950 rounded-lg p-4 font-mono text-xs text-slate-200">
              <button 
                onClick={() => handleCopy(lang.step4Prompt, "step4")} 
                className="absolute top-2 right-2 text-slate-400 hover:text-slate-200 p-1 rounded"
              >
                {copiedText === "step4" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </button>
              <code>{lang.step4Prompt}</code>
            </div>
            <p className="text-mint-700 text-sm leading-relaxed">
              {lang.step4Success}
            </p>
          </div>

          {/* Common Mistakes */}
          <div className="bg-amber-50/50 rounded-xl p-5 border border-amber-200 flex gap-4 items-start">
            <RefreshCw className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-amber-800 mb-2">{lang.mistakeTitle}</h3>
              <p className="text-amber-700 text-sm leading-relaxed">{lang.mistakeText}</p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="border-t border-mint-100 pt-6 space-y-4">
            <h2 className="text-xl font-bold text-mint-800 flex items-center gap-2">
              <span className="bg-mint-100 text-mint-700 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold">5</span>
              {lang.step5Title}
            </h2>
            <p className="text-mint-700 text-sm leading-relaxed">
              {lang.step5Text}
            </p>
            <div className="relative bg-slate-950 rounded-lg p-4 font-mono text-xs text-slate-200 overflow-x-auto">
              <button 
                onClick={() => handleCopy(lang.step5ExtText, "step5")} 
                className="absolute top-2 right-2 text-slate-400 hover:text-slate-200 p-1 rounded"
              >
                {copiedText === "step5" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </button>
              <pre>{`A valid file also has more than 5 lines of content.
If a file has 5 lines or fewer, flag it as "too short" alongside the title check.`}</pre>
            </div>
          </div>

          {/* Conclusion */}
          <div className="border-t border-mint-100 pt-6">
            <h2 className="text-xl font-bold text-mint-800 mb-3 flex items-center gap-2">
              <Play className="h-5 w-5 text-mint-600" />
              {lang.whyMattersTitle}
            </h2>
            <p className="text-mint-700 text-sm leading-relaxed">
              {lang.whyMattersText}
            </p>
          </div>

        </div>

      </div>
    </div>
  )
}
