import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import "./team-section.css";

export interface AnimatedTeamMember {
  id: string;
  name: string;
  image: string;
}

interface AnimatedTeamSectionProps {
  members: AnimatedTeamMember[];
  direction: "rtl" | "ltr";
  renderLink: (member: AnimatedTeamMember, children: ReactNode) => ReactNode;
  className?: string;
}

/** A responsive version of the supplied fan; never hides members off screen. */
export function AnimatedTeamSection({
  members,
  direction,
  renderLink,
  className,
}: AnimatedTeamSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => entry && setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const cardSize = width >= 900 ? 150 : width >= 600 ? 140 : 112;
  const spread = width >= 900 ? 105 : 76;
  const perRow = Math.max(1, Math.min(9, Math.floor((width - cardSize - 70) / spread) + 1));
  const groups = Array.from({ length: Math.ceil(members.length / perRow) }, (_, i) =>
    members.slice(i * perRow, (i + 1) * perRow),
  );
  return (
    <div ref={ref} className={cn("team-fan w-full min-w-0", className)}>
      {groups.map((group) => (
        <FanRow
          key={group[0]!.id}
          members={group}
          direction={direction}
          size={cardSize}
          spread={spread}
          renderLink={renderLink}
        />
      ))}
    </div>
  );
}

function FanRow({
  members,
  direction,
  size,
  spread,
  renderLink,
}: AnimatedTeamSectionProps & { size: number; spread: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className="team-fan-row" data-visible={visible} style={{ height: size + 180 }}>
      {members.map((member, index) => {
        const distance = index - (members.length - 1) / 2;
        const sign = direction === "rtl" ? -1 : 1;
        const style = {
          "--fan-x": `${distance * spread * sign}px`,
          "--fan-y": `${Math.abs(distance) * -14}px`,
          "--fan-angle": `${distance * 7 * sign}deg`,
          "--fan-delay": `${index * 70}ms`,
          "--fan-layer": members.length - Math.abs(distance),
          width: size,
        } as CSSProperties;
        return (
          <div key={member.id} className="team-fan-card" style={style}>
            {renderLink(
              member,
              <>
                <img
                  src={member.image}
                  alt=""
                  loading="lazy"
                  width={size}
                  height={size}
                  className="aspect-square w-full rounded-t-xl object-cover"
                  draggable={false}
                />
                <span className="flex h-11 items-center justify-center px-2 text-center text-xs font-bold text-foreground">
                  <span className="truncate">{member.name}</span>
                </span>
              </>,
            )}
          </div>
        );
      })}
    </div>
  );
}
