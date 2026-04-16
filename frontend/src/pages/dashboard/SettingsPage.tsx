import { useState, useRef, useEffect } from "react";
import {
   User, Mail, Lock, Shield, Camera, KeyRound, Loader2, CheckCircle2,
   AlertCircle, Globe, RefreshCw, AtSign, PenTool, Zap, HelpCircle,
   FileText, Layout, Image as ImageIcon, Plus, Trash2, Save, FileUp,
   ShieldCheck, Activity, Layers, Type, Square, ExternalLink, Copy,
   ChevronRight, Eye, Code, Variable
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { UI } from "@/ui/colors";
import usersApi from "@/api/usersApi";
import emailApi, {
   type EmailSettings, type DnsRecord, type ProviderDetection,
   type EmailTemplate, type EmailAsset, type TemplatePreset
} from "@/api/emailApi";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
   return twMerge(clsx(inputs));
}

// --- Block Types ---
type BlockType = 'header' | 'text' | 'button' | 'image' | 'divider';

interface VisualBlock {
   id: string;
   type: BlockType;
   content: string;
   link?: string;
   style?: {
      textAlign?: 'left' | 'center' | 'right';
      fontSize?: string;
      fontWeight?: string;
      color?: string;
      backgroundColor?: string;
      padding?: string;
   };
}

