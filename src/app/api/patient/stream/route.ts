import { listeners, getAllPatients } from '@/lib/patientStore';
import type { Patient } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Send initial data
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send all current patients on connection
      const patients = getAllPatients();
      patients.forEach((patient) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'patient:updated', data: patient })}\n\n`)
        );
      });

      // Create listener for updates
      const listener = (patient: Patient) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'patient:updated', data: patient })}\n\n`)
          );
        } catch (error) {
          console.error('Error sending SSE message:', error);
        }
      };

      listeners.add(listener);

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        listeners.delete(listener);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
