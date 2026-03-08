import { cn } from "@/lib/utils";

interface PageLoaderProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

const PageLoader = ({
  message = "Loading...",
  fullScreen = true,
  className,
}: PageLoaderProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center bg-background",
        fullScreen ? "min-h-screen" : "w-full py-16",
        className
      )}
    >
      <div className="relative h-10 w-10">
        <div className="h-10 w-10 rounded-full border-2 border-primary/20" />
        <div className="absolute inset-0 h-10 w-10 animate-spin rounded-full border-2 border-transparent border-t-primary" />
      </div>
      {message ? <p className="mt-4 text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
};

export default PageLoader;
