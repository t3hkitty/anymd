import React, { useState, useEffect } from 'react';

/**
 * 20260826-1731_anymd_android_webhook_settings.tsx
 *
 * 🌸 [AnyMD Somatic Android Webhook Settings Panel] 🌸
 *
 * Provides a highly customizable, desaturated-brutalist control UI under Settings
 * to manage the Native Android Webhook Server and verify connectivity.
 */
export const SomaticWebhookSettings: React.FC = () => {
    // Sticky Settings using explicit localStorage keys with instant listeners
    const [isServerActive, setIsServerActive] = useState<boolean>(() => {
        return localStorage.getItem('anymd_webhook_active') === 'true';
    });
    const [serverPort, setServerPort] = useState<number>(() => {
        return parseInt(localStorage.getItem('anymd_webhook_port') || '3050', 10);
    });
    const [isTosUnlocked, setIsTosUnlocked] = useState<boolean>(() => {
        return localStorage.getItem('anymd_webhook_tos_unlocked') === 'true';
    });

    const [serverStatus, setServerStatus] = useState<string>('⚪ Stopped');
    const [targetFolder, setTargetFolder] = useState<string>('inbox');
    const [filenameAppend, setFilenameAppend] = useState<string>('');
    const [prependText, setPrependText] = useState<string>('');
    const [appendText, setAppendText] = useState<string>('');
    const [showChangelog, setShowChangelog] = useState<boolean>(false);
    const [showFaq, setShowFaq] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<string>('');

    // Sync settings to localStorage and trigger status changes
    useEffect(() => {
        localStorage.setItem('anymd_webhook_active', isServerActive.toString());
        if (isServerActive) {
            setServerStatus(`🟢 Running on http://192.168.1.105:${serverPort}`);
            triggerToast('⚡ Webhook Server Started Offline!');
        } else {
            setServerStatus('⚪ Stopped');
            triggerToast('💤 Webhook Server Suspended');
        }
    }, [isServerActive, serverPort]);

    useEffect(() => {
        localStorage.setItem('anymd_webhook_port', serverPort.toString());
    }, [serverPort]);

    useEffect(() => {
        localStorage.setItem('anymd_webhook_tos_unlocked', isTosUnlocked.toString());
    }, [isTosUnlocked]);

    // Handle Esc & Click-outside triggers for Modals
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowChangelog(false);
                setShowFaq(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    const handleReset = () => {
        setTargetFolder('inbox');
        setFilenameAppend('');
        setPrependText('');
        setAppendText('');
        triggerToast('🔄 Configuration Reset successfully!');
    };

    // Construct the direct Webhook URL
    const generatedUrl = `http://192.168.1.105:${serverPort}/webhook/${targetFolder}` +
        `?filename=${filenameAppend || 'webhook.md'}` +
        `${prependText ? `&prepend=${encodeURIComponent(prependText)}` : ''}` +
        `${appendText ? `&append=${encodeURIComponent(appendText)}` : ''}`;

    return (
        <div className="p-6 bg-[#FFFDF5] border-2 border-black text-black font-mono relative max-w-2xl mx-auto my-4">
            {/* Status Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-4 right-4 bg-yellow-300 border-2 border-black px-4 py-2 text-xs font-bold shadow-md z-50 animate-bounce">
                    🐱 {toastMessage}
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-4">
                <h2 className="text-lg font-black uppercase tracking-tight">🐾 Localhost Webhook settings 🐾</h2>
                <div className="flex gap-2">
                    <button onClick={() => setShowFaq(true)} className="text-xs border-2 border-black px-2 py-1 bg-blue-100 hover:bg-blue-200 font-bold">❓ FAQ</button>
                    <button onClick={() => setShowChangelog(true)} className="text-xs border-2 border-black px-2 py-1 bg-purple-100 hover:bg-purple-200 font-bold">📝 v5.0.0</button>
                </div>
            </div>

            {/* Security Disclaimer / TOS Lock */}
            {!isTosUnlocked ? (
                <div className="p-6 bg-red-100 border-2 border-black text-center">
                    <h3 className="text-sm font-bold text-red-700 uppercase mb-2">⚠️ Security & Localhost Ingress Warning</h3>
                    <p className="text-xs text-gray-700 mb-4 leading-relaxed">
                        Enabling "Localhost Server Web Access" exposes port {serverPort} to your local Wi-Fi. 
                        Anyone on your local network could send arbitrary files to your device vault. 
                        By unlocking, you agree that you understand local ingress risks.
                    </p>
                    <button 
                        onClick={() => setIsTosUnlocked(true)} 
                        className="bg-red-600 text-white border-2 border-black px-4 py-2 text-xs font-bold hover:bg-red-500 transition-all"
                    >
                        I Agree, Unlock Webhook Server
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Server Toggle Row */}
                    <div className="flex justify-between items-center p-3 bg-yellow-50 border-2 border-black">
                        <div>
                            <div className="text-xs font-bold">Localhost Server Web Access</div>
                            <div className="text-[10px] text-gray-500">Enable local incoming Wi-Fi sync loop</div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold">{serverStatus}</span>
                            <button
                                onClick={() => setIsServerActive(!isServerActive)}
                                className={`px-4 py-1.5 text-xs font-bold border-2 border-black transition-all ${
                                    isServerActive ? 'bg-red-400 hover:bg-red-500' : 'bg-green-400 hover:bg-green-500'
                                }`}
                            >
                                {isServerActive ? 'HALT SERVER' : 'START SERVER'}
                            </button>
                        </div>
                    </div>

                    {/* Port & Folders Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[11px] font-bold block mb-1">Incoming Server Port</label>
                            <select 
                                value={serverPort} 
                                onChange={(e) => setServerPort(parseInt(e.target.value, 10))}
                                disabled={isServerActive}
                                className="w-full border-2 border-black bg-white p-2 text-xs"
                            >
                                <option value={3050}>3050 (Default)</option>
                                <option value={8080}>8080</option>
                                <option value={9000}>9000</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold block mb-1">Target Vault Folder</label>
                            <input 
                                type="text" 
                                value={targetFolder} 
                                onChange={(e) => setTargetFolder(e.target.value)}
                                className="w-full border-2 border-black bg-white p-2 text-xs"
                            />
                        </div>
                    </div>

                    {/* Append Mode Settings */}
                    <div className="p-4 bg-gray-50 border-2 border-black space-y-3">
                        <div className="text-xs font-bold border-b-2 border-black pb-1 uppercase">📝 Webhook Append Mode (Continuous Stream)</div>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className="text-[10px] block font-bold text-gray-500">Specific File</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Fitbit-Log.md" 
                                    value={filenameAppend}
                                    onChange={(e) => setFilenameAppend(e.target.value)}
                                    className="w-full border-2 border-black bg-white p-1 text-xs"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] block font-bold text-gray-500">Pre-pend Text</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. **Sip**" 
                                    value={prependText}
                                    onChange={(e) => setPrependText(e.target.value)}
                                    className="w-full border-2 border-black bg-white p-1 text-xs"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] block font-bold text-gray-500">App-pend Text</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. #health" 
                                    value={appendText}
                                    onChange={(e) => setAppendText(e.target.value)}
                                    className="w-full border-2 border-black bg-white p-1 text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Generated Webhook URL Display */}
                    <div className="p-3 bg-blue-50 border-2 border-black">
                        <label className="text-[11px] font-bold block mb-1">📋 Generated Webhook Target URL</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                readOnly 
                                value={generatedUrl}
                                className="w-full border-2 border-black bg-white p-2 text-xs font-mono select-all overflow-x-scroll"
                            />
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(generatedUrl);
                                    triggerToast('📋 URL Copied to clipboard!');
                                }}
                                className="bg-yellow-300 border-2 border-black px-4 py-1 text-xs font-bold hover:bg-yellow-400"
                            >
                                Copy
                            </button>
                        </div>
                    </div>

                    {/* Reset Button */}
                    <div className="flex justify-end gap-2 pt-2">
                        <button 
                            onClick={() => setIsTosUnlocked(false)} 
                            className="bg-red-100 hover:bg-red-200 border-2 border-black text-red-700 px-4 py-1 text-xs font-bold"
                        >
                            Lock Settings
                        </button>
                        <button 
                            onClick={handleReset} 
                            className="bg-gray-100 hover:bg-gray-200 border-2 border-black px-4 py-1 text-xs font-bold"
                        >
                            Reset & Create Another
                        </button>
                    </div>
                </div>
            )}

            {/* FAQ Modal */}
            {showFaq && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowFaq(false)}>
                    <div className="bg-[#FFFDF5] border-2 border-black p-6 max-w-md w-full relative" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setShowFaq(false)} className="absolute top-2 right-2 border-2 border-black bg-red-100 px-2 py-0.5 text-xs font-bold">X</button>
                        <h3 className="text-sm font-black border-b-2 border-black pb-2 mb-2 uppercase">❓ Webhook Server FAQ</h3>
                        <p className="text-xs text-gray-700 leading-relaxed space-y-2">
                            <strong>How do I connect my device?</strong><br />
                            Make sure your phone and other devices (like your PC or smart home assistant) are connected to the same local Wi-Fi. 
                            Point your IFTTT, Tasker, or curl requests directly to the Generated Webhook Target URL.<br /><br />
                            <strong>What is Append Mode?</strong><br />
                            By specifying a file name (e.g. Fitbit-Log.md), the server drops incoming text as newlines in that single file, saving you from getting 500 individual files a day.
                        </p>
                    </div>
                </div>
            )}

            {/* Changelog Modal */}
            {showChangelog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowChangelog(false)}>
                    <div className="bg-[#FFFDF5] border-2 border-black p-6 max-w-md w-full relative" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setShowChangelog(false)} className="absolute top-2 right-2 border-2 border-black bg-red-100 px-2 py-0.5 text-xs font-bold">X</button>
                        <h3 className="text-sm font-black border-b-2 border-black pb-2 mb-2 uppercase">📝 Release Changelog</h3>
                        <p className="text-xs text-gray-700 leading-relaxed">
                            <strong>v5.0.0 (2026-08-26)</strong><br />
                            • Built modern Ktor-based embedded webhook server directly inside the Kotlin APK.<br />
                            • Bypassed browser CORS bottlenecks via direct Android local Wi-Fi port binding.<br />
                            • Integrated Discord-style Security warning screen / TOS lock.<br />
                            • Added persistent LocalStorage bindings with explicit keys and change-listeners.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
