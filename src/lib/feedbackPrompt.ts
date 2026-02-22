export const FEEDBACK_NUDGE_EVENT = "hirely:feedback-nudge";
const FEEDBACK_FUNNEL_KEY = "hirely:feedback-funnel:v1";

export type FeedbackNudgeDetail = {
  source: string;
  route?: string;
};

type FeedbackFunnelSnapshot = {
  counts: Record<string, number>;
  lastEventAt: string | null;
  lastSource: string | null;
};

const readFeedbackFunnel = (): FeedbackFunnelSnapshot => {
  if (typeof window === "undefined") {
    return { counts: {}, lastEventAt: null, lastSource: null };
  }

  try {
    const rawValue = localStorage.getItem(FEEDBACK_FUNNEL_KEY);
    if (!rawValue) {
      return { counts: {}, lastEventAt: null, lastSource: null };
    }

    const parsed = JSON.parse(rawValue) as Partial<FeedbackFunnelSnapshot>;
    return {
      counts:
        parsed.counts && typeof parsed.counts === "object" ? parsed.counts : {},
      lastEventAt: parsed.lastEventAt || null,
      lastSource: parsed.lastSource || null,
    };
  } catch {
    return { counts: {}, lastEventAt: null, lastSource: null };
  }
};

export const trackFeedbackFunnel = (eventName: string, source = "unknown") => {
  if (typeof window === "undefined") {
    return;
  }

  const snapshot = readFeedbackFunnel();
  const nextCount = (snapshot.counts[eventName] || 0) + 1;

  snapshot.counts[eventName] = nextCount;
  snapshot.lastSource = source;
  snapshot.lastEventAt = new Date().toISOString();

  localStorage.setItem(FEEDBACK_FUNNEL_KEY, JSON.stringify(snapshot));
};

export const dispatchFeedbackNudge = (detail: FeedbackNudgeDetail) => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<FeedbackNudgeDetail>(FEEDBACK_NUDGE_EVENT, {
      detail,
    }),
  );
};
