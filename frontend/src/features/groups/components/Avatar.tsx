type AvatarSize = "sm" | "md" | "lg";

type AvatarProps = {
  initials: string;
  size?: AvatarSize;
  className?: string;
};

export function Avatar({
  initials,
  size = "md",
  className = "",
}: AvatarProps) {
  const sizes = {
    sm: "size-8 text-xs",
    md: "size-10 text-sm",
    lg: "size-14 text-base",
  };

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl bg-[#073f43] font-bold text-white ${sizes[size]} ${className}`}
    >
      {initials}
    </div>
  );
}
