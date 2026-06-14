import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect',
  width,
  height,
}) => {
  const baseClasses = "relative overflow-hidden bg-black/[0.03] dark:bg-white/[0.03]";
  
  const variantClasses = {
    rect: "rounded-md",
    circle: "rounded-full",
    text: "rounded h-4 w-full",
  };

  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    >
      {/* Shimmer Effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
      
      {/* Brand Hint (Subtle glow at the edge) */}
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-warm-gold/20 to-deep-sage/20 opacity-30" />
    </div>
  );
};

// Add shimmer keyframe to Tailwind if not present, but for now we can use a custom style or ensure it's in globals.css
