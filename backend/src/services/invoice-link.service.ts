import { prisma } from "../lib/db.js";
import { v4 as uuidv4 } from "uuid";

export interface CreateInvoiceLinkInput {
  sender: string;
  receiver: string;
  amount: string;
  tokenAddress: string;
  duration: number;
  description?: string;
  pdfUrl?: string;
  expiresAt?: Date;
}

export interface InvoiceLinkResponse {
  id: string;
  slug: string;
  sender: string;
  receiver: string;
  amount: string;
  tokenAddress: string;
  duration: number;
  description?: string;
  pdfUrl?: string;
  xdrParams: string;
  status: string;
  expiresAt?: Date;
  createdAt: Date;
  shareUrl: string;
}

export class InvoiceLinkService {
  /**
   * Generate XDR parameters for stream initialization
   */
  private generateXdrParams(input: CreateInvoiceLinkInput): string {
    // Encode stream parameters as XDR-compatible JSON
    const params = {
      receiver: input.receiver,
      amount: input.amount,
      tokenAddress: input.tokenAddress,
      duration: input.duration,
      startTime: Math.floor(Date.now() / 1000),
    };
    return Buffer.from(JSON.stringify(params)).toString("base64");
  }

  /**
   * Create a new invoice link (draft)
   */
  async createInvoiceLink(
    input: CreateInvoiceLinkInput,
  ): Promise<InvoiceLinkResponse> {
    const slug = uuidv4().split("-")[0]; // Short UUID
    const xdrParams = this.generateXdrParams(input);

    const link = await prisma.invoiceLink.create({
      data: {
        slug,
        sender: input.sender,
        receiver: input.receiver,
        amount: input.amount,
        tokenAddress: input.tokenAddress,
        duration: input.duration,
        description: input.description,
        pdfUrl: input.pdfUrl,
        xdrParams,
        status: "DRAFT",
        expiresAt: input.expiresAt,
      },
    });

    return this.formatResponse(link);
  }

  /**
   * Retrieve invoice link by slug
   */
  async getInvoiceLinkBySlug(slug: string): Promise<InvoiceLinkResponse | null> {
    const link = await prisma.invoiceLink.findUnique({
      where: { slug },
    });

    if (!link) return null;

    // Check expiration
    if (link.expiresAt && link.expiresAt < new Date()) {
      await prisma.invoiceLink.update({
        where: { id: link.id },
        data: { status: "EXPIRED" },
      });
      return null;
    }

    return this.formatResponse(link);
  }

  /**
   * Update invoice link status (e.g., DRAFT → SIGNED → COMPLETED)
   */
  async updateInvoiceLinkStatus(
    id: string,
    status: string,
  ): Promise<InvoiceLinkResponse> {
    const link = await prisma.invoiceLink.update({
      where: { id },
      data: { status },
    });

    return this.formatResponse(link);
  }

  /**
   * List invoice links for a sender
   */
  async listInvoiceLinks(
    sender: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<InvoiceLinkResponse[]> {
    const links = await prisma.invoiceLink.findMany({
      where: { sender },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    return links.map((link) => this.formatResponse(link));
  }

  /**
   * Delete an invoice link
   */
  async deleteInvoiceLink(id: string): Promise<void> {
    await prisma.invoiceLink.delete({
      where: { id },
    });
  }

  /**
   * Format response with share URL
   */
  private formatResponse(link: any): InvoiceLinkResponse {
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    return {
      id: link.id,
      slug: link.slug,
      sender: link.sender,
      receiver: link.receiver,
      amount: link.amount,
      tokenAddress: link.tokenAddress,
      duration: link.duration,
      description: link.description,
      pdfUrl: link.pdfUrl,
      xdrParams: link.xdrParams,
      status: link.status,
      expiresAt: link.expiresAt,
      createdAt: link.createdAt,
      shareUrl: `${baseUrl}/invoice/${link.slug}`,
    };
  }
}

export const invoiceLinkService = new InvoiceLinkService();
