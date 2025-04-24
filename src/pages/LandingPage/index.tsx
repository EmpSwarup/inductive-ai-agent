import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { aiPersona } from "@/config/personaConfig";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import AiAvatar from "@/components/Avatar/AiAvatar";
import { motion } from "framer-motion";
import { Github } from "lucide-react";

export default function LandingPage() {
  // Animation variants for staggering children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  // Animation variants for individual items
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-blue-900 p-6 transition-colors duration-300 overflow-hidden">
      {/* Theme Switcher */}
      <motion.div
        className="absolute top-4 right-4"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <ThemeSwitcher />
      </motion.div>

      {/* Main Content */}
      <motion.div
        className="text-center max-w-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Avatar */}
        <motion.div
          className="flex flex-row justify-center mb-6"
          variants={itemVariants}
        >
          <AiAvatar size="lg" emotion="happy" animate={true} />
        </motion.div>

        {/* Heading */}
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4"
          variants={itemVariants}
        >
          Meet {aiPersona.name}
        </motion.h1>

        {/* Paragraph */}
        <motion.p
          className="text-lg text-gray-600 dark:text-gray-300 mb-8"
          variants={itemVariants}
        >
          Your futuristic AI assistant, ready to chat and help you explore
          ideas.
        </motion.p>

        {/* Link*/}
        <motion.div variants={itemVariants}>
          <Link to="/chat">
            <Button
              size="lg"
              className="cursor-pointer items-center gap-x-2 py-2 px-3 bg-slate-400/10 rounded-full text-sm text-black dark:text-white hover:bg-slate-400/20 focus:outline-none transition-colors duration-200"
            >
              Start Chatting with {aiPersona.name}
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      {/* GitHub Link */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
      >
        <a
          href="https://github.com/EmpSwarup/inductive-ai-agent"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
        >
          <Github className="h-4 w-4" />
          <span>View on GitHub</span>
        </a>
      </motion.div>
    </div>
  );
}
