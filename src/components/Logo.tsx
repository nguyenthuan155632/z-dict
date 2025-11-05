interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 80, className }: LogoProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: `${size * 0.24}px`,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.25)',
      }}
      className={className}
    />
  );
}
