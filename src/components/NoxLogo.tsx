export function NoxMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <defs>
        <path id="nx-n" d="M10 8H16L32 30V8H38V40H32L16 18V40H10Z" />
        <clipPath id="nx-top"><rect width="48" height="18" /></clipPath>
        <clipPath id="nx-mid"><rect y="20" width="48" height="8" /></clipPath>
        <clipPath id="nx-bot"><rect y="30" width="48" height="18" /></clipPath>
      </defs>
      <g clipPath="url(#nx-top)"><use href="#nx-n" fill="currentColor" /></g>
      <g clipPath="url(#nx-mid)"><use href="#nx-n" fill="#3dffa2" transform="translate(4 0)" /></g>
      <g clipPath="url(#nx-bot)"><use href="#nx-n" fill="currentColor" /></g>
    </svg>
  );
}

export function NoxLogo() {
  return (
    <a href="https://noxcipher.site" className="inline-flex items-center gap-2.5" aria-label="NoxCipher home">
      <NoxMark className="h-[30px] w-[30px] text-nox-text" />
      <span className="text-[17px] font-semibold tracking-[-0.01em]">
        nox<span className="font-medium text-nox-muted">cipher</span>
      </span>
    </a>
  );
}
