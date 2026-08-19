type UserAvatarProps = {
  src?: string | null;
  initials: string;
  className?: string;
};

export function UserAvatar({ src, initials, className }: UserAvatarProps) {
  return (
    <span className={className} aria-hidden>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="user-avatar-photo" />
      ) : (
        initials
      )}
    </span>
  );
}
