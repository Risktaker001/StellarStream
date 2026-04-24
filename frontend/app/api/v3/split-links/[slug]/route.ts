import { NextRequest, NextResponse } from "next/server";

export interface SplitLinkPublicPayload {
    slug: string;
    orgName: string;
    totalSplitAmount: string;
    tokenSymbol: string;
    status: "Claim Pending" | "Paid Out" | "Processing" | "Awaiting Wallet";
    isClaimBased: boolean;
    trustScore: number;
    details: string;
    createdAt: string;
}

function buildMockSplitLink(slug: string): SplitLinkPublicPayload {
    const claimBased = slug.includes("claim") || slug.length % 2 === 0;
    const score = 70 + (slug.length % 31);
    const totalSplitAmount = claimBased ? "$23,500.00" : "$17,200.00";
    const status = claimBased ? "Claim Pending" : "Processing";

    return {
        slug,
        orgName: claimBased ? "Stellar Institutional Holdings" : "Lumen Capital Partners",
        totalSplitAmount,
        tokenSymbol: "USDC",
        status,
        isClaimBased: claimBased,
        trustScore: score,
        details: claimBased
            ? "This payment is held for your wallet. Connect to claim the funds instantly."
            : "Your split is being prepared. Connect your wallet to monitor the claim status and view payment details.",
        createdAt: new Date().toISOString(),
    };
}

export async function GET(_req: NextRequest, { params }: { params: { slug?: string } }) {
    const slug = params?.slug;
    if (!slug) {
        return NextResponse.json({ error: "Missing split link identifier." }, { status: 400 });
    }

    const link = buildMockSplitLink(slug);
    return NextResponse.json(link);
}
