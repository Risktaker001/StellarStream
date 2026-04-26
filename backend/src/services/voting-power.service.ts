import {
  Account,
  Address,
  Contract,
  Keypair,
  Networks,
  SorobanRpc,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
  xdr,
} from "@stellar/stellar-sdk";
import { prisma } from "../lib/db.js";
import { StreamStatus } from "../generated/client/index.js";
import { logger } from "../logger.js";

export interface VotingPowerResult {
  address: string;
  stakedBalance: string;
  activeStreamingVolume: string;
  votingPower: string;
  cached: boolean;
  fetchedAt: string;
  expiresAt: string;
}

interface CachedVotingPower {
  expiresAtMs: number;
  value: Omit<VotingPowerResult, "cached">;
}

export class VotingPowerService {
  private readonly rpcServer: SorobanRpc.Server;
  private readonly contractId: string;
  private readonly networkPassphrase: string;
  private readonly cacheTtlMs: number;
  private readonly stakedBalanceMethods: string[];
  private readonly cache = new Map<string, CachedVotingPower>();

  constructor() {
    const rpcUrl = process.env.STELLAR_RPC_URL ?? "https://soroban-testnet.stellar.org";
    this.contractId = process.env.CONTRACT_ID ?? "";
    this.networkPassphrase =
      process.env.STELLAR_NETWORK_PASSPHRASE ?? Networks.TESTNET;
    this.cacheTtlMs = Number(process.env.VOTING_POWER_CACHE_TTL_SECONDS ?? 30) * 1000;
    this.stakedBalanceMethods = (
      process.env.STAKED_BALANCE_METHODS ??
      "get_staked_balance,staked_balance,get_stake,get_voting_power"
    )
      .split(",")
      .map((method) => method.trim())
      .filter((method) => method.length > 0);

    this.rpcServer = new SorobanRpc.Server(rpcUrl, {
      allowHttp: rpcUrl.startsWith("http://"),
    });
  }

  async getVotingPower(address: string): Promise<VotingPowerResult> {
    const cacheKey = address.trim();
    const now = Date.now();
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAtMs > now) {
      return { ...cached.value, cached: true };
    }

    const [stakedBalance, activeStreamingVolume] = await Promise.all([
      this.fetchStakedBalance(cacheKey),
      this.fetchActiveStreamingVolume(cacheKey),
    ]);

    const votingPower = (stakedBalance + activeStreamingVolume).toString();
    const fetchedAt = new Date(now).toISOString();
    const expiresAt = new Date(now + this.cacheTtlMs).toISOString();

    const uncached: Omit<VotingPowerResult, "cached"> = {
      address: cacheKey,
      stakedBalance: stakedBalance.toString(),
      activeStreamingVolume: activeStreamingVolume.toString(),
      votingPower,
      fetchedAt,
      expiresAt,
    };

    this.cache.set(cacheKey, {
      value: uncached,
      expiresAtMs: now + this.cacheTtlMs,
    });

    return { ...uncached, cached: false };
  }

  private async fetchActiveStreamingVolume(address: string): Promise<bigint> {
    const streams = await prisma.stream.findMany({
      where: {
        status: StreamStatus.ACTIVE,
        OR: [{ sender: address }, { receiver: address }],
      },
      select: {
        amount: true,
        withdrawn: true,
      },
    });

    return streams.reduce((total, stream) => {
      const amount = this.toBigIntOrZero(stream.amount);
      const withdrawn = this.toBigIntOrZero(stream.withdrawn ?? "0");
      const remaining = amount > withdrawn ? amount - withdrawn : 0n;
      return total + remaining;
    }, 0n);
  }

  private async fetchStakedBalance(address: string): Promise<bigint> {
    if (!this.contractId) {
      logger.warn("CONTRACT_ID is not configured; defaulting staked balance to 0");
      return 0n;
    }

    const contract = new Contract(this.contractId);
    const source = new Account(Keypair.random().publicKey(), "0");
    const addressArg = nativeToScVal(Address.fromString(address));

    for (const method of this.stakedBalanceMethods) {
      try {
        const tx = new TransactionBuilder(source, {
          fee: "100",
          networkPassphrase: this.networkPassphrase,
        })
          .addOperation(contract.call(method, addressArg))
          .setTimeout(30)
          .build();

        const simulation = await this.rpcServer.simulateTransaction(tx);
        if ("error" in simulation) {
          continue;
        }

        const retval = simulation.result?.retval;
        if (!retval) {
          continue;
        }

        const parsed = this.parseScValResult(retval);
        if (parsed !== null) {
          return parsed;
        }
      } catch (error) {
        logger.debug("Staked balance query method failed", {
          method,
          address,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    logger.warn("No staked balance method responded; defaulting to 0", { address });
    return 0n;
  }

  private parseScValResult(value: unknown): bigint | null {
    try {
      if (typeof value === "string") {
        const scVal = xdr.ScVal.fromXDR(value, "base64");
        return this.toBigInt(scValToNative(scVal));
      }
      if (value instanceof xdr.ScVal) {
        return this.toBigInt(scValToNative(value));
      }
      return this.toBigInt(value);
    } catch {
      return null;
    }
  }

  private toBigInt(value: unknown): bigint | null {
    if (typeof value === "bigint") {
      return value;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return BigInt(Math.trunc(value));
    }
    if (typeof value === "string" && value.trim().length > 0) {
      try {
        return BigInt(value);
      } catch {
        return null;
      }
    }
    return null;
  }

  private toBigIntOrZero(value: string): bigint {
    const parsed = this.toBigInt(value);
    return parsed ?? 0n;
  }
}
