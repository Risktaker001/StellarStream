import {
  Account,
  Address,
  Contract,
  Keypair,
  Networks,
  SorobanRpc,
  TransactionBuilder,
  nativeToScVal,
} from "@stellar/stellar-sdk";

export type CurveTypeInput = "linear" | "exponential";

export interface StreamFeeEstimateInput {
  sender: string;
  receiver: string;
  token: string;
  totalAmount: string;
  startTime: number;
  endTime: number;
  curveType: CurveTypeInput;
  isSoulbound: boolean;
}

export interface StreamFeeEstimateResult {
  estimatedFeeXlm: string;
  estimatedFeeStroops: string;
  resourceFeeXlm: string;
  resourceFeeStroops: string;
  inclusionFeeXlm: string;
  inclusionFeeStroops: string;
  cost: {
    cpuInstructions: string;
    memoryBytes: string;
  };
}

const STROOPS_PER_XLM = 10_000_000n;

export class StreamFeeEstimationService {
  private readonly rpcServer: SorobanRpc.Server;
  private readonly contractId: string;
  private readonly networkPassphrase: string;
  private readonly methodName: string;

  constructor() {
    const rpcUrl = process.env.STELLAR_RPC_URL ?? "https://soroban-testnet.stellar.org";
    this.contractId = process.env.CONTRACT_ID ?? "";
    this.networkPassphrase =
      process.env.STELLAR_NETWORK_PASSPHRASE ?? Networks.TESTNET;
    this.methodName = process.env.CREATE_STREAM_METHOD ?? "create_stream";

    this.rpcServer = new SorobanRpc.Server(rpcUrl, {
      allowHttp: rpcUrl.startsWith("http://"),
    });
  }

  async estimateCreateStreamFee(
    input: StreamFeeEstimateInput
  ): Promise<StreamFeeEstimateResult> {
    if (!this.contractId) {
      throw new Error("CONTRACT_ID is required for stream fee estimation.");
    }

    const contract = new Contract(this.contractId);
    const source = new Account(Keypair.random().publicKey(), "0");

    const curveTypeValue = input.curveType === "exponential" ? 1 : 0;

    const tx = new TransactionBuilder(source, {
      fee: "100",
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        contract.call(
          this.methodName,
          nativeToScVal(Address.fromString(input.sender)),
          nativeToScVal(Address.fromString(input.receiver)),
          nativeToScVal(Address.fromString(input.token)),
          nativeToScVal(BigInt(input.totalAmount), { type: "i128" }),
          nativeToScVal(BigInt(input.startTime), { type: "u64" }),
          nativeToScVal(BigInt(input.endTime), { type: "u64" }),
          nativeToScVal(curveTypeValue, { type: "u32" }),
          nativeToScVal(input.isSoulbound, { type: "bool" })
        )
      )
      .setTimeout(30)
      .build();

    const simulation = await this.rpcServer.simulateTransaction(tx);
    if ("error" in simulation) {
      throw new Error(simulation.error);
    }

    const resourceFeeStroops = BigInt(simulation.minResourceFee ?? "0");
    const inclusionFeeStroops = BigInt(tx.fee);
    const estimatedFeeStroops = resourceFeeStroops + inclusionFeeStroops;

    const cost = (simulation as { cost?: { cpuInsns?: string; memBytes?: string } }).cost;

    return {
      estimatedFeeXlm: this.toXlmString(estimatedFeeStroops),
      estimatedFeeStroops: estimatedFeeStroops.toString(),
      resourceFeeXlm: this.toXlmString(resourceFeeStroops),
      resourceFeeStroops: resourceFeeStroops.toString(),
      inclusionFeeXlm: this.toXlmString(inclusionFeeStroops),
      inclusionFeeStroops: inclusionFeeStroops.toString(),
      cost: {
        cpuInstructions: cost?.cpuInsns ?? "0",
        memoryBytes: cost?.memBytes ?? "0",
      },
    };
  }

  private toXlmString(stroops: bigint): string {
    const whole = stroops / STROOPS_PER_XLM;
    const frac = stroops % STROOPS_PER_XLM;
    return `${whole.toString()}.${frac.toString().padStart(7, "0")}`;
  }
}
