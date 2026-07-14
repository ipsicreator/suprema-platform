type Step3TopicLike = {
  id?: string;
  [key: string]: unknown;
};

type Step3SessionPayload = {
  subject: string;
  careerHint: string;
  topics: Step3TopicLike[];
};

export function buildStep3SessionPayload(payload: Step3SessionPayload) {
  return {
    subject: payload.subject,
    careerHint: payload.careerHint,
    topics: payload.topics,
  };
}

export function removeCustomTopic<T extends Step3TopicLike>(topics: T[], id: string) {
  return topics.filter((item) => item.id !== id);
}

export function resetCustomTopics<T extends Step3TopicLike>() {
  return [] as T[];
}
