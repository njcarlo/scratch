import { Button } from "../ui/Button";
import { ChevronLeftIcon } from "../icons";
import { useT } from "@/lib/i18n";

export function OnboardingShell({
  step,
  totalSteps,
  title,
  subtitle,
  children,
  onBack,
  onNext,
  onSkip,
  nextLabel,
  nextDisabled,
}: {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onBack?: () => void;
  onNext: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}) {
  const t = useT();
  return (
    <div className="flex min-h-dvh flex-col bg-cream-50 px-5 pb-6 pt-5">
      <div className="mb-6 flex items-center gap-3">
        {onBack ? (
          <button
            onClick={onBack}
            aria-label={t("common.back")}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-600 hover:bg-ink-50"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
        ) : (
          <div className="h-9 w-9" />
        )}
        <div className="flex flex-1 gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i <= step ? "bg-teal-600" : "bg-ink-100"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1">
        <h1 className="text-2xl font-semibold leading-snug text-ink-900">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-[15px] leading-relaxed text-ink-600">
            {subtitle}
          </p>
        )}
        <div className="mt-6">{children}</div>
      </div>

      <div className="mt-8 flex flex-col gap-2">
        <Button onClick={onNext} disabled={nextDisabled} fullWidth>
          {nextLabel ?? t("common.next")}
        </Button>
        {onSkip && (
          <Button onClick={onSkip} variant="ghost" fullWidth>
            {t("common.skip")}
          </Button>
        )}
      </div>
    </div>
  );
}
