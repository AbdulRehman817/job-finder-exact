import { cn } from "@/lib/utils";

const BRAND_LOGO_SRC = "/logo.png";

interface BrandLogoProps {
  className?: string;
  imageWrapperClassName?: string;
  imageClassName?: string;
  textClassName?: string;
  showText?: boolean;
}

const BrandLogo = ({
  className,
  imageWrapperClassName,
  imageClassName,
  textClassName,
  showText = true,
}: BrandLogoProps) => {
  return (
    <div className={cn("flex items-center gap-2.5 shrink-0", className)}>
      <span
        className={cn(
          "relative block h-10 w-10 overflow-hidden rounded-lg",
          imageWrapperClassName
        )}
      >
        <img
          src={BRAND_LOGO_SRC}
          alt="Hirelypk logo"
          className={cn(
            "h-full w-full object-cover object-center scale-[2.1]",
            imageClassName
          )}
        />
      </span>
      {showText ? (
        <span
          className={cn(
            "text-xl font-bold leading-none ml-[-30px] tracking-tight text-foreground",
            textClassName
          )}
        >
          Hirelypk
        </span>
      ) : null}
    </div>
  );
};

export default BrandLogo;

