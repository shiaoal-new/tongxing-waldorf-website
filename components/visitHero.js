import Container from "./container";
import { motion } from "framer-motion";

export default function VisitHero() {
    return (
        <div className="relative flex items-center justify-center min-h-[500px] overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 w-full h-full">
                <motion.img
                    src="/img/visit.jpg"
                    alt="Visit Background"
                    className="object-cover w-full h-full"
                    initial={{ scale: 1 }}
                    animate={{ scale: 1.1 }}
                    transition={{ duration: 10, ease: "easeOut" }}
                />
                <div className="absolute inset-0 bg-black/50"></div>
            </div>

            <Container className="relative z-10">
                <div className="flex flex-col items-center justify-center text-center">
                    <h1 className="text-4xl font-bold leading-snug tracking-tight text-white lg:text-4xl lg:leading-tight xl:text-6xl xl:leading-tight">
                        預約參觀
                    </h1>
                    <p className="py-5 text-xl leading-normal text-gray-200 lg:text-xl xl:text-2xl">
                        親自走訪同心華德福，感受獨特的教育氛圍與校園環境。
                    </p>
                </div>
            </Container>
        </div>
    );
}
