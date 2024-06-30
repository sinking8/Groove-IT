import { motion } from "framer-motion";

function FadeInWhenVisible({ children }) {
  return (
    <motion.div
      initial="pageInitial"
      animate="pageAnimate"
      transition={{ duration: 0.5 }}
      variants={{
        pageInitial: {
          opacity: 0,
        },
        pageAnimate: {
          opacity: 1,
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export default FadeInWhenVisible;
