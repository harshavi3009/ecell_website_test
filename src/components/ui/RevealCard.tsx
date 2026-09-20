"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useMotionValue, useSpring, type SpringOptions } from "motion/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Tilt-toward-cursor effect (adapted from React Bits' TiltedCard), only
// enabled on devices that actually have a mouse to hover with — see the
// canTilt check below. On phones the card is unaffected by any of this.
const TILT_SPRING: SpringOptions = { damping: 30, stiffness: 100, mass: 2 };
const TILT_ROTATE_AMPLITUDE = 12;
const TILT_SCALE_ON_HOVER = 1.05;

// Subscribes to whether the current device has a real mouse to hover with.
// Used via useSyncExternalStore so the server-rendered markup (which never
// has a mouse) matches the client's first paint, then updates safely.
const HOVER_QUERY = "(hover: hover) and (pointer: fine)";
function subscribeToHoverCapability(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia(HOVER_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}
function getHoverCapability() {
  return typeof window !== "undefined" && window.matchMedia(HOVER_QUERY).matches;
}
function getHoverCapabilityServerSnapshot() {
  return false;
}

interface RevealCardProps {
  name: string;
  role: string;
  image: string;
  sizes: string;
  delay?: number;
  // Which side this card sits on within its row. Cards on the left slide in
  // from the left, cards on the right slide in from the right, alongside the
  // rest of the reveal. "none" (single-card rows, e.g. President) skips the
  // horizontal slide and only plays the curtain + zoom-settle.
  fromSide?: "left" | "right" | "none";
}

// A photo card that reveals itself when scrolled into view: a black
// "curtain" slides up and off the photo, the photo itself settles in from a
// slight zoom, and (for cards sharing a row) the whole card slides in from
// its side. Plays once per card. Built with GSAP + its (free, bundled)
// ScrollTrigger plugin, already installed for the nav bar. After the reveal,
// desktop/mouse visitors also get a tilt-toward-cursor effect on hover (see
// TILT_* constants above); phones are untouched since they have no hover.
export default function RevealCard({
  name,
  role,
  image,
  sizes,
  delay = 0,
  fromSide = "none",
}: RevealCardProps) {
  const cardRef = useRef<HTMLElement | null>(null);
  const curtainRef = useRef<HTMLDivElement | null>(null);
  const photoRef = useRef<HTMLDivElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);

  const canTilt = useSyncExternalStore(
    subscribeToHoverCapability,
    getHoverCapability,
    getHoverCapabilityServerSnapshot,
  );
  const rotateX = useSpring(useMotionValue(0), TILT_SPRING);
  const rotateY = useSpring(useMotionValue(0), TILT_SPRING);
  const tiltScale = useSpring(1, TILT_SPRING);

  function handleTiltMove(event: React.MouseEvent<HTMLDivElement>) {
    const box = boxRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const offsetX = event.clientX - rect.left - rect.width / 2;
    const offsetY = event.clientY - rect.top - rect.height / 2;
    rotateX.set((offsetY / (rect.height / 2)) * -TILT_ROTATE_AMPLITUDE);
    rotateY.set((offsetX / (rect.width / 2)) * TILT_ROTATE_AMPLITUDE);
  }

  function handleTiltEnter() {
    tiltScale.set(TILT_SCALE_ON_HOVER);
  }

  function handleTiltLeave() {
    rotateX.set(0);
    rotateY.set(0);
    tiltScale.set(1);
  }

  useEffect(() => {
    const card = cardRef.current;
    const curtain = curtainRef.current;
    const photo = photoRef.current;
    if (!card || !curtain || !photo) return;

    const startX = fromSide === "left" ? -180 : fromSide === "right" ? 180 : 0;

    const ctx = gsap.context(() => {
      gsap.set(curtain, { scaleY: 1, transformOrigin: "bottom" });
      gsap.set(photo, { scale: 1.15 });
      if (fromSide !== "none") {
        gsap.set(card, { x: startX, opacity: 0 });
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          toggleActions: "play none none none",
        },
        delay,
      });

      tl.to(curtain, { scaleY: 0, duration: 0.9, ease: "power3.inOut" }, 0);
      tl.to(photo, { scale: 1, duration: 1.1, ease: "power3.out" }, 0);
      if (fromSide !== "none") {
        tl.to(card, { x: 0, opacity: 1, duration: 1, ease: "power3.out" }, 0);
      }
    });

    return () => ctx.revert();
  }, [delay, fromSide]);

  return (
    <figure
      ref={cardRef}
      className="flex w-72 flex-col items-center text-center [perspective:800px] sm:w-80 md:w-96"
    >
      <motion.div
        ref={boxRef}
        className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-black/5 [transform-style:preserve-3d]"
        style={canTilt ? { rotateX, rotateY, scale: tiltScale } : undefined}
        onMouseMove={canTilt ? handleTiltMove : undefined}
        onMouseEnter={canTilt ? handleTiltEnter : undefined}
        onMouseLeave={canTilt ? handleTiltLeave : undefined}
      >
        <div ref={photoRef} className="absolute inset-0">
          <Image src={image} alt={name} fill sizes={sizes} className="object-cover" />
        </div>
        <div ref={curtainRef} className="absolute inset-0 z-10 bg-black" />
      </motion.div>
      <figcaption className="mt-3">
        <p className="text-lg font-semibold sm:text-xl">{name}</p>
        <p className="text-sm opacity-70 sm:text-base">{role}</p>
      </figcaption>
    </figure>
  );
}
