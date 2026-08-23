import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Heading Component
const headingVariants = cva("font-serif leading-tight tracking-tight", {
    variants: {
        variant: {
            default: "text-warm-black dark:text-soft-cream",
            gradient: "bg-[linear-gradient(90deg,#A73033_0%,#E88127_50%,#A73033_100%)] bg-clip-text text-transparent w-fit",
            primary: "text-primary",
            secondary: "text-secondary",
            accent: "text-secondary dark:text-primary",
            inverse: "text-white dark:text-warm-black",
        },
        size: {
            h1: "text-5xl md:text-7xl lg:text-[7rem] leading-[1.05]",
            h2: "text-4xl md:text-5xl lg:text-6xl",
            h3: "text-3xl md:text-4xl",
            h4: "text-2xl md:text-3xl",
            h5: "text-xl md:text-2xl",
            h6: "text-lg md:text-xl",
        },
        alignment: {
            left: "text-left",
            center: "text-center",
            right: "text-right",
        },
        weight: {
            normal: "font-normal",
            medium: "font-medium",
            semibold: "font-semibold",
            bold: "font-bold",
            extrabold: "font-extrabold",
        },
    },
    compoundVariants: [
        {
            variant: "gradient",
            alignment: "center",
            class: "mx-auto",
        },
        {
            variant: "gradient",
            alignment: "right",
            class: "ml-auto",
        },
    ],
    defaultVariants: {
        variant: "default",
        size: "h3",
        alignment: "left",
        weight: "normal", // DM Serif Display looks best normal
    },
});

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement>, VariantProps<typeof headingVariants> {
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
    ({ className, variant, size, alignment, weight, as, children, ...props }, ref) => {
        // Fallback to the size prop if 'as' is not provided, or 'h1' if both are missing
        const Component = as || (typeof size === 'string' && size.startsWith('h') ? size as any : "h1");

        return (
            <Component className={cn(headingVariants({ variant, size, alignment, weight, className }))} ref={ref} {...props}>
                {children}
            </Component>
        );
    },
);
Heading.displayName = "Heading";

// Paragraph Component
const paragraphVariants = cva("font-sans", {
    variants: {
        variant: {
            default: "text-gray-medium dark:text-gray-light",
            dark: "text-warm-black dark:text-soft-cream",
            primary: "text-primary",
            secondary: "text-secondary",
            accent: "text-secondary dark:text-primary",
        },
        size: {
            xxs: "text-[10px] md:text-xs",
            xs: "text-xs md:text-sm",
            sm: "text-sm md:text-base",
            base: "text-base md:text-lg",
            lg: "text-lg md:text-xl",
            xl: "text-xl md:text-2xl",
        },
        alignment: {
            left: "text-left",
            center: "text-center",
            right: "text-right",
            justify: "text-justify",
        },
        weight: {
            light: "font-light",
            normal: "font-normal",
            medium: "font-medium",
            semibold: "font-semibold",
            bold: "font-bold",
        },
        leading: {
            none: "leading-none",
            tight: "leading-tight",
            snug: "leading-snug",
            normal: "leading-normal",
            relaxed: "leading-relaxed",
            loose: "leading-loose",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "base",
        alignment: "left",
        weight: "normal",
        leading: "relaxed",
    },
});

interface ParagraphProps extends React.HTMLAttributes<HTMLParagraphElement>, VariantProps<typeof paragraphVariants> {}

const Paragraph = React.forwardRef<HTMLParagraphElement, ParagraphProps>(
    ({ className, variant, size, alignment, weight, leading, children, ...props }, ref) => {
        return (
            <p
                className={cn(
                    paragraphVariants({
                        variant,
                        size,
                        alignment,
                        weight,
                        leading,
                        className,
                    }),
                )}
                ref={ref}
                {...props}
            >
                {children}
            </p>
        );
    },
);
Paragraph.displayName = "Paragraph";

// Mono Component
const monoVariants = cva("font-mono", {
    variants: {
        variant: {
            default: "text-warm-black dark:text-soft-cream",
            muted: "text-gray-medium",
            primary: "text-primary",
            secondary: "text-secondary",
            accent: "text-secondary dark:text-primary",
        },
        size: {
            xs: "text-[0.675rem]",
            sm: "text-xs",
            base: "text-sm",
            lg: "text-base",
            xl: "text-lg",
        },
        weight: {
            normal: "font-normal",
            medium: "font-medium",
            semibold: "font-semibold",
            bold: "font-bold",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "base",
        weight: "normal",
    },
});

interface MonoProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof monoVariants> {}

const Mono = React.forwardRef<HTMLSpanElement, MonoProps>(({ className, variant, size, weight, children, ...props }, ref) => {
    return (
        <span className={cn(monoVariants({ variant, size, weight, className }))} ref={ref} {...props}>
            {children}
        </span>
    );
});
Mono.displayName = "Mono";

export { Heading, Paragraph, Mono, headingVariants, paragraphVariants, monoVariants };