export default function SettingsPage() {
   const { user, refreshUser } = useAuth();
   const [activeTab, setActiveTab] = useState<"account" | "email">("account");
   const [activeEmailSubTab, setActiveEmailSubTab] = useState<"settings" | "builder">("settings");

   // Profile State
   const [name, setName] = useState(user?.name || "");
   const [email, setEmail] = useState(user?.email || "");
   const [profilePicture, setProfilePicture] = useState(user?.profile_picture || "");
   const [profileCurrentPassword, setProfileCurrentPassword] = useState("");
   const [profileError, setProfileError] = useState("");
   const [profileSuccess, setProfileSuccess] = useState("");
   const [isSavingProfile, setIsSavingProfile] = useState(false);

   // Security State
   const [secCurrentPassword, setSecCurrentPassword] = useState("");
   const [secNewPassword, setSecNewPassword] = useState("");
   const [secConfirmPassword, setSecConfirmPassword] = useState("");
   const [secError, setSecError] = useState("");
   const [secSuccess, setSecSuccess] = useState("");
   const [isSavingSecurity, setIsSavingSecurity] = useState(false);

   // Email Settings State
   const [emailSettings, setEmailSettings] = useState<EmailSettings | null>(null);
   const [isFetchingEmail, setIsFetchingEmail] = useState(false);
   const [isSavingEmail, setIsSavingEmail] = useState(false);
   const [emailSuccess, setEmailSuccess] = useState("");
   const [emailError, setEmailError] = useState("");
   const [detectedProvider, setDetectedProvider] = useState<ProviderDetection | null>(null);
   const [isDetecting, setIsDetecting] = useState(false);
   const [domainInput, setDomainInput] = useState("");

   // Template Builder State
   const [templateMode, setTemplateMode] = useState<"visual" | "html">("visual");
   const [blocks, setBlocks] = useState<VisualBlock[]>([]);
   const [htmlContent, setHtmlContent] = useState("");
   const [isSavingTemplate, setIsSavingTemplate] = useState(false);
   const [showPreview, setShowPreview] = useState(true);

   // Assets State
   const [assets, setAssets] = useState<EmailAsset[]>([]);
   const [presets, setPresets] = useState<TemplatePreset[]>([]);
   const [activeRightTab, setActiveRightTab] = useState<"assets" | "presets">("assets");
   const [storageUsage, setStorageUsage] = useState({ used: 0, quota: 10 });
   const [isUploadingAsset, setIsUploadingAsset] = useState(false);
   const [isFetchingPresets, setIsFetchingPresets] = useState(false);

   const fileInputRef = useRef<HTMLInputElement>(null);
   const assetInputRef = useRef<HTMLInputElement>(null);
   const iframeRef = useRef<HTMLIFrameElement>(null);

   useEffect(() => {
      if (user) {
         setName(user.name);
         setEmail(user.email);
         setProfilePicture(user.profile_picture || "");
      }

      if (activeTab === "email") {
         fetchEmailSettings();
         fetchTemplate();
         fetchAssets();
         fetchPresets();
      }
   }, [user, activeTab]);

   // Sync Live Preview
   useEffect(() => {
      if (showPreview && iframeRef.current) {
         const doc = iframeRef.current.contentDocument;
         if (doc) {
            const activeHtml = templateMode === 'visual' ? generateHtmlFromBlocks(blocks) : htmlContent;
            doc.open();
            doc.write(activeHtml || '<div style="color: #94a3b8; text-align: center; padding-top: 40px; font-family: sans-serif;">Empty Template</div>');
            doc.close();
         }
      }
   }, [blocks, htmlContent, templateMode, showPreview, activeEmailSubTab]);

   const fetchEmailSettings = async () => {
      try {
         setIsFetchingEmail(true);
         const data = await emailApi.getSettings();
         setEmailSettings(data || {
            from_name: "",
            from_email: "",
            reply_to: "",
            signature: "",
            auto_reply_enabled: false,
            domain_status: null,
            dns_records: [],
            dns_provider: null,
            daily_limit: 1000,
            sent_today: 0
         });
         if (data?.from_email) {
            setDomainInput(data.from_email.split("@")[1] || "");
         }
      } catch (err) {
         console.error("Failed to fetch email settings", err);
         // Initialize with defaults to allow typing if fetch fails
         setEmailSettings({
            from_name: "",
            from_email: user?.email || "",
            reply_to: user?.email || "",
            signature: "",
            auto_reply_enabled: false,
            domain_status: null,
            dns_records: [],
            dns_provider: null,
            daily_limit: 1000,
            sent_today: 0
         });
      } finally {
         setIsFetchingEmail(false);
      }
   };

   const fetchTemplate = async () => {
      try {
         const data = await emailApi.getTemplate();
         if (data) {
            setBlocks(data.content || []);
            setHtmlContent(data.html_content || "");
            setTemplateMode(data.type || "visual");
         }
      } catch (err) {
         console.error("Failed to fetch template", err);
      }
   };

   const fetchPresets = async () => {
      try {
         setIsFetchingPresets(true);
         const data = await emailApi.getPresets();
         console.log("Fetched presets:", data);
         setPresets(data.presets || []);
      } catch (err) {
         console.error("Failed to fetch presets", err);
      } finally {
         setIsFetchingPresets(false);
      }
   };

   const fetchAssets = async () => {
      try {
         const data = await emailApi.getAssets();
         setAssets(data.assets || []);
         setStorageUsage({
            used: data.total_usage_mb || 0,
            quota: data.quota_mb || 10
         });
      } catch (err) {
         console.error("Failed to fetch assets", err);
      }
   };

   const handleProfileSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setProfileError("");
      setProfileSuccess("");
      const isChangingSensitiveInfo = (name !== user?.name) || (email !== user?.email);
      if (isChangingSensitiveInfo && !profileCurrentPassword) {
         setProfileError("Current password is required to change name or email.");
         return;
      }
      try {
         setIsSavingProfile(true);
         const payload: any = {};
         if (name !== user?.name) payload.name = name;
         if (email !== user?.email) payload.email = email;
         if (profilePicture !== user?.profile_picture) payload.profile_picture = profilePicture;
         if (Object.keys(payload).length === 0) {
            setProfileSuccess("No changes to save.");
            setIsSavingProfile(false);
            return;
         }
         if (isChangingSensitiveInfo) payload.current_password = profileCurrentPassword;
         await usersApi.updateMe(payload);
         await refreshUser();
         setProfileSuccess("Profile updated successfully!");
         setProfileCurrentPassword("");
         setTimeout(() => setProfileSuccess(""), 5000);
      } catch (err: any) {
         setProfileError(err.response?.data?.detail || "Failed to update profile.");
      } finally {
         setIsSavingProfile(false);
      }
   };

   const handleSecuritySubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSecError("");
      setSecSuccess("");
      if (secNewPassword !== secConfirmPassword) {
         setSecError("New passwords do not match.");
         return;
      }
      if (secNewPassword.length < 6) {
         setSecError("Password must be at least 6 characters.");
         return;
      }
      try {
         setIsSavingSecurity(true);
         await usersApi.updatePassword({
            current_password: secCurrentPassword,
            new_password: secNewPassword
         });
         setSecSuccess("Password updated successfully!");
         setSecCurrentPassword("");
         setSecNewPassword("");
         setSecConfirmPassword("");
         setTimeout(() => setSecSuccess(""), 5000);
      } catch (err: any) {
         setSecError(err.response?.data?.detail || "Failed to update password.");
      } finally {
         setIsSavingSecurity(false);
      }
   };

   const handleDetectProvider = async (domain: string) => {
      if (!domain || domain.length < 3) return;
      try {
         setIsDetecting(true);
         const data = await emailApi.detectProvider(domain);
         setDetectedProvider(data);
      } catch (err) {
         console.error("Provider detection failed", err);
      } finally {
         setIsDetecting(false);
      }
   };

   const handleVerifyDomain = async () => {
      try {
         setIsFetchingEmail(true);
         const res = await emailApi.verifyDomain();
         if (emailSettings) {
            setEmailSettings({
               ...emailSettings,
               domain_status: res.domain_status,
               dns_records: res.dns_records || []
            });
         }
         if (res.domain_status === 'verified') {
            setEmailSuccess("Domain verified successfully!");
         } else {
            setEmailError("Verification pending. Please check your DNS records.");
         }
      } catch (err: any) {
         setEmailError(err.response?.data?.detail || "Verification failed.");
      } finally {
         setIsFetchingEmail(false);
      }
   };

   const handleEmailSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!emailSettings) return;
      setEmailError(""); setEmailSuccess("");
      try {
         setIsSavingEmail(true);
         const res = await emailApi.updateSettings(emailSettings);
         if (res.domain_status) {
            setEmailSettings({ ...emailSettings, domain_status: res.domain_status, dns_records: res.dns_records || [] });
         }
         setEmailSuccess("Email settings saved successfully!");
         setTimeout(() => setEmailSuccess(""), 5000);
      } catch (err: any) {
         setEmailError(err.response?.data?.detail || "Failed to update email settings.");
      } finally {
         setIsSavingEmail(false);
      }
   };

   const handleToggleAutoReply = async () => {
      if (!emailSettings) return;
      const newValue = !emailSettings.auto_reply_enabled;

      // Optimistic update
      setEmailSettings({ ...emailSettings, auto_reply_enabled: newValue });

      try {
         await emailApi.updateSettings({ auto_reply_enabled: newValue });
         setEmailSuccess(`AI Auto-Reply ${newValue ? 'Enabled' : 'Disabled'}`);
         setTimeout(() => setEmailSuccess(""), 3000);
      } catch (err) {
         // Revert on error
         setEmailSettings({ ...emailSettings, auto_reply_enabled: !newValue });
         setEmailError("Failed to update auto-reply status.");
      }
   };

   // --- Template Builder Handlers ---
   const addBlock = (type: BlockType) => {
      const newBlock: VisualBlock = {
         id: Math.random().toString(36).substr(2, 9),
         type,
         content: type === 'header' ? 'Enter Header...' : (type === 'button' ? 'Click Me' : 'Type your message here...'),
         style: { textAlign: 'left' }
      };
      setBlocks([...blocks, newBlock]);
   };

   const removeBlock = (id: string) => {
      setBlocks(blocks.filter(b => b.id !== id));
   };

   const updateBlock = (id: string, updates: Partial<VisualBlock>) => {
      setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
   };

   const generateHtmlFromBlocks = (blks: VisualBlock[]) => {
      return `
      <div style="font-family: 'Helvetica', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; padding: 20px;">
        ${blks.map(b => {
         const textAlign = b.style?.textAlign || 'left';
         const margin = 'margin-bottom: 24px;';
         if (b.type === 'header') return `<h1 style="${margin} text-align: ${textAlign}; font-size: 28px; font-weight: 800; color: #0f172a; line-height: 1.2;">${b.content}</h1>`;
         if (b.type === 'button') return `<div style="${margin} text-align: ${textAlign};"><a href="${b.link || '#'}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 700; display: inline-block; font-size: 14px;">${b.content}</a></div>`;
         if (b.type === 'divider') return `<hr style="border: 0; border-top: 1px solid #f1f5f9; ${margin}">`;
         if (b.type === 'image') return `<div style="${margin} text-align: ${textAlign};"><img src="${b.content}" style="max-width: 100%; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);" /></div>`;
         return `<p style="${margin} text-align: ${textAlign}; font-size: 16px; line-height: 1.7; color: #475569;">${b.content}</p>`;
      }).join('')}
      </div>
    `;
   };

   const handleApplyPreset = (preset: TemplatePreset) => {
      if (blocks.length > 0 || htmlContent.length > 0) {
         if (!confirm("Are you sure? This will overwrite your current template.")) return;
      }

      // Check if it's visually structured or just raw HTML
      // For now, these presets are raw HTML
      setTemplateMode("html");
      setHtmlContent(preset.html_content);
      setBlocks([]);
      setEmailSuccess(`Preset "${preset.name}" applied!`);
      setTimeout(() => setEmailSuccess(""), 3000);
   };

   const handleSaveTemplate = async () => {
      try {
         setIsSavingTemplate(true);
         const finalHtml = templateMode === 'visual' ? generateHtmlFromBlocks(blocks) : htmlContent;
         // If we save in Visual mode, we keep both. If we save in HTML mode, we keep HTML as source.
         await emailApi.saveTemplate({
            content: blocks,
            html_content: finalHtml,
            type: templateMode
         });
         setEmailSuccess("Template optimized and saved!");
         setTimeout(() => setEmailSuccess(""), 5000);
      } catch (err) {
         setEmailError("Failed to save template.");
      } finally {
         setIsSavingTemplate(false);
      }
   };

   const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
         setIsUploadingAsset(true);
         await emailApi.uploadAsset(file);
         await fetchAssets();
         setEmailSuccess("File uploaded successfully.");
      } catch (err: any) {
         setEmailError(err.response?.data?.detail || "Upload failed.");
      } finally {
         setIsUploadingAsset(false);
         if (assetInputRef.current) assetInputRef.current.value = "";
      }
   };

   const handleDeleteAsset = async (id: string) => {
      try {
         await emailApi.deleteAsset(id);
         await fetchAssets();
      } catch (err) {
         setEmailError("Failed to delete asset.");
      }
   };

   const initials = user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "U";

   return (
      <div className="w-full min-h-screen px-4 sm:px-6 py-12 max-w-6xl mx-auto space-y-12">

         {/* Header & Main Tabs */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8">
            <div className="space-y-1.5">
               <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  {activeTab === 'account' ? 'Profile & Security' : 'Email Automation'}
               </h1>
               <p className="text-sm font-medium text-slate-500">
                  {activeTab === 'account' 
                     ? 'Manage your personal identity and account security preferences.' 
                     : 'Automate your email outreach and manage professional templates.'}
               </p>
            </div>

            <div className="flex p-1 bg-slate-100/80 rounded-xl border border-slate-200/50">
               <button 
                  onClick={() => setActiveTab("account")} 
                  className={cn(
                     "px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-200", 
                     activeTab === "account" 
                        ? "bg-white shadow-sm text-slate-900" 
                        : "text-slate-500 hover:text-slate-700 hover:bg-white/40"
                  )}
               >
                  Account
               </button>
               <button 
                  onClick={() => setActiveTab("email")} 
                  className={cn(
                     "px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-200", 
                     activeTab === "email" 
                        ? "bg-white shadow-sm text-slate-900" 
                        : "text-slate-500 hover:text-slate-700 hover:bg-white/40"
                  )}
               >
                  Email
               </button>
            </div>
         </div>

         {activeTab === "account" ? (
            <div className="space-y-10 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
               {/* Profile Section */}
               <section className="bg-white border border-slate-200 rounded-3xl shadow-sm">
                  <div className="p-8 md:p-10 space-y-10">
                     <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="relative group">
                           <div className="h-28 w-28 rounded-full bg-slate-50 border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
                              {profilePicture ? <img src={profilePicture} className="h-full w-full object-cover" /> : <span className="text-3xl font-bold text-slate-300">{initials}</span>}
                           </div>
                           <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-2.5 bg-indigo-600 text-white rounded-full shadow-lg border-2 border-white hover:bg-indigo-700 transition-all"><Camera size={16} /></button>
                           <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                 const r = new FileReader();
                                 r.onloadend = () => setProfilePicture(r.result as string);
                                 r.readAsDataURL(f);
                              }
                           }} />
                        </div>
                        <div className="text-center md:text-left">
                           <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
                           <div className="flex items-center gap-2 mt-1 justify-center md:justify-start">
                              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Connected Account</span>
                              <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">Updated {new Date().toLocaleDateString()}</span>
                           </div>
                        </div>
                     </div>

                     <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div className="space-y-2">
                           <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                              <User size={12} className="text-slate-400" /> Full Name
                           </label>
                           <input value={name} onChange={e => setName(e.target.value)} className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all outline-none text-slate-900 placeholder:text-slate-400" placeholder="Display name" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                              <Mail size={12} className="text-slate-400" /> Email Address
                           </label>
                           <input value={email} onChange={e => setEmail(e.target.value)} className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all outline-none text-slate-900 placeholder:text-slate-400" placeholder="your@email.com" />
                        </div>

                        {/* Verification for Name/Email change */}
                        {((name !== user?.name) || (email !== user?.email)) && (
                           <div className="md:col-span-2 p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-in fade-in duration-300">
                              <div className="flex items-center gap-2 text-slate-700">
                                 <Lock size={14} className="text-slate-400" />
                                 <p className="text-xs font-semibold uppercase tracking-wider">Confirm changes</p>
                              </div>
                              <input type="password" value={profileCurrentPassword} onChange={e => setProfileCurrentPassword(e.target.value)} className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all shadow-sm" placeholder="Enter current password" />
                           </div>
                        )}

                        <div className="md:col-span-2 flex justify-end">
                           <button type="submit" disabled={isSavingProfile} className="h-11 px-8 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50">
                              {isSavingProfile ? <Loader2 className="animate-spin" size={18} /> : 'Save Profile'}
                           </button>
                        </div>
                     </form>
                  </div>
               </section>

               {/* Security Section */}
               <section className="bg-white border border-slate-200 rounded-3xl shadow-sm">
                  <div className="p-8 md:p-10 space-y-8">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                           <Shield size={18} />
                        </div>
                        <div>
                           <h2 className="text-lg font-bold text-slate-900">Security Settings</h2>
                           <p className="text-[11px] font-medium text-slate-500 -mt-0.5">Update your password to keep your account safe.</p>
                        </div>
                     </div>

                     <form onSubmit={handleSecuritySubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div className="space-y-2">
                              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Current Password</label>
                              <div className="relative">
                                 <input type="password" value={secCurrentPassword} onChange={e => setSecCurrentPassword(e.target.value)} className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all" />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">New Password</label>
                              <input type="password" value={secNewPassword} onChange={e => setSecNewPassword(e.target.value)} className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all" placeholder="Min. 6 characters" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Confirm New</label>
                              <input type="password" value={secConfirmPassword} onChange={e => setSecConfirmPassword(e.target.value)} className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all" placeholder="Repeat new password" />
                           </div>
                        </div>
                        <div className="flex justify-end">
                           <button type="submit" disabled={isSavingSecurity} className="h-11 px-8 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50">
                              {isSavingSecurity ? <Loader2 size={18} className="animate-spin" /> : 'Update Password'}
                           </button>
                        </div>
                     </form>
                  </div>
               </section>
            </div>
         ) : (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">

               {/* Email Sub-Tabs */}
               <div className="flex p-1 bg-slate-100/80 rounded-xl border border-slate-200/50 w-fit mx-auto">
                  <button 
                     onClick={() => setActiveEmailSubTab("settings")} 
                     className={cn(
                        "px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2", 
                        activeEmailSubTab === "settings" 
                           ? "bg-white shadow-sm text-slate-900" 
                           : "text-slate-500 hover:text-slate-700 hover:bg-white/40"
                     )}
                  >
                     <Zap size={16} /> Automation
                  </button>
                  <button 
                     onClick={() => setActiveEmailSubTab("builder")} 
                     className={cn(
                        "px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2", 
                        activeEmailSubTab === "builder" 
                           ? "bg-white shadow-sm text-slate-900" 
                           : "text-slate-500 hover:text-slate-700 hover:bg-white/40"
                     )}
                  >
                     <Layout size={16} /> Designer
                  </button>
               </div>

               {(emailError || emailSuccess || secError || secSuccess || profileError || profileSuccess) && (
                  <div className={cn(
                     "fixed bottom-10 right-10 p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-in slide-in-from-right-10 z-[100] border backdrop-blur-md transition-all duration-300", 
                     (emailError || secError || profileError) 
                        ? "bg-white border-red-200 text-red-600 shadow-red-100/50" 
                        : "bg-slate-900 border-white/10 text-white shadow-slate-900/40"
                  )}>
                     <div className={cn(
                        "p-1.5 rounded-lg",
                        (emailError || secError || profileError) ? "bg-red-50 text-red-600" : "bg-white/10 text-white"
                     )}>
                        {(emailError || secError || profileError) ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                     </div>
                     <p className="text-sm font-semibold tracking-tight">{emailError || secError || profileError || emailSuccess || secSuccess || profileSuccess}</p>
                     <button 
                        onClick={() => { setEmailError(""); setEmailSuccess(""); setSecError(""); setSecSuccess(""); setProfileError(""); setProfileSuccess("") }} 
                        className="ml-2 opacity-50 hover:opacity-100 transition-opacity"
                     >
                        âœ•
                     </button>
                  </div>
               )}
               {activeEmailSubTab === "settings" ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                     <div className="lg:col-span-8 space-y-8">
                        {/* Sender Configuration */}
                        <section className="bg-white border border-slate-200 rounded-3xl shadow-sm">
                           <div className="p-8 md:p-10 space-y-8">
                              <div className="flex items-center gap-3">
                                 <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <AtSign size={18} />
                                 </div>
                                 <h2 className="text-lg font-bold text-slate-900">Sender Configuration</h2>
                              </div>

                              <form onSubmit={handleEmailSubmit} className="space-y-6">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                       <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Display Name</label>
                                       <input
                                          value={emailSettings?.from_name || ""}
                                          onChange={e => setEmailSettings(s => s ? ({ ...s, from_name: e.target.value }) : null)}
                                          placeholder="e.g. Sales Team"
                                          className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
                                       />
                                    </div>
                                    <div className="space-y-2">
                                       <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Sender Email</label>
                                       <input
                                          value={emailSettings?.from_email || ""}
                                          onChange={e => {
                                             const v = e.target.value;
                                             setEmailSettings(s => s ? ({ ...s, from_email: v }) : null);
                                             if (v.includes("@")) {
                                                const dom = v.split("@")[1];
                                                setDomainInput(dom);
                                                if (dom.length > 4) handleDetectProvider(dom);
                                             }
                                          }}
                                          placeholder="hello@domain.com"
                                          className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
                                       />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                       <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Sending Domain</label>
                                       <div className="relative">
                                          <input
                                             value={domainInput}
                                             onChange={e => {
                                                const dom = e.target.value;
                                                setDomainInput(dom);
                                                if (dom.includes(".") && dom.length > 4) handleDetectProvider(dom);
                                             }}
                                             placeholder="yourdomain.com"
                                             className="w-full h-11 bg-white border border-slate-200 rounded-xl pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
                                          />
                                          <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                       </div>
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                       <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Professional Signature</label>
                                       <textarea
                                          value={emailSettings?.signature || ""}
                                          onChange={e => setEmailSettings(s => s ? ({ ...s, signature: e.target.value }) : null)}
                                          rows={4}
                                          placeholder="e.g. Best regards, {{name}}"
                                          className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none resize-none transition-all min-h-[120px]"
                                       />
                                    </div>
                                 </div>
                                 <div className="flex justify-end pt-2">
                                    <button type="submit" disabled={isSavingEmail} className="h-11 px-8 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50">
                                       {isSavingEmail ? <Loader2 size={18} className="animate-spin" /> : 'Save Identity'}
                                    </button>
                                 </div>
                              </form>
                           </div>
                        </section>
                        {/* Connectivity Hub (Redesigned) */}
                        {!!(emailSettings?.from_email || domainInput) && !emailSettings?.from_email?.endsWith("mail.voicedots.com") && (
                           <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-500">
                              <div className="p-6 md:p-8 bg-slate-900 flex flex-col md:flex-row items-center justify-between gap-6 text-white relative overflow-hidden">
                                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
                                 <div className="flex items-center gap-4 relative z-10">
                                    <div className={cn(
                                       "p-3 rounded-xl transition-colors duration-500", 
                                       emailSettings?.domain_status === 'verified' 
                                          ? "bg-emerald-500/10 text-emerald-400" 
                                          : "bg-white/10 text-white"
                                    )}>
                                       {emailSettings?.domain_status === 'verified' ? <ShieldCheck size={24} /> : <Activity size={24} className={cn(isFetchingEmail && "animate-pulse")} />}
                                    </div>
                                    <div>
                                       <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Connectivity Matrix</h2>
                                       <p className="text-xl font-bold tracking-tight">{emailSettings?.domain_status === 'verified' ? 'System Optimized' : 'DNS Connection'}</p>
                                    </div>
                                 </div>
                                 <button
                                    onClick={handleVerifyDomain}
                                    disabled={isFetchingEmail}
                                    className="h-10 px-6 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 relative z-10"
                                 >
                                    {isFetchingEmail ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} 
                                    {emailSettings?.domain_status === 'verified' ? 'Refresh Status' : 'Verify Now'}
                                 </button>
                              </div>

                              <div className="p-8 space-y-10 bg-white">
                                 {/* Infrastructure Status */}
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Detected Infrastructure</p>
                                       <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                          <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center font-bold text-slate-900 border border-slate-100">
                                             {emailSettings?.dns_provider?.[0] || detectedProvider?.provider_name?.[0] || "?"}
                                          </div>
                                          <div>
                                             <p className="text-sm font-bold text-slate-900">{emailSettings?.dns_provider || detectedProvider?.provider_name || 'Scanning Network...'}</p>
                                             {emailSettings?.domain_status !== 'verified' && (emailSettings?.dns_provider || detectedProvider?.provider_id) && (
                                                <a
                                                   href={
                                                      detectedProvider?.provider_id === "godaddy" ? `https://dcc.godaddy.com/manage/${domainInput || emailSettings?.from_email?.split('@')[1]}/dns` :
                                                         detectedProvider?.provider_id === "cloudflare" ? "https://dash.cloudflare.com/" :
                                                            detectedProvider?.provider_id === "namecheap" ? "https://www.namecheap.com/dashboard/domains/" :
                                                               detectedProvider?.provider_id === "google" ? `https://domains.google.com/registrar/${domainInput || emailSettings?.from_email?.split('@')[1]}/dns` :
                                                                  "#"
                                                   }
                                                   target="_blank"
                                                   rel="noreferrer"
                                                   className="text-[11px] font-semibold text-indigo-600 hover:underline flex items-center gap-1 mt-0.5"
                                                >
                                                   Open Provider Console <ExternalLink size={10} />
                                                </a>
                                             )}
                                          </div>
                                       </div>
                                    </div>
                                    <div className="space-y-4">
                                       <div className="flex items-center justify-between">
                                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Verification Progress</p>
                                          <p className="text-[11px] font-bold text-slate-900">{emailSettings?.domain_status === 'verified' ? '100%' : '60%'}</p>
                                       </div>
                                       <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
                                          <div
                                             className={cn("h-full transition-all duration-1000", emailSettings?.domain_status === 'verified' ? "bg-emerald-500 w-full" : "bg-indigo-600 w-[60%]")}
                                          />
                                       </div>
                                       <p className="text-[10px] text-slate-400 font-medium">
                                          {emailSettings?.domain_status === 'verified' ? 'Your domain is correctly configured and ready for high-volume outreach.' : 'Some records are still pending. DNS changes can take up to 24 hours.'}
                                       </p>
                                    </div>
                                 </div>

                                 {/* DNS Records Detail */}
                                 <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                       <div className="bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded tracking-widest uppercase">Matrix</div>
                                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Required Protocol Records</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                       {(Array.isArray(emailSettings?.dns_records) ? emailSettings.dns_records : []).map((record, i) => (
                                          <div key={i} className="group p-5 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 transition-all space-y-4">
                                             <div className="flex items-center justify-between">
                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase">{record.type}</span>
                                                {record.status === 'verified' ? (
                                                   <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase italic">âœ“ Active</span>
                                                ) : (
                                                   <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 uppercase italic animate-pulse">â— Pending</span>
                                                )}
                                             </div>
                                             <div className="space-y-3">
                                                <div>
                                                   <div className="flex items-center justify-between mb-1">
                                                      <p className="text-[9px] font-bold text-slate-400 uppercase">Host / Name</p>
                                                      <button onClick={() => { navigator.clipboard.writeText(record.host || record.name); setEmailSuccess("Host Copied!"); setTimeout(() => setEmailSuccess(""), 2000) }} className="p-1 hover:bg-slate-50 rounded transition-colors text-slate-300 hover:text-indigo-600"><Copy size={12} /></button>
                                                   </div>
                                                   <p className="text-[13px] font-mono font-medium text-slate-600 truncate">{record.host || record.name}</p>
                                                </div>
                                                <div>
                                                   <div className="flex items-center justify-between mb-1">
                                                      <p className="text-[9px] font-bold text-slate-400 uppercase">Value / Data</p>
                                                      <button onClick={() => { navigator.clipboard.writeText(record.value); setEmailSuccess("Value Copied!"); setTimeout(() => setEmailSuccess(""), 2000) }} className="p-1 hover:bg-slate-50 rounded transition-colors text-slate-300 hover:text-indigo-600"><Copy size={12} /></button>
                                                   </div>
                                                   <p className="text-[13px] font-mono font-medium text-slate-600 break-all leading-relaxed">{record.value}</p>
                                                </div>
                                             </div>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              </div>
                           </section>
                        )}
                     </div>

                     {/* Sidebar Widgets */}
                     <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                           <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                 <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <Zap size={16} />
                                 </div>
                                 <p className="text-sm font-bold text-slate-900">AI Auto-Reply</p>
                              </div>
                              <button
                                 onClick={handleToggleAutoReply}
                                 className={cn(
                                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                    emailSettings?.auto_reply_enabled ? "bg-indigo-600" : "bg-slate-200"
                                 )}
                              >
                                 <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white transition-transform", emailSettings?.auto_reply_enabled ? "translate-x-6" : "translate-x-1")} />
                              </button>
                           </div>
                           <p className="text-xs text-slate-500 font-medium leading-relaxed">
                              Enable AI agent to automatically respond to incoming leads 24/7.
                           </p>
                        </div>

                        <div className="bg-slate-900 rounded-2xl p-6 text-white space-y-6 shadow-lg shadow-slate-200 relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl" />
                           <div className="space-y-1 relative z-10">
                              <p className="text-[10px] font-bold uppercase opacity-50 tracking-widest">Quota Management</p>
                              <h3 className="text-lg font-bold">Daily Activity</h3>
                           </div>
                           
                           <div className="space-y-4 relative z-10">
                              <div className="flex items-baseline gap-2">
                                 <span className="text-4xl font-bold">{emailSettings?.sent_today || 0}</span>
                                 <span className="text-sm font-medium opacity-50">/ {emailSettings?.daily_limit || 'âˆž'} emails</span>
                              </div>
                              <div className="space-y-2">
                                 <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div 
                                       className="h-full bg-white transition-all duration-1000" 
                                       style={{ width: `${Math.min(100, ((emailSettings?.sent_today || 0) / (emailSettings?.daily_limit || 1)) * 100)}%` }} 
                                    />
                                 </div>
                                 <p className="text-[10px] font-semibold uppercase text-white/50 text-right">
                                    {Math.round(Math.min(100, ((emailSettings?.sent_today || 0) / (emailSettings?.daily_limit || 1)) * 100))}% Used
                                 </p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                ) : (
                  /* --- BUILDER VIEW --- */
                  <div className="flex flex-col xl:flex-row gap-8 h-[750px] animate-in slide-in-from-right-8 duration-500">

                      {/* Left: Editor Column */}
                      <div className="flex-1 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden">
                         <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex p-0.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                               <button 
                                  onClick={() => setTemplateMode('visual')} 
                                  className={cn(
                                     "px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-2", 
                                     templateMode === 'visual' ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-700"
                                  )}
                               >
                                  <Layout size={14} /> Visual
                               </button>
                               <button 
                                  onClick={() => {
                                     if (templateMode === 'visual') setHtmlContent(generateHtmlFromBlocks(blocks));
                                     setTemplateMode('html');
                                  }} 
                                  className={cn(
                                     "px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-2", 
                                     templateMode === 'html' ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-700"
                                  )}
                               >
                                  <Code size={14} /> HTML
                               </button>
                            </div>
                            <div className="flex items-center gap-2">
                               <button onClick={() => setShowPreview(!showPreview)} className={cn("p-2 rounded-xl transition-all", showPreview ? "text-indigo-600 bg-indigo-50" : "text-slate-400 hover:bg-slate-100")} title="Toggle Preview">
                                  <Eye size={18} />
                               </button>
                               <button onClick={handleSaveTemplate} disabled={isSavingTemplate} className="h-9 px-4 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm">
                                  {isSavingTemplate ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                               </button>
                            </div>
                         </div>

                        <div className="flex-1 flex overflow-hidden">
                           {/* Control Panel */}
                           <div className="w-16 bg-slate-50 border-r border-slate-100 flex flex-col items-center py-6 gap-5">
                              <button onClick={() => addBlock('header')} className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-xl transition-all" title="Add Header"><Type size={20} /></button>
                              <button onClick={() => addBlock('text')} className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-xl transition-all" title="Add Text"><Layers size={20} /></button>
                              <button onClick={() => addBlock('image')} className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-xl transition-all" title="Add Image"><ImageIcon size={20} /></button>
                              <button onClick={() => addBlock('button')} className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-xl transition-all" title="Add Button"><Square size={20} /></button>
                              <button onClick={() => addBlock('divider')} className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-xl transition-all" title="Add Divider"><Plus size={20} /></button>
                           </div>

                           <div className="flex-1 overflow-y-auto p-10 bg-white/50 pattern-slate">
                              {templateMode === 'visual' ? (
                                 <div className="max-w-[480px] mx-auto space-y-6">
                                    {blocks.length > 0 ? (
                                       blocks.map(block => (
                                          <div key={block.id} className="group relative border border-transparent hover:border-slate-200 hover:bg-white rounded-2xl p-6 transition-all shadow-sm hover:shadow-md">
                                             <div className="absolute -left-12 top-6 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => removeBlock(block.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                                             </div>
                                             {block.type === 'header' && (
                                                <input value={block.content} onChange={e => updateBlock(block.id, { content: e.target.value })} className="w-full text-2xl font-bold text-slate-900 border-none bg-transparent outline-none" placeholder="Header Text" />
                                             )}
                                             {block.type === 'text' && (
                                                <textarea value={block.content} rows={3} onChange={e => updateBlock(block.id, { content: e.target.value })} className="w-full text-sm font-medium text-slate-600 border-none bg-transparent outline-none resize-none leading-relaxed" placeholder="Write something..." />
                                             )}
                                             {block.type === 'button' && (
                                                <div className="space-y-4">
                                                   <div className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg w-fit mx-auto shadow-md">{block.content}</div>
                                                   <div className="grid grid-cols-2 gap-3 mt-4">
                                                      <div className="space-y-1">
                                                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Button Label</p>
                                                         <input value={block.content} onChange={e => updateBlock(block.id, { content: e.target.value })} className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 outline-none focus:border-indigo-300 transition-all" />
                                                      </div>
                                                      <div className="space-y-1">
                                                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Redirect URL</p>
                                                         <input value={block.link || ""} onChange={e => updateBlock(block.id, { link: e.target.value })} className="w-full text-xs font-semibold text-indigo-600 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 outline-none focus:border-indigo-300 transition-all" placeholder="https://" />
                                                      </div>
                                                   </div>
                                                </div>
                                             )}
                                             {block.type === 'image' && (
                                                <div className="space-y-4">
                                                   {block.content && block.content.startsWith('http') ? <img src={block.content} className="w-full rounded-xl shadow-md border border-slate-100" /> : <div className="aspect-video bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-100"><ImageIcon size={40} /></div>}
                                                   <div>
                                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1">Image Source URL</p>
                                                      <input value={block.content} onChange={e => updateBlock(block.id, { content: e.target.value })} className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 outline-none focus:border-indigo-300 transition-all" placeholder="Paste URL here..." />
                                                   </div>
                                                </div>
                                             )}
                                             {block.type === 'divider' && <div className="h-px bg-slate-100 w-full my-4" />}
                                          </div>
                                       ))
                                    ) : (
                                       <div className="py-24 text-center space-y-4 opacity-40">
                                          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto"><Layout size={32} className="text-slate-400" /></div>
                                          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Start Building</p>
                                       </div>
                                    )}
                                 </div>
                              ) : (
                                 <textarea value={htmlContent} onChange={e => setHtmlContent(e.target.value)} className="w-full h-full font-mono text-sm bg-slate-900 text-slate-300 p-8 rounded-3xl border border-slate-800 outline-none leading-relaxed shadow-2xl" placeholder="<html><body><h1>Hi {{name}}</h1></body></html>" />
                              )}
                           </div>
                        </div>

                        {/* Personalization pill helper */}
                        <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-4 overflow-x-auto">
                           <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                              <Variable size={14} /> Personalize:
                           </div>
                           <button onClick={() => { navigator.clipboard.writeText("{{name}}"); setEmailSuccess("Copied {{name}}!"); setTimeout(() => setEmailSuccess(""), 2000) }} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all uppercase tracking-wide">Client Name</button>
                           <button onClick={() => { navigator.clipboard.writeText("{{email}}"); setEmailSuccess("Copied {{email}}!"); setTimeout(() => setEmailSuccess(""), 2000) }} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all uppercase tracking-wide">Client Email</button>
                           <button onClick={() => { navigator.clipboard.writeText("{{agent_name}}"); setEmailSuccess("Copied {{agent_name}}!"); setTimeout(() => setEmailSuccess(""), 2000) }} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all uppercase tracking-wide">Agent Name</button>
                        </div>
                     </div>

                     {/* Right: Preview & Assets Column (Split) */}
                     <div className="w-full xl:w-[450px] flex flex-col gap-6 overflow-hidden">

                        {/* Preview Iframe */}
                        {showPreview && (
                           <div className="flex-[1.5] bg-white border border-slate-200 rounded-3xl shadow-xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
                              <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Live Preview</p>
                                 <div className="flex gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-red-400" />
                                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                 </div>
                              </div>
                              <div className="flex-1 bg-white">
                                 <iframe ref={iframeRef} className="w-full h-full border-none" title="Template Preview" />
                              </div>
                           </div>
                        )}

                        {/* Shared Panel (Assets / Presets) */}
                        <div className="flex-1 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden">
                           <div className="p-2 border-b border-slate-50 flex items-center justify-between bg-white">
                              <div className="flex p-1 bg-slate-100 rounded-xl">
                                 <button onClick={() => setActiveRightTab('assets')} className={cn("px-4 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all", activeRightTab === 'assets' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500")}>Assets</button>
                                 <button onClick={() => setActiveRightTab('presets')} className={cn("px-4 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all", activeRightTab === 'presets' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500")}>Presets</button>
                              </div>

                              {activeRightTab === 'assets' && (
                                 <button onClick={() => assetInputRef.current?.click()} className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:rotate-90 transition-all">
                                    {isUploadingAsset ? <Loader2 size={12} className="animate-spin" /> : <FileUp size={12} />}
                                 </button>
                              )}
                              <input type="file" ref={assetInputRef} className="hidden" onChange={handleAssetUpload} />
                           </div>

                           <div className="flex-1 overflow-y-auto p-4">
                              {activeRightTab === 'assets' ? (
                                 <div className="space-y-3">
                                    {(assets || []).length === 0 ? (
                                       <div className="py-10 text-center grayscale opacity-10 space-y-2">
                                          <FileText className="mx-auto" size={30} />
                                          <p className="text-[10px] font-black uppercase tracking-widest">Empty Vault</p>
                                       </div>
                                    ) : (
                                       (assets || []).map(asset => (
                                          <div key={asset.id} className="group p-3 bg-slate-50 border border-slate-50 hover:border-indigo-100 hover:bg-white rounded-2xl transition-all">
                                             <div className="flex items-center justify-between mb-1.5">
                                                <p className="text-[10px] font-black text-slate-800 truncate flex-1">{asset.file_name}</p>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                   <button onClick={() => { navigator.clipboard.writeText(asset.url); setEmailSuccess("URL Copied!"); setTimeout(() => setEmailSuccess(""), 2000) }} title="Copy URL" className="p-1.5 hover:bg-slate-50 rounded-lg text-indigo-600"><Copy size={12} /></button>
                                                   <button onClick={() => handleDeleteAsset(asset.id)} className="p-1.5 hover:bg-slate-50 rounded-lg text-red-500"><Trash2 size={12} /></button>
                                                </div>
                                             </div>
                                             <div className="flex items-center justify-between text-[8px] font-black text-slate-400 uppercase italic">
                                                <span className="bg-slate-200 text-slate-600 px-1 rounded truncate max-w-[80px]">{asset.mime_type.split('/')[1]}</span>
                                                <span>{asset.size_mb} MB</span>
                                             </div>
                                          </div>
                                       ))
                                    )}
                                 </div>
                              ) : (
                                 <div className="space-y-4">
                                    {isFetchingPresets ? (
                                       <div className="py-10 text-center space-y-2">
                                          <Loader2 size={30} className="mx-auto animate-spin text-indigo-600" />
                                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Presets...</p>
                                       </div>
                                    ) : (presets || []).length === 0 ? (
                                       <div className="py-10 text-center grayscale opacity-10 space-y-2">
                                          <Zap className="mx-auto" size={30} />
                                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-800">No Presets Hub</p>
                                       </div>) : ((presets || []).map(preset => (
                                          <div key={preset.id} className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 group hover:border-indigo-500 transition-all shadow-sm">
                                             <div className="flex items-center justify-between">
                                                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">{preset.name}</p>
                                                <Zap size={14} className="text-indigo-600" />
                                             </div>
                                             <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Professional pre-built configuration for your outreach.</p>
                                             <button
                                                onClick={() => handleApplyPreset(preset)}
                                                className="w-full h-9 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-all shadow-sm"
                                             >
                                                Apply Template
                                             </button>
                                          </div>
                                       ))
                                    )}
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>
               )}
            </div>
         )}
      </div>
   );
}
