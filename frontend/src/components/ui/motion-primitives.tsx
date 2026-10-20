"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";
import {
  SPRING_SNAPPY,
  SPRING_SMOOTH,
  SPRING_BOUNCY,
  SPRING_RESIZE,
  EASE_OUT_EXPO,
  SHAKE_KEYFRAMES,
} from "@/lib/motion-config";

// --- 1. TACTILE MOTION BUTTON ---
export interface MotionButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "elevated";
  enableLift?: boolean;
}

export const MotionButton = React.forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ children, className = "", enableLift = true, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        disabled={disabled}
        whileHover={
          disabled
            ? undefined
            : enableLift
            ? { scale: 1.02, y: -1, transition: SPRING_SNAPPY }
            : { scale: 1.01, transition: SPRING_SNAPPY }
        }
        whileTap={disabled ? undefined : { scale: 0.96, transition: SPRING_SNAPPY }}
        className={`select-none disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
MotionButton.displayName = "MotionButton";


// --- 2. ANIMATED TAB CONTENT (BLUR-FADE + SEAMLESS AUTO-RESIZE) ---
export interface AnimatedTabContentProps {
  tabKey: string | number;
  children: React.ReactNode;
  className?: string;
  enableSeamlessResize?: boolean;
  transition?: any;
}

export const AnimatedTabContent: React.FC<AnimatedTabContentProps> = ({
  tabKey,
  children,
  className = "",
  enableSeamlessResize = true,
  transition = SPRING_RESIZE,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!enableSeamlessResize) return;
    const el = contentRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const measuredHeight =
        entry.borderBoxSize?.[0]?.blockSize ??
        entry.target.getBoundingClientRect().height;

      if (measuredHeight > 0) {
        setHeight(Math.round(measuredHeight));
        if (isFirstRender.current) {
          requestAnimationFrame(() => {
            isFirstRender.current = false;
          });
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [enableSeamlessResize]);

  if (!enableSeamlessResize) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={tabKey}
          initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
          transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
          className={className}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <motion.div
      style={{ overflow: "hidden", position: "relative" }}
      animate={{ height }}
      transition={isFirstRender.current ? { duration: 0 } : transition}
      className="w-full"
    >
      <div ref={contentRef} className="w-full relative">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={tabKey}
            initial={{ opacity: 0, y: 8, filter: "blur(3px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(3px)" }}
            transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
            className={`w-full ${className}`}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};


// --- 3. SHARED LAYOUT ACTIVE TAB PILL ---
export interface ActiveTabPillProps {
  layoutId?: string;
  className?: string;
}

export const ActiveTabPill: React.FC<ActiveTabPillProps> = ({
  layoutId = "active-tab-indicator",
  className = "absolute inset-0 bg-primary/20 rounded border border-primary/40 -z-0",
}) => {
  return (
    <motion.div
      layoutId={layoutId}
      className={className}
      transition={SPRING_SNAPPY}
    />
  );
};


// --- 4. MOTION CARD (SURFACE ELEVATION) ---
export interface MotionCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  enableHoverElevation?: boolean;
}

export const MotionCard: React.FC<MotionCardProps> = ({
  children,
  className = "",
  enableHoverElevation = true,
  ...props
}) => {
  return (
    <motion.div
      layout
      whileHover={
        enableHoverElevation
          ? {
              y: -2,
              transition: SPRING_SMOOTH,
            }
          : undefined
      }
      className={`transition-colors ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};


// --- 5. STAGGER CONTAINER & ITEM ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: SPRING_SNAPPY,
  },
};

export const StaggerContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
};


// --- 6. COLLAPSIBLE AUTO-HEIGHT ACCORDION ---
export interface CollapsibleSectionProps {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  isOpen,
  children,
  className = "",
}) => {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={SPRING_SMOOTH}
          className={`overflow-hidden ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};


// --- 7. SHAKE BOX (ERROR NOTIFICATIONS) ---
export const ShakeBox: React.FC<{
  triggerKey: string | number;
  children: React.ReactNode;
  className?: string;
}> = ({ triggerKey, children, className = "" }) => {
  return (
    <motion.div
      key={triggerKey}
      animate={SHAKE_KEYFRAMES}
      className={className}
    >
      {children}
    </motion.div>
  );
};


// --- 8. SEAMLESS RESIZE CONTAINER (SMOOTH MORPHING FOR ANY POPUP/CARD/WIDGET) ---
export interface SeamlessResizeContainerProps {
  children: React.ReactNode;
  className?: string;
  transition?: any;
  animateWidth?: boolean;
}

export const SeamlessResizeContainer: React.FC<SeamlessResizeContainerProps> = ({
  children,
  className = "",
  transition = SPRING_RESIZE,
  animateWidth = false,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ height: number | "auto"; width?: number | "auto" }>({
    height: "auto",
    width: "auto",
  });
  const isFirstRender = useRef(true);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const measuredHeight =
        entry.borderBoxSize?.[0]?.blockSize ??
        entry.target.getBoundingClientRect().height;

      const measuredWidth =
        entry.borderBoxSize?.[0]?.inlineSize ??
        entry.target.getBoundingClientRect().width;

      if (measuredHeight > 0) {
        setSize({
          height: Math.round(measuredHeight),
          width: animateWidth ? Math.round(measuredWidth) : "auto",
        });

        if (isFirstRender.current) {
          requestAnimationFrame(() => {
            isFirstRender.current = false;
          });
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [animateWidth]);

  return (
    <motion.div
      style={{ overflow: "hidden", position: "relative" }}
      animate={{
        height: size.height,
        ...(animateWidth && size.width !== "auto" ? { width: size.width } : {}),
      }}
      transition={isFirstRender.current ? { duration: 0 } : transition}
      className={className}
    >
      <div ref={contentRef} className="w-full">
        {children}
      </div>
    </motion.div>
  );
};
