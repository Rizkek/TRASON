import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Sizes use the semantic scale from tailwind.config.js (nothing below 12px). The weight prop
// wins over the weight carried by a size token because font-* utilities come after text-*.
// text-primary and text-secondary resolve to the text variants of the gold, so they are safe
// as text in both themes.

// Heading Component
const headingVariants = cva("font-sans leading-tight tracking-tight", {
    variants: {
        variant: {
            default: "text-foreground",
            primary: "text-primary",
            secondary: "text-secondary",
            accent: "text-primary",
            inverse: "text-background",
        },
        size: {
            display: "text-display-lg md:text-display-xl",
            h1: "text-heading-lg md:text-heading-xl",
            h2: "text-heading-md md:text-heading-lg",
            h3: "text-title-lg md:text-heading-md",
            h4: "text-title-md md:text-title-lg",
            h5: "text-body-md md:text-body-lg",
            h6: "text-body-md",
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
    defaultVariants: {
        variant: "default",
        size: "h3",
        alignment: "left",
        weight: "semibold",
    },
});

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement>, VariantProps<typeof headingVariants> {
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
    ({ className, variant, size, alignment, weight, as, children, ...props }, ref) => {
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
            default: "text-muted-foreground",
            dark: "text-foreground",
            primary: "text-primary",
            secondary: "text-secondary",
            accent: "text-primary",
        },
        size: {
            xxs: "text-xs",
            xs: "text-xs",
            sm: "text-xs md:text-body-md",
            base: "text-body-md md:text-body-lg",
            lg: "text-body-lg md:text-title-lg",
            xl: "text-title-lg md:text-heading-md",
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
            default: "text-foreground",
            muted: "text-muted-foreground",
            primary: "text-primary",
            secondary: "text-secondary",
            accent: "text-primary",
        },
        size: {
            xs: "text-xs",
            sm: "text-xs",
            base: "text-body-md",
            lg: "text-body-lg",
            xl: "text-title-lg",
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
