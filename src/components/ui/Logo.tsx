interface LogoProps {
  compact?: boolean;
}

export function Logo({ compact = false }: LogoProps) {
  return compact ? <div className="logo-mark">◎</div> : <div className="logo">Instagram</div>;
}
