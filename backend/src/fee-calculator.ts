export interface RawFeeData {
  minResourceFee: number; // stroops, from RPC response
  inclusionFee: number;   // stroops, base fee from transaction
}

export interface BufferedFees {
  inclusionFeeStroops: number;
  resourceFeeStroops: number; // ceil(minResourceFee * 1.10)
  totalFeeStroops: number;    // inclusionFeeStroops + resourceFeeStroops
}

export function applyBuffer(raw: RawFeeData): BufferedFees {
  const inclusionFeeStroops = Math.max(0, Math.trunc(raw.inclusionFee));
  const resourceFeeStroops = Math.ceil(raw.minResourceFee * 1.10);
  const totalFeeStroops = inclusionFeeStroops + resourceFeeStroops;

  return { inclusionFeeStroops, resourceFeeStroops, totalFeeStroops };
}
