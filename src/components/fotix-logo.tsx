import { cn } from "@/lib/utils";

export function FotixLogo({ className }: { className?: string }) {
    return (
        <svg
            className={cn(className)}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M44 24L24 4L4 24L24 44L44 24Z"
                stroke="url(#paint0_linear_1_2)"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <path
                d="M24 34L14 24L24 14L34 24L24 34Z"
                fill="url(#paint1_linear_1_2)"
                stroke="url(#paint2_linear_1_2)"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <defs>
                <linearGradient
                    id="paint0_linear_1_2"
                    x1="4"
                    y1="24"
                    x2="44"
                    y2="24"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#A078F0" />
                    <stop offset="1" stopColor="#78B4FA" />
                </linearGradient>
                <linearGradient
                    id="paint1_linear_1_2"
                    x1="14"
                    y1="24"
                    x2="34"
                    y2="24"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#A078F0" />
                    <stop offset="1" stopColor="#78B4FA" />
                </linearGradient>
                <linearGradient
                    id="paint2_linear_1_2"
                    x1="14"
                    y1="24"
                    x2="34"
                    y2="24"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#A078F0" />
                    <stop offset="1" stopColor="#78B4FA" />
                </linearGradient>
            </defs>
        </svg>

    );
}
