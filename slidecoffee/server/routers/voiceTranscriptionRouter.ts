import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { transcribeAudio } from "../_core/voiceTranscription";

export const voiceTranscriptionRouter = router({
  transcribe: protectedProcedure
    .input(z.object({
      audioUrl: z.string().url(),
      language: z.string().optional(),
      prompt: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const result = await transcribeAudio({
        audioUrl: input.audioUrl,
        language: input.language,
        prompt: input.prompt,
      });
      
      if ('error' in result) {
        throw new Error(result.error);
      }
      
      return {
        text: result.text,
        language: result.language,
        segments: result.segments,
      };
    }),
});

