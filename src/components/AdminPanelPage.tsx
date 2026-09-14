import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { Input } from "./ui/Input";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Smartphone,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Save,
  UserCheck,
  ExternalLink,
  DollarSign,
  Users,
  Database,
  Key,
  AlertTriangle,
  ArrowUpRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { useUser } from "@clerk/react";
import { isUserAdmin, ADMIN_EMAILS } from "../lib/admin";
import {
  getAdminPaymentSettings,
  saveAdminPaymentSettings,
  getAdminVerifications,
  processVerificationAction,
  adminDirectUpgradeUser,
} from "../lib/supabase";

interface AdminPanelPageProps {
  onBackToDashboard: () => void;
  onNavigateToPricing: () => void;
}

export const AdminPanelPage: React.FC<AdminPanelPageProps> = ({
  onBackToDashboard,
  onNavigateToPricing,
}) => {
  const { user } = useUser();
  const isAdmin = isUserAdmin(user);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<"gateways" | "verifications" | "manual" | "overview">("gateways");

  // Form State for Payment Gateways (AES-GCM encrypted)
  const [easypaisaNumber, setEasypaisaNumber] = useState("0332-9118144");
  const [easypaisaTitle, setEasypaisaTitle] = useState("Abdur Rahman Khan");
  const [easypaisaInstructions, setEasypaisaInstructions] = useState(
    "Enter the card destination details in the secure fields below.\nOnly the authorized founder can view or update these settings."
  );
  // Empty space for card number as requested: Admin will insert their card number here
  const [mastercardNumber, setMastercardNumber] = useState("");
  const [mastercardHolder, setMastercardHolder] = useState("Abdur Rahman Khan");
  const [mastercardBankName, setMastercardBankName] = useState("Debit / Credit Card");
  const [mastercardInstructions, setMastercardInstructions] = useState(
    "Transfer the amount to this Card Number / IBAN. Enter your Transaction Reference ID below for instant activation."
  );

  // UI helpers
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Verifications Queue
  const [verifications, setVerifications] = useState<any[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Manual Upgrade Form
  const [manualEmail, setManualEmail] = useState("");
  const [manualClerkId, setManualClerkId] = useState("");
  const [manualPlan, setManualPlan] = useState("pro_annual");
  const [isUpgradingManual, setIsUpgradingManual] = useState(false);

  const adminEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase().trim() || "";

  // Load existing encrypted settings and queue
  useEffect(() => {
    if (!isAdmin) return;

    loadSettings();
    loadVerifications();
  }, [isAdmin]);

  const loadSettings = async () => {
    try {
      const data = await getAdminPaymentSettings(adminEmail);
      if (data) {
        if (data.easypaisaNumber) setEasypaisaNumber(data.easypaisaNumber);
        if (data.easypaisaTitle) setEasypaisaTitle(data.easypaisaTitle);
        if (data.easypaisaInstructions) setEasypaisaInstructions(data.easypaisaInstructions);
        if (data.mastercardNumber) setMastercardNumber(data.mastercardNumber);
        if (data.mastercardHolder) setMastercardHolder(data.mastercardHolder);
        if (data.mastercardBankName) setMastercardBankName(data.mastercardBankName);
        if (data.mastercardInstructions) setMastercardInstructions(data.mastercardInstructions);
      }
    } catch (err: any) {
      console.warn("Could not fetch remote settings:", err);
    }
  };

  const loadVerifications = async () => {
    setIsLoadingQueue(true);
    try {
      const data = await getAdminVerifications(adminEmail);
      if (data && Array.isArray(data.verifications)) {
        setVerifications(data.verifications);
      }
    } catch (err: any) {
      console.warn("Could not fetch verifications:", err);
    } finally {
      setIsLoadingQueue(false);
    }
  };

  const handleSaveGateways = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setToastMessage(null);

    try {
      await saveAdminPaymentSettings(
        {
          easypaisaNumber,
          easypaisaTitle,
          easypaisaInstructions,
          mastercardNumber,
          mastercardHolder,
          mastercardBankName,
          mastercardInstructions,
        },
        adminEmail
      );

      setToastMessage({
        type: "success",
        text: "Payment credentials encrypted with AES-256-GCM and saved securely to database!",
      });
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      setToastMessage({
        type: "error",
        text: err.message || "Failed to encrypt and save credentials.",
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleVerificationAction = async (id: string, action: "approve" | "reject") => {
    setProcessingId(id);
    try {
      await processVerificationAction(id, action, adminEmail);
      setToastMessage({
        type: "success",
        text: action === "approve" ? "Donation request approved." : "Donation request rejected.",
      });
      loadVerifications();
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      setToastMessage({
        type: "error",
        text: err.message || "Failed to process verification.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleManualUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail && !manualClerkId) {
      setToastMessage({ type: "error", text: "Please provide a user Email or Clerk User ID." });
      return;
    }

    setIsUpgradingManual(true);
    try {
      await adminDirectUpgradeUser(manualEmail, manualClerkId, manualPlan, adminEmail);
      setToastMessage({
        type: "success",
        text: `User ${manualEmail || manualClerkId} received founder approval.`,
      });
      setManualEmail("");
      setManualClerkId("");
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      setToastMessage({ type: "error", text: err.message || "Failed to update the user record." });
    } finally {
      setIsUpgradingManual(false);
    }
  };

  // If user is not admin
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Card className="border-rose-500/30 bg-zinc-900/90 p-8 text-white shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400 mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-mono">Admin Authorization Required</h2>
          <p className="text-xs text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
            This route is strictly reserved for the owner of DevCost Lens (<strong>arkmfk27@gmail.com</strong>).
            Your current account does not have administrator privileges to view or configure AES-GCM payment keys.
          </p>

            <div className="mt-6 p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-left font-mono text-xs text-zinc-300">
              <div className="text-zinc-500 text-[11px] uppercase">Founder access</div>
              <div className="text-cyan-400 font-bold mt-1">Only the verified founder account may continue.</div>
            </div>

            <div className="mt-6 flex justify-center">
              <Button variant="outline" onClick={onBackToDashboard} className="font-mono text-xs">
                Return to Dashboard
              </Button>
            </div>
        </Card>
      </div>
    );
  }

  const pendingCount = verifications.filter((v) => v.status === "pending").length;
  const approvedCount = verifications.filter((v) => v.status === "approved").length;
  const totalVerifiedRevenue = verifications
    .filter((v) => v.status === "approved")
    .reduce((sum, v) => sum + (Number(v.amountUSD) || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono flex items-center gap-2">
              <Lock className="w-7 h-7 text-cyan-400" />
              <span>DevCost Lens — Admin Command Panel</span>
            </h1>
            <Badge variant="cyan" className="text-xs font-mono">
              Admin Session Active
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl font-mono">
            Signed in as <strong>{adminEmail}</strong>. Manage the private donation-card details with <strong>AES-GCM encryption</strong>. These controls are available only to the authorized founder account.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigateToPricing}
            className="text-xs font-mono border-zinc-700 hover:text-white"
          >
            <span>View Donation Page →</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onBackToDashboard}
            className="text-xs font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
          >
            <span>Back to Dashboard</span>
          </Button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`mt-4 p-3.5 rounded-xl border text-xs font-mono flex items-center justify-between animate-fadeIn ${
            toastMessage.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-300"
              : "bg-rose-950/80 border-rose-500/50 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-zinc-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Admin KPI Stat Counters */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-zinc-800 bg-zinc-900/60">
          <div className="text-[11px] font-mono text-zinc-400 uppercase">Total Revenue (Verified)</div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
            ${totalVerifiedRevenue.toFixed(2)}
          </div>
          <div className="text-[10px] font-mono text-zinc-500 mt-1">Optional card donations</div>
        </Card>

        <Card className="p-4 border-zinc-800 bg-zinc-900/60">
          <div className="text-[11px] font-mono text-zinc-400 uppercase">Pending Verifications</div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono text-amber-400">
            {pendingCount}
          </div>
          <div className="text-[10px] font-mono text-zinc-500 mt-1">Awaiting manual approval</div>
        </Card>

        <Card className="p-4 border-zinc-800 bg-zinc-900/60">
          <div className="text-[11px] font-mono text-zinc-400 uppercase">Supported Users</div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono text-cyan-400">
            {approvedCount}
          </div>
          <div className="text-[10px] font-mono text-zinc-500 mt-1">Donation records tracked</div>
        </Card>

        <Card className="p-4 border-zinc-800 bg-zinc-900/60">
          <div className="text-[11px] font-mono text-zinc-400 uppercase">Security Protocol</div>
          <div className="mt-2 text-xl font-bold font-mono text-white flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>AES-256-GCM</span>
          </div>
          <div className="text-[10px] font-mono text-emerald-400 mt-1">Backend Decryption Only</div>
        </Card>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="mt-8 flex items-center gap-2 border-b border-zinc-800 pb-3 font-mono text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab("gateways")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "gateways"
              ? "bg-cyan-500 text-zinc-950 font-bold shadow-md shadow-cyan-500/20"
              : "text-zinc-400 hover:text-white bg-zinc-900/60 border border-zinc-800"
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>1. Payment Gateways (AES-GCM Hidden)</span>
        </button>

        <button
          onClick={() => setActiveTab("verifications")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "verifications"
              ? "bg-cyan-500 text-zinc-950 font-bold shadow-md shadow-cyan-500/20"
              : "text-zinc-400 hover:text-white bg-zinc-900/60 border border-zinc-800"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>2. Verification Queue</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-zinc-950 font-bold text-[10px]">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("manual")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "manual"
              ? "bg-cyan-500 text-zinc-950 font-bold shadow-md shadow-cyan-500/20"
              : "text-zinc-400 hover:text-white bg-zinc-900/60 border border-zinc-800"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>3. Manual Direct Upgrade</span>
        </button>
      </div>

      {/* TAB 1: PAYMENT GATEWAYS CONFIGURATION */}
      {activeTab === "gateways" && (
        <div className="mt-6 space-y-6">
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 text-xs font-mono text-cyan-300 flex items-start gap-3">
            <Lock className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white">Sensitive Credential Vault (AES-GCM Protected)</div>
              <p className="text-zinc-300 mt-1 leading-relaxed">
                Your donation card number is <strong>never stored in plaintext</strong> and <strong>never exposed to regular users</strong>. The backend decrypts it only for authorized administrative operations.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveGateways} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Card donation configuration */}
              <Card className="p-6 border-zinc-800 bg-zinc-900/60">
                <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-800">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-mono">Donation Card Destination</CardTitle>
                    <CardDescription className="text-xs">Credit/Debit & IBAN destination</CardDescription>
                  </div>
                </div>

                <div className="space-y-4 mt-5 font-mono text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-zinc-300 font-semibold flex items-center gap-1.5">
                        <span>Card Number / IBAN (Space for Admin)</span>
                        <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                          Admin Only: arkmfk27@gmail.com
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowCardNumber(!showCardNumber)}
                        className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {showCardNumber ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showCardNumber ? "Mask" : "Reveal"}</span>
                      </button>
                    </div>
                    <Input
                      type={showCardNumber ? "text" : "password"}
                      value={mastercardNumber}
                      onChange={(e) => setMastercardNumber(e.target.value)}
                      placeholder="Insert your Card Number / IBAN here when ready (e.g. 5412...)"
                      className="bg-zinc-950 border-zinc-800 font-mono text-sm text-amber-300 placeholder:text-zinc-600"
                    />
                    <div className="flex items-center justify-between text-[10px] mt-1">
                      <span className="text-zinc-500">
                        {mastercardNumber ? (
                          <span className="text-emerald-400 font-semibold">✓ Card number inserted. Stored with AES-256-GCM.</span>
                        ) : (
                          <span className="text-amber-400">Currently empty — insert card number here when ready to accept card payments.</span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">
                      Cardholder Name
                    </label>
                    <Input
                      type="text"
                      value={mastercardHolder}
                      onChange={(e) => setMastercardHolder(e.target.value)}
                      placeholder="Abdur Rahman Khan"
                      className="bg-zinc-950 border-zinc-800 font-mono text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">
                      Bank Name & Branch / IBAN
                    </label>
                    <Input
                      type="text"
                      value={mastercardBankName}
                      onChange={(e) => setMastercardBankName(e.target.value)}
                      placeholder="Standard Chartered / Meezan Bank"
                      className="bg-zinc-950 border-zinc-800 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">
                      Card Donation Instructions
                    </label>
                    <textarea
                      rows={2}
                      value={mastercardInstructions}
                      onChange={(e) => setMastercardInstructions(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
              <Button
                type="submit"
                disabled={isSavingSettings}
                className="font-mono text-xs bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold px-6 h-10 shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                <Save className="w-4 h-4 mr-2" />
                <span>{isSavingSettings ? "Encrypting with AES-GCM..." : "Save & Encrypt Gateway Credentials"}</span>
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: VERIFICATION QUEUE */}
      {activeTab === "verifications" && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-mono text-white">
                Pending & Past Payment Submissions
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Verify user transaction IDs and activate their Pro accounts.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadVerifications}
              className="text-xs font-mono border-zinc-800"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoadingQueue ? "animate-spin" : ""}`} />
              <span>Refresh Queue</span>
            </Button>
          </div>

          {verifications.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-zinc-800 bg-zinc-950/40">
              <Clock className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <div className="text-sm font-bold font-mono text-white">No payment submissions yet</div>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto font-mono">
                Donation activity will appear here when card-support workflows are connected. DevCost Lens is free for every user; no upgrade approvals are required.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {verifications.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 transition-all font-mono"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5 mb-1">
                        <Badge
                          variant={
                            item.status === "approved"
                              ? "emerald"
                              : item.status === "rejected"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-[10px] uppercase font-bold"
                        >
                          {item.status}
                        </Badge>
                        <span className="text-sm font-bold text-white">{item.planName}</span>
                        <span className="text-xs text-cyan-400 font-bold">${item.amountUSD} USD</span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 capitalize">
                          {item.paymentMethod}
                        </span>
                      </div>

                      <div className="text-xs text-zinc-300 mt-2 space-y-1">
                        <div>
                          <strong>User:</strong> {item.userEmail} ({item.userName || "Developer"})
                        </div>
                        <div>
                          <strong>TRX / Reference ID:</strong>{" "}
                          <span className="text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800">
                            {item.transactionId}
                          </span>
                        </div>
                        <div>
                          <strong>Sender Account:</strong> {item.senderAccount} ({item.senderName})
                        </div>
                        {item.notesOrReceipt && (
                          <div className="text-zinc-400 text-[11px] italic">
                            Notes: "{item.notesOrReceipt}"
                          </div>
                        )}
                        <div className="text-[10px] text-zinc-500 pt-1">
                          Submitted: {new Date(item.submittedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {item.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            disabled={processingId === item.id}
                            onClick={() => handleVerificationAction(item.id, "approve")}
                            className="text-xs bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            <span>Approve & Upgrade User</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={processingId === item.id}
                            onClick={() => handleVerificationAction(item.id, "reject")}
                            className="text-xs border-rose-500/40 text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            <span>Reject</span>
                          </Button>
                        </>
                      )}

                      {item.status === "approved" && (
                        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Pro Active (Unlimited Keys)</span>
                        </span>
                      )}

                      {item.status === "rejected" && (
                        <span className="text-xs text-rose-400 font-bold flex items-center gap-1">
                          <XCircle className="w-4 h-4" />
                          <span>Rejected</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MANUAL DIRECT UPGRADE */}
      {activeTab === "manual" && (
        <div className="mt-6 max-w-2xl">
          <Card className="p-6 border-zinc-800 bg-zinc-900/60">
            <CardTitle className="text-base font-mono flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-cyan-400" />
              <span>Direct Complimentary / Manual Upgrade</span>
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Review founder-only account actions and donation activity.
            </CardDescription>

            <form onSubmit={handleManualUpgrade} className="space-y-4 mt-5 font-mono text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Developer Email Address
                </label>
                <Input
                  type="email"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  placeholder="developer@example.com"
                  className="bg-zinc-950 border-zinc-800 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Or Clerk User ID (Optional)
                </label>
                <Input
                  type="text"
                  value={manualClerkId}
                  onChange={(e) => setManualClerkId(e.target.value)}
                  placeholder="user_2qX..."
                  className="bg-zinc-950 border-zinc-800 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Pro Plan Tier
                </label>
                <select
                  value={manualPlan}
                  onChange={(e) => setManualPlan(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="pro_monthly">Pro Monthly ($15/month)</option>
                  <option value="pro_6months">Pro 6-Months ($60 / 6 months)</option>
                  <option value="pro_annual">Pro Annual ($100 / year — Unlimited)</option>
                </select>
              </div>

              <div className="pt-3">
                <Button
                  type="submit"
                  disabled={isUpgradingManual}
                  className="w-full font-mono text-xs bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold h-10 shadow-lg shadow-cyan-500/20"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  <span>{isUpgradingManual ? "Upgrading..." : "Grant Pro Access (Unlimited APIs)"}</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
