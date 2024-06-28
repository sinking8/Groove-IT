import { motion } from "framer-motion";
import Image from "next/image";
import Background from "./components/background";
import SignIn from "./components/signin/SignIn";

export default function Home() {
  return <Background width={"2000"} children={<SignIn />} />;
}
