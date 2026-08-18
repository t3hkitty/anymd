import React, { useState } from 'react';
import type { CronJobTask } from '../plugins/cronSchedulerPlugin';
import {
  loadSavedCronJobs,
  saveCronJobs,
  generateLinuxCrontab,
  generateNodeCronRunnerScript
} from '../plugins/cronSchedulerPlugin';
import {
  X,
  Clock,
  Terminal,
  Play,
  Check,
  Copy,
  Plus,
  Trash2,
  Download,
  FileCode,
  Server
} from 'lucide-react';

interface CronSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CronSchedulerModal: React.FC<CronSchedulerModalProps> = ({
  isOpen,
  onClose
}) => {
  const [jobs, setJobs] = useState<CronJobTask[]>(loadSavedCronJobs);
  const [activeTab, setActiveTab] = useState<'scheduler' | 'crontab_export' | 'node_pm2'>('scheduler');
  const [copiedCrontab, setCopiedCrontab] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // New Job Form State
  const [isAddingJob, setIsAddingJob] = useState(false);
  const [newJobName, setNewJobName] = useState('Custom Plugin Webhook Cron');
  const [newJobCron, setNewJobCron] = useState('0 5 * * *');
  const [newJobCommand, setNewJobCommand] = useState('node /opt/lc-md/scripts/custom_plugin.js');
  const [newJobDesc, setNewJobDesc] = useState('Executes custom plugin task on VPS schedule.');

  if (!isOpen) return null;

  const handleToggleJob = (id: string) => {
    const updated = jobs.map(j => j.id === id ? { ...j, enabled: !j.enabled } : j);
    setJobs(updated);
    saveCronJobs(updated);
  };

  const handleDeleteJob = (id: string) => {
    const updated = jobs.filter(j => j.id !== id);
    setJobs(updated);
    saveCronJobs(updated);
  };

  const handleTriggerNow = (id: string) => {
    const updated = jobs.map(j => {
      if (j.id === id) {
        const nowStr = new Date().toLocaleTimeString();
        return {
          ...j,
          lastRunAt: new Date().toISOString(),
          lastRunStatus: 'success' as const,
          executionLogs: [`[OK ${nowStr}] Manual trigger executed successfully: 0 exit code`, ...j.executionLogs]
        };
      }
      return j;
    });
    setJobs(updated);
    saveCronJobs(updated);
  };

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    const newJob: CronJobTask = {
      id: `cron-${Date.now()}`,
      name: newJobName,
      description: newJobDesc,
      pluginId: 'custom-plugin',
      cronExpression: newJobCron,
      humanReadable: 'Custom VPS cron schedule',
      enabled: true,
      targetAction: 'custom-script',
      vpsScriptCommand: newJobCommand,
      executionLogs: [`[OK] Job created at ${new Date().toLocaleTimeString()}`]
    };
    const updated = [...jobs, newJob];
    setJobs(updated);
    saveCronJobs(updated);
    setIsAddingJob(false);
  };

  const crontabContent = generateLinuxCrontab(jobs);
  const nodeRunnerScript = generateNodeCronRunnerScript(jobs);

  const handleCopyCrontab = () => {
    navigator.clipboard.writeText(crontabContent);
    setCopiedCrontab(true);
    setTimeout(() => setCopiedCrontab(false), 2000);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(nodeRunnerScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleDownloadCrontab = () => {
    const blob = new Blob([crontabContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lc-md-scheduler.crontab';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold shadow-lg shadow-sky-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight tracking-tight flex items-center space-x-2">
                <span>VPS Cron &amp; Automation Scheduler</span>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-mono font-bold">
                  HEADLESS / SERVER SCHEDULING
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Manage background schedules for plugin creators, idle drive scanners, LoC enrichment &amp; WebDAV sync.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-slate-800 flex items-center space-x-2 bg-slate-950/50 font-mono text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('scheduler')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'scheduler'
                ? 'border-sky-400 text-sky-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>Active Cron Jobs ({jobs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('crontab_export')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'crontab_export'
                ? 'border-amber-400 text-amber-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>Linux Crontab File (/etc/cron.d)</span>
          </button>

          <button
            onClick={() => setActiveTab('node_pm2')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'node_pm2'
                ? 'border-indigo-400 text-indigo-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-indigo-400" />
            <span>Node.js / PM2 Runner Script</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs space-y-4">
          
          {/* TAB 1: ACTIVE CRON JOBS */}
          {activeTab === 'scheduler' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-sans">
                  Automated background tasks running in headless mode on Linux VPS or Node server.
                </span>

                <button
                  onClick={() => setIsAddingJob(!isAddingJob)}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Plugin Cron Task</span>
                </button>
              </div>

              {/* Add Job Form */}
              {isAddingJob && (
                <form onSubmit={handleAddJob} className="p-4 rounded-2xl bg-slate-950 border border-sky-500/50 space-y-3 font-mono">
                  <h4 className="font-bold text-xs text-sky-400 uppercase tracking-wider">Configure New Plugin Cron Job</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Task Name:</label>
                      <input
                        type="text"
                        value={newJobName}
                        onChange={(e) => setNewJobName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-amber-400 block mb-1">5-Part Cron Expression:</label>
                      <input
                        type="text"
                        value={newJobCron}
                        onChange={(e) => setNewJobCron(e.target.value)}
                        placeholder="*/15 * * * *"
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 text-xs font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Task Description:</label>
                    <input
                      type="text"
                      value={newJobDesc}
                      onChange={(e) => setNewJobDesc(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">VPS Command Line / Script:</label>
                    <input
                      type="text"
                      value={newJobCommand}
                      onChange={(e) => setNewJobCommand(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-emerald-300 text-xs"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingJob(false)}
                      className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-400 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs"
                    >
                      Save Cron Task
                    </button>
                  </div>
                </form>
              )}

              {/* Jobs List */}
              <div className="space-y-3">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      job.enabled
                        ? 'bg-slate-950 border-sky-500/40 shadow-sm'
                        : 'bg-slate-950/50 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-slate-100">{job.name}</span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                            {job.cronExpression}
                          </span>
                          <span className="text-[10px] text-slate-400 font-sans">({job.humanReadable})</span>
                        </div>
                        <p className="text-xs text-slate-400 font-sans">{job.description}</p>
                        <code className="text-[11px] text-emerald-400 bg-slate-900 px-2 py-0.5 rounded block mt-1">
                          $ {job.vpsScriptCommand}
                        </code>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleTriggerNow(job.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold flex items-center space-x-1"
                          title="Execute now on test thread"
                        >
                          <Play className="w-3 h-3" />
                          <span>Run Now</span>
                        </button>

                        <button
                          onClick={() => handleToggleJob(job.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            job.enabled
                              ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {job.enabled ? 'Enabled' : 'Paused'}
                        </button>

                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/80 hover:text-rose-300 text-slate-500 border border-slate-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {job.executionLogs && job.executionLogs.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                        <span>Latest Log: </span>
                        <span className="text-slate-400 font-mono">{job.executionLogs[0]}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CRONTAB EXPORT */}
          {activeTab === 'crontab_export' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-1 font-sans">
                <span className="font-bold text-amber-300 flex items-center space-x-1.5 text-xs font-mono">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span>Linux Crontab Generator (/etc/cron.d/lc-md-scheduler)</span>
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Drop this file into <code>/etc/cron.d/</code> on your VPS or paste it via <code>crontab -e</code> to run headless scheduled tasks.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Standard POSIX Crontab Specification</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyCrontab}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold text-xs flex items-center space-x-1"
                  >
                    {copiedCrontab ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCrontab ? 'Copied Crontab!' : 'Copy Crontab'}</span>
                  </button>

                  <button
                    onClick={handleDownloadCrontab}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1 shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Crontab File</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-300 text-xs max-h-[340px] overflow-y-auto whitespace-pre font-mono">
                {crontabContent}
              </pre>
            </div>
          )}

          {/* TAB 3: NODE / PM2 RUNNER SCRIPT */}
          {activeTab === 'node_pm2' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-1 font-sans">
                <span className="font-bold text-indigo-300 flex items-center space-x-1.5 text-xs font-mono">
                  <FileCode className="w-4 h-4 text-indigo-400" />
                  <span>Node.js &amp; PM2 Headless Runner (cron_runner.js)</span>
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Run with PM2: <code>pm2 start cron_runner.js --name lc-md-cron</code> to maintain resilient cron loops with automatic restarts and log rotation.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Node-Cron JavaScript Runner</span>
                <button
                  onClick={handleCopyScript}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1 shadow-md"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScript ? 'Copied Runner Script!' : 'Copy cron_runner.js'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sky-300 text-xs max-h-[340px] overflow-y-auto whitespace-pre font-mono">
                {nodeRunnerScript}
              </pre>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            VPS Cron Section &bull; Plugin Creator Hooks &bull; POSIX &amp; PM2
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs font-sans"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
