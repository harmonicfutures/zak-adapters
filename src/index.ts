import { startHttpAdapter, HttpZakAdapter } from "./adapters/http";
import { SentryZakAdapter } from "./adapters/sentry";
import type { KernelRuntime, ExecutionEnvelope, KernelResult } from "./contracts/kernel";

// Re-export adapters for library usage
export { HttpZakAdapter } from "./adapters/http";
export { SentryZakAdapter } from "./adapters/sentry";

// --- MOCK KERNEL RUNTIME FOR PILOT ---
// In a real deployment, the actual Kernel instance is injected here.
// For the standalone adapter pilot, we use a compliant mock that demonstrates
// the interface without importing the sovereign core.
const mockKernel: KernelRuntime = {
  execute: async <I, O>(envelope: ExecutionEnvelope<I, O>): Promise<KernelResult<O>> => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 10));

    // Return a dummy result
    return {
      outcome: "success",
      digest: {
        nonceHash: "mock-nonce-hash-1234",
        routePlanHash: "mock-route-hash-5678"
      },
      output: { 
          msg: "Pilot Execution Successful", 
          receivedPayload: envelope.payload 
      } as O
    };
  }
};

// --- STARTUP LOGIC ---
/**
 * The Pilot can run in different modes depending on the deployment target.
 */
const ADAPTER_TYPE = process.env.ADAPTER_TYPE || "http";

function bootstrap() {
    console.log(`Starting ZAK Adapter: ${ADAPTER_TYPE}`);

    if (ADAPTER_TYPE === "http") {
        const adapter = new HttpZakAdapter(mockKernel);
        const PORT = Number(process.env.PORT) || 8080;
        startHttpAdapter(adapter, PORT);
    } 
    
    if (ADAPTER_TYPE === "sentry") {
        const adapter = new SentryZakAdapter(mockKernel);
        console.log("ZAK Ingress Sentry (XDP) Adapter active.");
        console.log("Mitigating Signaling Storms via high-performance packet filtering.");
        // In a real XDP environment, this would initialize the eBPF loader.
    }
}

// Only bootstrap if run directly (not as a module)
if (require.main === module) {
    bootstrap();
}
