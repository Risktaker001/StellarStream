import { toast as sonnerToast } from "sonner";
import { ExternalLink, CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";

interface ToastOptions {
  title: string;
  description?: string;
  txHash?: string;
  duration?: number;
}

const STELLAR_EXPERT_BASE = "https://stellar.expert/explorer/public";

function ViewOnStellarExpert({ txHash }: { txHash: string }) {
  return (
    <a
      href={`${STELLAR_EXPERT_BASE}/tx/${txHash}`}
      target="_blank"
      rel="noopener noreferrer"
      className="stellar-toast-link"
      onClick={(e) => e.stopPropagation()}
    >
      <span>View on Stellar.Expert</span>
      <ExternalLink size={14} />
    </a>
  );
}

export const toast = {
  success: ({ title, description, txHash, duration = 5000 }: ToastOptions) => {
    sonnerToast.custom(
      (t) => (
        <div className="stellar-toast stellar-toast-success" data-toast-id={t}>
          <div className="stellar-toast-icon">
            <CheckCircle2 size={20} />
          </div>
          <div className="stellar-toast-content">
            <div className="stellar-toast-title">{title}</div>
            {description && (
              <div className="stellar-toast-description">{description}</div>
            )}
            {txHash && <ViewOnStellarExpert txHash={txHash} />}
          </div>
          <div className="stellar-toast-progress" />
        </div>
      ),
      { duration }
    );
  },

  error: ({ title, description, txHash, duration = 6000 }: ToastOptions) => {
    sonnerToast.custom(
      (t) => (
        <div className="stellar-toast stellar-toast-error" data-toast-id={t}>
          <div className="stellar-toast-icon">
            <XCircle size={20} />
          </div>
          <div className="stellar-toast-content">
            <div className="stellar-toast-title">{title}</div>
            {description && (
              <div className="stellar-toast-description">{description}</div>
            )}
            {txHash && <ViewOnStellarExpert txHash={txHash} />}
          </div>
          <div className="stellar-toast-progress" />
        </div>
      ),
      { duration }
    );
  },

  warning: ({ title, description, duration = 5000 }: ToastOptions) => {
    sonnerToast.custom(
      (t) => (
        <div className="stellar-toast stellar-toast-warning" data-toast-id={t}>
          <div className="stellar-toast-icon">
            <AlertCircle size={20} />
          </div>
          <div className="stellar-toast-content">
            <div className="stellar-toast-title">{title}</div>
            {description && (
              <div className="stellar-toast-description">{description}</div>
            )}
          </div>
          <div className="stellar-toast-progress" />
        </div>
      ),
      { duration }
    );
  },

  info: ({ title, description, duration = 4000 }: ToastOptions) => {
    sonnerToast.custom(
      (t) => (
        <div className="stellar-toast stellar-toast-info" data-toast-id={t}>
          <div className="stellar-toast-icon">
            <Info size={20} />
          </div>
          <div className="stellar-toast-content">
            <div className="stellar-toast-title">{title}</div>
            {description && (
              <div className="stellar-toast-description">{description}</div>
            )}
          </div>
          <div className="stellar-toast-progress" />
        </div>
      ),
      { duration }
    );
  },

  // Convenience methods for common stream operations
  streamCreated: (txHash: string) => {
    toast.success({
      title: "Stream Created Successfully",
      description: "Your payment stream is now active",
      txHash,
      duration: 6000,
    });
  },

  withdrawalComplete: (amount: string, token: string, txHash: string) => {
    toast.success({
      title: "Withdrawal Complete",
      description: `${amount} ${token} transferred successfully`,
      txHash,
      duration: 6000,
    });
  },

  streamCancelled: (txHash: string) => {
    toast.info({
      title: "Stream Cancelled",
      description: "Remaining funds returned to sender",
      duration: 5000,
    });
  },

  transactionFailed: (reason?: string) => {
    toast.error({
      title: "Transaction Failed",
      description: reason || "Please try again",
      duration: 6000,
    });
  },
};
