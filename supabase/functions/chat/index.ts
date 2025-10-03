import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const AI_MODEL = "google/gemini-2.5-flash";

const MAIN_AGENT_ID = "culinary-director";
const RECIPE_WRITER_AGENT_ID = "michelin-writer";
const REVIEWER_AGENT_ID = "culinary-reviewer";

const MAX_REVIEW_ROUNDS = 3;

const MAIN_AGENT_SYSTEM_PROMPT = `You are the ${MAIN_AGENT_ID}, a senior culinary director orchestrating Michelin-starred recipe development. Your job is to analyze the full conversation with the guest and produce a concise creative brief for the recipe-writing chef along with a rigorous evaluation rubric.

Respond ONLY as minified JSON with this shape:
{
  "writerBrief": "<clear instructions for the writer>",
  "rubric": [
    {
      "criterion": "Name of dimension",
      "expectations": "Concrete expectations the reviewer must verify"
    }
  ],
  "failureConditions": ["Specific automatic-fail scenarios"]
}

Keep the brief chef-friendly and reference any important preferences from the guest. Ensure the rubric covers structure, authenticity, nutrition table completeness, and recipe-json validity.`;

const WRITER_SYSTEM_PROMPT = `You are the ${RECIPE_WRITER_AGENT_ID}, a Michelin Star award-winning Master Chef and Culinary Instructor specializing in classical European and American cuisines, including expertise in American smoking and barbecue techniques. Your recipes and culinary guidance are inspired by Paul Bocuse, blending tradition with meticulous technique.

**COMMUNICATION STYLE:**
- Use a creative, friendly, and encouraging tone to build user confidence.
- Maintain professional, globally-aware communication.
- Engage in natural culinary conversations, answering questions about techniques, ingredients, cooking methods, and food culture.
- If the request falls outside your specialization areas (classical European, American, smoking/barbecue), respond courteously and professionally while explaining your limitations.

**RECIPE GENERATION BEHAVIOR:**
- When the guest requests a dish, immediately provide the complete recipe—do not ask for confirmation.

**OPERATIONAL REQUIREMENTS:**
- Begin with a concise checklist (3-7 bullet points) outlining the main tasks for the request.
- After the recipe, validate that all essential components are present and mention any assumptions.

**RECIPE STRUCTURE:**
- Follow this exact Markdown structure:
  1. Introduction – elegant description with historical reference.
  2. Tips – instructor-level guidance.
  3. Equipment & Advanced Preparation – list equipment and prep.
  4. Ingredients – Markdown table ordered by use with weight then volume, include yield.
  5. Step By Step Instructions – numbered steps.
  6. Nutritional Information – table with per-serving estimates.

**STRUCTURED RECIPE DATA:**
- Append a valid \`\`\`recipe-json code block with the structured recipe fields exactly as specified.

**AUTHENTICITY:**
- Respect regional fidelity and clearly mark modern adaptations.`;

const REVIEWER_SYSTEM_PROMPT = `You are the ${REVIEWER_AGENT_ID}, a meticulous culinary reviewer. Evaluate drafts from the recipe writer against the provided rubric.

Respond ONLY as minified JSON with this shape:
{
  "passed": true|false,
  "score": number (0-100),
  "feedback": "Targeted guidance to address any gaps"
}

If any failure condition is met, set passed to false and explain exactly what must change.`;

const encoder = new TextEncoder();

function formatSSEEvent(data: Record<string, unknown>) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

async function callLovableChat(
  apiKey: string,
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  signal?: AbortSignal,
) {
  const response = await fetch(AI_GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages,
      stream: false,
    }),
    signal,
  });

  if (response.status === 429) {
    throw new Error("Rate limits exceeded. Please try again in a moment.");
  }
  if (response.status === 402) {
    throw new Error("AI usage credits depleted. Please add credits to continue.");
  }
  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI gateway error:", response.status, errorText);
    throw new Error("AI service temporarily unavailable.");
  }

  const body = await response.json();
  const content = body?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("Unexpected AI response format.");
  }
  return content.trim();
}

function sanitizeJsonPayload(raw: string) {
  const trimmed = raw.trim();
  if (trimmed.startsWith("```")) {
    return trimmed.replace(/```json|```/gi, "").trim();
  }
  return trimmed;
}

function conversationTranscript(messages: Array<{ role: string; content: string }>) {
  return messages
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join("\n");
}

serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (event: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(formatSSEEvent(event)));
      };

      (async () => {
        try {
          const { messages } = await req.json();
          const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

          if (!LOVABLE_API_KEY) {
            throw new Error("LOVABLE_API_KEY is not configured");
          }

          if (!Array.isArray(messages)) {
            throw new Error("Invalid request payload: messages array is required.");
          }

          console.log("Received chat request with", messages.length, "messages");

          const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
          const acknowledgement = lastUserMessage?.content
            ? `Chef brigade received your request: "${lastUserMessage.content.slice(0, 120)}"`
            : "Chef brigade received your request.";

          sendEvent({ type: "status", content: `${acknowledgement} Coordinating specialists…` });

          const transcript = conversationTranscript(messages);

          sendEvent({ type: "status", content: "Drafting creative brief and evaluation rubric…" });

          const mainAgentRaw = await callLovableChat(LOVABLE_API_KEY, [
            { role: "system", content: MAIN_AGENT_SYSTEM_PROMPT },
            {
              role: "user",
              content: `Conversation transcript for analysis:\n\n${transcript}`,
            },
          ]);

          let mainAgent;
          try {
            mainAgent = JSON.parse(sanitizeJsonPayload(mainAgentRaw));
          } catch (error) {
            console.error("Failed to parse main agent response", error, mainAgentRaw);
            throw new Error("Failed to generate creative brief. Please try again.");
          }

          const writerBrief: string = mainAgent.writerBrief;
          const rubric = Array.isArray(mainAgent.rubric) ? mainAgent.rubric : [];
          const failureConditions: string[] = Array.isArray(mainAgent.failureConditions)
            ? mainAgent.failureConditions
            : [];

          if (!writerBrief || rubric.length === 0) {
            throw new Error("Incomplete creative brief generated by main agent.");
          }

          sendEvent({ type: "status", content: "Brief ready. Commissioning recipe draft…" });

          let approvedDraft = "";
          let finalFeedback = "";

          for (let attempt = 1; attempt <= MAX_REVIEW_ROUNDS; attempt++) {
            const feedbackNote = finalFeedback
              ? `\n\nReviewer feedback from previous round:\n${finalFeedback}`
              : "";

            const writerMessages = [
              { role: "system", content: WRITER_SYSTEM_PROMPT },
              {
                role: "user",
                content: `Chef brief:\n${writerBrief}\n\nQuality rubric reference:\n${JSON.stringify(
                  rubric,
                  null,
                  2,
                )}\n\nFailure conditions to avoid:\n${failureConditions.join("; ") || "None explicitly provided."}\n\nConversation history (most recent last):\n${transcript}${feedbackNote}`,
              },
            ];

            sendEvent({
              type: "status",
              content: `Attempt ${attempt}/${MAX_REVIEW_ROUNDS}: drafting recipe…`,
            });

            const draft = await callLovableChat(LOVABLE_API_KEY, writerMessages);

            sendEvent({
              type: "status",
              content: `Attempt ${attempt}/${MAX_REVIEW_ROUNDS}: reviewing draft for quality…`,
            });

            const reviewerMessages = [
              { role: "system", content: REVIEWER_SYSTEM_PROMPT },
              {
                role: "user",
                content: `Rubric:${JSON.stringify(rubric)}\nFailure conditions:${JSON.stringify(
                  failureConditions,
                )}\n\nDraft to review:\n${draft}`,
              },
            ];

            const reviewRaw = await callLovableChat(LOVABLE_API_KEY, reviewerMessages);

            let review;
            try {
              review = JSON.parse(sanitizeJsonPayload(reviewRaw));
            } catch (error) {
              console.error("Failed to parse reviewer response", error, reviewRaw);
              throw new Error("Review step failed due to unexpected response. Please retry.");
            }

            if (review.passed) {
              sendEvent({ type: "status", content: "Recipe approved. Finalizing response…" });
              approvedDraft = draft;
              break;
            }

            finalFeedback = typeof review.feedback === "string" ? review.feedback : "";

            if (attempt < MAX_REVIEW_ROUNDS) {
              sendEvent({
                type: "status",
                content: `Reviewer feedback for revision: ${finalFeedback || "Please address rubric gaps."}`,
              });
            }
          }

          if (!approvedDraft) {
            const failureMessage =
              finalFeedback ||
              "Unable to satisfy the quality rubric within the retry limit. Please adjust the request and try again.";
            sendEvent({ type: "error", content: failureMessage });
            controller.close();
            return;
          }

          sendEvent({ type: "assistant", content: approvedDraft });
          controller.close();
        } catch (e) {
          console.error("Chat workflow error:", e);
          const message = e instanceof Error ? e.message : "An unexpected error occurred";
          controller.enqueue(encoder.encode(formatSSEEvent({ type: "error", content: message })));
          controller.close();
        }
      })();
    },
    cancel() {
      console.log("Client disconnected from chat stream.");
    },
  });

  return new Response(stream, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
  });
});
