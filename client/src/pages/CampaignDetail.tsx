import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount, useWalletClient } from "wagmi";
import { Navbar } from "@/components/Navbar";
import { CampaignOverview } from "@/components/campaign/CampaignOverview";
import { ActionBar } from "@/components/campaign/ActionBar";
import { SubmissionList } from "@/components/campaign/SubmissionList";
import { AddSubmissionForm } from "@/components/campaign/AddSubmissionForm";
import {
  campaignFactoryAbi,
  contractAddress,
  publicClient,
  useCampaignDetail,
  workerBaseUrl,
} from "@/lib/campaigns";
import type { Submission } from "@/types";

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "active"
      ? "status-active"
      : status === "finalized"
        ? "status-finalized"
        : "status-closed";
  const label =
    status === "active" ? "Active" : status === "finalized" ? "Finalized" : "Closed";
  return (
    <span
      className={cls}
      style={{
        fontSize: 12,
        fontWeight: 600,
        padding: "4px 10px",
        borderRadius: 9999,
        letterSpacing: "0.03em",
        textTransform: "uppercase" as const,
      }}
    >
      {label}
    </span>
  );
}

export function CampaignDetail() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const parsedCampaignId =
    campaignId && /^\d+$/.test(campaignId) ? Number(campaignId) : null;
  const { data: walletClient } = useWalletClient();
  const { isConnected, chainId } = useAccount();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [claimPendingId, setClaimPendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const hasAutoSyncedRef = useRef(false);
  const {
    data: campaign,
    isLoading,
    isError,
    error,
    refetch,
  } = useCampaignDetail(parsedCampaignId);

  async function refreshCampaign() {
    await refetch();
    await queryClient.invalidateQueries({ queryKey: ["campaigns"] });
  }

  async function handleSyncViews() {
    if (parsedCampaignId === null) {
      return;
    }

    setActionError(null);
    setIsSyncing(true);

    try {
      const res = await fetch(`${workerBaseUrl}/sync-campaign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ campaignId: parsedCampaignId }),
      });

      const data = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!res.ok) {
        throw new Error(data?.error ?? `Worker sync failed with status ${res.status}`);
      }

      await refreshCampaign();
    } catch (syncError) {
      setActionError(
        syncError instanceof Error ? syncError.message : String(syncError),
      );
    } finally {
      setIsSyncing(false);
    }
  }

  useEffect(() => {
    if (!campaign || isSyncing) {
      return;
    }

    const finalized = campaign.resultsFinalized ?? campaign.status === "finalized";
    const shouldAutoSync = !finalized && campaign.status !== "active";

    if (!shouldAutoSync || hasAutoSyncedRef.current) {
      return;
    }

    hasAutoSyncedRef.current = true;
    void handleSyncViews();
  }, [campaign, isSyncing]);

  async function handleFinalize() {
    await handleSyncViews();
  }

  async function handleClaim(id: string) {
    if (!walletClient || !contractAddress || parsedCampaignId === null || !campaign) {
      setActionError("Connect a wallet before claiming rewards.");
      return;
    }

    const submission = campaign.submissions.find((item) => item.id === id);

    if (!submission) {
      return;
    }

    setActionError(null);
    setClaimPendingId(id);

    try {
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: campaignFactoryAbi,
        functionName: "claimReward",
        args: [BigInt(parsedCampaignId), BigInt(submission.contractIndex ?? 0)],
        account: walletClient.account,
        chain: walletClient.chain,
      });

      await publicClient.waitForTransactionReceipt({ hash });
      await refreshCampaign();
    } catch (claimError) {
      setActionError(
        claimError instanceof Error ? claimError.message : String(claimError),
      );
    } finally {
      setClaimPendingId(null);
    }
  }

  async function handleAddSubmission(tweetLink: string) {
    if (!walletClient || !contractAddress || parsedCampaignId === null) {
      setActionError("Connect a wallet before submitting a post.");
      return;
    }

    setActionError(null);
    setIsSubmitting(true);

    try {
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: campaignFactoryAbi,
        functionName: "submit",
        args: [BigInt(parsedCampaignId), tweetLink],
        account: walletClient.account,
        chain: walletClient.chain,
      });

      await publicClient.waitForTransactionReceipt({ hash });
      await refreshCampaign();
    } catch (submitError) {
      setActionError(
        submitError instanceof Error ? submitError.message : String(submitError),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Not found ─────────────────────────────────────────────────
  if (parsedCampaignId === null) {
    return (
      <div className="detail-page">
        <Navbar />
        <div
          style={{
            textAlign: "center",
            padding: "120px 24px",
            color: "var(--gray-500)",
          }}
        >
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--black)", marginBottom: 8 }}>
            Campaign not found
          </h2>
          <p style={{ marginBottom: 24 }}>
            The campaign ID "{campaignId}" does not exist.
          </p>
          <Link to="/dashboard" className="btn-pill-black" style={{ display: "inline-flex" }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!contractAddress) {
    return (
      <div className="detail-page">
        <Navbar />
        <div
          style={{
            textAlign: "center",
            padding: "120px 24px",
            color: "var(--gray-500)",
          }}
        >
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--black)", marginBottom: 8 }}>
            Contract not configured
          </h2>
          <p style={{ marginBottom: 24 }}>
            Set <code>VITE_CONTRACT_ADDRESS</code> and <code>VITE_RPC_URL</code> to load campaign details.
          </p>
          <Link to="/dashboard" className="btn-pill-black" style={{ display: "inline-flex" }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="detail-page">
        <Navbar />
        <div style={{ textAlign: "center", padding: "120px 24px", color: "var(--gray-500)" }}>
          Loading campaign from chain...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="detail-page">
        <Navbar />
        <div style={{ textAlign: "center", padding: "120px 24px", color: "#ef4444" }}>
          Failed to load campaign: {error instanceof Error ? error.message : String(error)}
        </div>
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  const finalized = campaign.resultsFinalized ?? campaign.status === "finalized";
  const syncDisabledReason = finalized
    ? undefined
    : campaign.status === "active"
      ? "Views can only be synced after the campaign deadline."
      : actionError ?? undefined;
  const addSubmissionDisabled = finalized || campaign.status === "closed";
  const displayedSubmissions: Submission[] = campaign.submissions;
  const submitHint = !isConnected
    ? "Connect a wallet to submit your post on-chain."
    : chainId !== walletClient?.chain?.id
      ? "Switch your wallet to the configured campaign chain before submitting."
      : "Submitting writes directly to the contract. The creator address comes from your wallet.";

  return (
    <div className="detail-page">
      <Navbar />

      {/* Page header */}
      <div className="detail-header">
        <div className="detail-header-inner">
          <Link to="/dashboard" className="detail-back">
            <ArrowLeft size={14} /> All Campaigns
          </Link>

          <div className="detail-title-row">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                {/* Gradient dot */}
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: campaign.coverGradient,
                    flexShrink: 0,
                  }}
                />
                <h1 className="detail-title">{campaign.name}</h1>
                <StatusBadge status={finalized ? "finalized" : campaign.status} />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 8px",
                    borderRadius: 6,
                    background: "var(--gray-100)",
                    color: "var(--gray-500)",
                  }}
                >
                  {campaign.category}
                </span>
              </div>
              <p className="detail-creator">
                Created by {campaign.creatorAddress} ·{" "}
                {new Date(campaign.deadline).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            <a
              href={`https://x.com`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                color: "var(--gray-500)",
                textDecoration: "none",
              }}
            >
              <ExternalLink size={13} /> View on X
            </a>
          </div>

          {/* Description */}
          <p
            style={{
              fontSize: 13,
              color: "var(--gray-500)",
              maxWidth: 680,
              lineHeight: 1.6,
              marginTop: 12,
            }}
          >
            {campaign.description}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="detail-body">
        {/* Overview stats */}
        <CampaignOverview campaign={campaign} finalized={finalized} />

        {/* Action bar */}
        {!finalized && (
          <ActionBar
            finalized={finalized}
            isSyncing={isSyncing}
            disabled={campaign.status === "active"}
            syncDisabledReason={syncDisabledReason}
            onSyncViews={handleSyncViews}
            onFinalize={handleFinalize}
          />
        )}

        {actionError && (
          <div
            style={{
              color: "#ef4444",
              fontSize: 13,
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              padding: "12px 14px",
              borderRadius: 12,
            }}
          >
            {actionError}
          </div>
        )}

        {/* Submissions list */}
        <SubmissionList
          submissions={displayedSubmissions}
          finalized={finalized}
          onClaim={handleClaim}
          claimPendingId={claimPendingId}
        />

        {/* Add submission form */}
        <AddSubmissionForm
          disabled={addSubmissionDisabled}
          submitting={isSubmitting}
          submitHint={submitHint}
          onAdd={handleAddSubmission}
        />
      </div>
    </div>
  );
}
