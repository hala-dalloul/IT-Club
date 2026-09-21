import type { CSSProperties } from "react";
import { Code2, GraduationCap, Lightbulb, Users, CalendarDays } from "lucide-react";
import "./builders-community-hero.css";

interface CommunityOrbitProps {
  ar: boolean;
  logo: string;
  members: { id: string; name: string; image: string }[];
}

/** Club-themed adaptation of the community orbit, with real member images. */
export default function CommunityOrbit({ ar, logo, members }: CommunityOrbitProps) {
  const badges = [
    { angle: 145, ring: 42, icon: Code2, label: ar ? "تقنية" : "Technology" },
    { angle: 90, ring: 42, icon: Lightbulb, label: ar ? "ابتكار" : "Innovation" },
    { angle: 35, ring: 42, icon: GraduationCap, label: ar ? "تعلّم" : "Learning" },
  ];
  const avatars = members.slice(0, 4);
  return (
    <div className="community-orbit" aria-label={ar ? "مجتمع النادي" : "Club community"}>
      <svg viewBox="0 0 1000 360" fill="none" aria-hidden="true" className="community-orbit-lines">
        <path d="M 55 360 A 460 460 0 0 1 945 360" pathLength="1" />
        <path d="M 157 360 A 365 365 0 0 1 843 360" pathLength="1" />
      </svg>
      {badges.map(({ angle, ring, icon: Icon, label }, i) => (
        <div
          key={label}
          className="community-orbit-node"
          style={
            {
              left: `${50 + ring * Math.cos((angle * Math.PI) / 180)}%`,
              top: `${(470 - ring * 10 * Math.sin((angle * Math.PI) / 180)) / 3.6}%`,
              "--orbit-delay": `${i * 0.15}s`,
            } as CSSProperties
          }
        >
          <span className="community-orbit-pill">
            <Icon size={16} />
            <span>{label}</span>
          </span>
        </div>
      ))}
      {[145, 115, 65, 35].map((angle, i) => {
        const member = avatars[i];
        const Icon = i % 2 ? CalendarDays : Users;
        return (
          <div
            key={member?.id ?? angle}
            className="community-orbit-node"
            style={
              {
                left: `${50 + 34 * Math.cos((angle * Math.PI) / 180)}%`,
                top: `${(470 - 340 * Math.sin((angle * Math.PI) / 180)) / 3.6}%`,
                "--orbit-delay": `${0.3 + i * 0.12}s`,
              } as CSSProperties
            }
          >
            <div className="community-orbit-avatar">
              {member ? (
                <img src={member.image} alt={member.name} width={72} height={72} loading="lazy" />
              ) : (
                <Icon aria-hidden="true" />
              )}
            </div>
          </div>
        );
      })}
      <img
        src={logo}
        alt="UCAS IT CLUB"
        width={100}
        height={128}
        className="community-orbit-logo"
      />
    </div>
  );
}
