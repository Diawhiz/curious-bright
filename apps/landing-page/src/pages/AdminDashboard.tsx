import React, { useState } from 'react';
import { Shield, Activity, Users, Terminal, Settings, Lock, Unlock, Database, Server, Clock, Search, CheckCircle, AlertTriangle } from 'lucide-react';
import websiteLogo from '../assets/website-logo.svg';

// Fallback URL based on environment
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:4000' : 'https://api.curiousbright.com.ng';

const CHANGELOG = [
  { version: 'v1.4.4', date: 'Today', description: 'Wired up Admin Dashboard to secure backend API using passphrase auth.' },
  { version: 'v1.4.3', date: 'Today', description: 'Added Admin Dashboard UI to landing page.' },
  { version: 'v1.4.2', date: 'Yesterday', description: 'Fixed mobile Expo dependencies and updated entry point for EAS.' },
  { version: 'v1.4.1', date: 'Yesterday', description: 'Rebranded all UI components with official SVG logo and favicons.' },
];

export const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState<'analytics' | 'logs' | 'users' | 'changelog' | 'settings'>('analytics');
  
  // Real Data States
  const [stats, setStats] = useState({ totalUsers: 0, activeRooms: 0, uptime: '0%', serverUptime: '0' });
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  const fetchAdminData = async (secret: string) => {
    try {
      const headers = { 'X-Admin-Passphrase': secret };
      const [statsRes, usersRes, logsRes] = await Promise.all([
        fetch(`${API_URL}/admin/stats`, { headers }),
        fetch(`${API_URL}/admin/users`, { headers }),
        fetch(`${API_URL}/admin/logs`, { headers })
      ]);
      
      if (!statsRes.ok) throw new Error('Invalid passphrase or server error');

      const s = await statsRes.json();
      const u = await usersRes.json();
      const l = await logsRes.json();

      setStats(s);
      setUsers(u);
      setLogs(l);
      
      setIsAuthenticated(true);
      setError('');
    } catch (err) {
      setError('Invalid passphrase or backend unreachable. Access denied.');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAdminData(passphrase);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4 selection:bg-[var(--color-coral)] selection:text-white">
        <div className="w-full max-w-md bg-[#111111] border border-[#222] rounded-xl p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle gradient glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--color-coral)] opacity-10 blur-3xl rounded-full"></div>
          
          <div className="flex flex-col items-center mb-8 relative z-10">
            <div className="w-16 h-16 bg-[#1A1A1A] border border-[#333] rounded-2xl flex items-center justify-center mb-6 shadow-inner">
              <Shield className="w-8 h-8 text-[var(--color-coral)]" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white mb-2">Command Center</h1>
            <p className="text-[#888] text-sm text-center">Enter your developer passphrase to access the platform administrative controls.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#555]" />
                </div>
                <input
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[var(--color-coral)] focus:ring-1 focus:ring-[var(--color-coral)] transition-colors placeholder-[#555]"
                  placeholder="Secret Passphrase"
                  autoFocus
                />
              </div>
              {error && <p className="mt-2 text-xs text-red-400 font-medium">{error}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-[var(--color-coral)] hover:bg-[#ff492a] text-white font-medium py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,90,54,0.3)]"
            >
              <Unlock className="w-4 h-4" />
              Authenticate
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] font-sans flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#0A0A0A] border-r border-[#1F1F1F] flex flex-col">
        <div className="p-6 border-b border-[#1F1F1F] flex items-center gap-3">
          <img src={websiteLogo} alt="Logo" className="h-8 w-auto invert opacity-90" />
          <span className="font-display font-bold text-lg text-white">Admin</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'analytics' ? 'bg-[#1A1A1A] text-[var(--color-coral)]' : 'text-[#888] hover:bg-[#111] hover:text-[#CCC]'}`}
          >
            <Activity className="w-4 h-4" /> Analytics
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-[#1A1A1A] text-[var(--color-coral)]' : 'text-[#888] hover:bg-[#111] hover:text-[#CCC]'}`}
          >
            <Users className="w-4 h-4" /> User Roles
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'logs' ? 'bg-[#1A1A1A] text-[var(--color-coral)]' : 'text-[#888] hover:bg-[#111] hover:text-[#CCC]'}`}
          >
            <Terminal className="w-4 h-4" /> System Logs
          </button>
          <button 
            onClick={() => setActiveTab('changelog')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'changelog' ? 'bg-[#1A1A1A] text-[var(--color-coral)]' : 'text-[#888] hover:bg-[#111] hover:text-[#CCC]'}`}
          >
            <Server className="w-4 h-4" /> Changelog
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-[#1A1A1A] text-[var(--color-coral)]' : 'text-[#888] hover:bg-[#111] hover:text-[#CCC]'}`}
          >
            <Settings className="w-4 h-4" /> Platform Settings
          </button>
        </nav>

        <div className="p-4 border-t border-[#1F1F1F]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-[var(--color-coral)] flex items-center justify-center text-white font-bold text-xs">
              D
            </div>
            <div>
              <p className="text-sm font-medium text-white">Diawhiz</p>
              <p className="text-xs text-[#666]">Superadmin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b border-[#1F1F1F] flex items-center px-8 bg-[#0A0A0A]/50 backdrop-blur sticky top-0 z-10 justify-between">
          <h2 className="text-lg font-medium text-white capitalize">{activeTab.replace('-', ' ')}</h2>
          <div className="flex items-center gap-4 text-xs font-mono text-[#666]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> DB Connected</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Real-time OK</span>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          
          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0D0D0D] border border-[#1F1F1F] rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[#888] text-sm font-medium">Total Users</h3>
                    <Users className="w-4 h-4 text-[var(--color-coral)]" />
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                  <p className="text-xs text-green-400 mt-2 flex items-center gap-1"><Activity className="w-3 h-3" /> Real-time</p>
                </div>
                <div className="bg-[#0D0D0D] border border-[#1F1F1F] rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[#888] text-sm font-medium">Active Study Rooms</h3>
                    <Database className="w-4 h-4 text-[var(--color-coral)]" />
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.activeRooms}</p>
                  <p className="text-xs text-green-400 mt-2 flex items-center gap-1"><Activity className="w-3 h-3" /> Live public rooms</p>
                </div>
                <div className="bg-[#0D0D0D] border border-[#1F1F1F] rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[#888] text-sm font-medium">System Uptime</h3>
                    <Server className="w-4 h-4 text-[var(--color-coral)]" />
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.uptime}</p>
                  <p className="text-xs text-[#888] mt-2 flex items-center gap-1"><Clock className="w-3 h-3" /> Server running: {stats.serverUptime}</p>
                </div>
              </div>
              
              <div className="bg-[#0D0D0D] border border-[#1F1F1F] rounded-xl p-6 shadow-sm min-h-[300px] flex items-center justify-center">
                <p className="text-[#555] font-mono text-sm">[ Analytics Chart Visualization Placeholder - Needs Chart.js ]</p>
              </div>
            </div>
          )}

          {/* LOGS TAB */}
          {activeTab === 'logs' && (
            <div className="bg-[#0D0D0D] border border-[#1F1F1F] rounded-xl overflow-hidden flex flex-col h-[600px]">
              <div className="p-4 border-b border-[#1F1F1F] flex justify-between items-center bg-[#111]">
                <div className="relative w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#555]" />
                  <input type="text" placeholder="Filter logs..." className="w-full bg-[#1A1A1A] border border-[#333] rounded-md py-1.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-[var(--color-coral)]" />
                </div>
                <button onClick={() => fetchAdminData(passphrase)} className="text-xs font-mono text-[#888] hover:text-white px-3 py-1.5 bg-[#1A1A1A] rounded border border-[#333]">Refresh Logs</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs">
                {logs.map(log => (
                  <div key={log.id} className="flex gap-4 p-2 hover:bg-[#151515] rounded border border-transparent hover:border-[#222]">
                    <span className="text-[#666] w-24 shrink-0">{new Date(log.time).toLocaleTimeString()}</span>
                    <span className={`w-20 shrink-0 font-bold ${log.type === 'error' ? 'text-red-400' : log.type === 'warning' ? 'text-amber-400' : 'text-blue-400'}`}>
                      [{log.type.toUpperCase()}]
                    </span>
                    <span className="text-[#CCC]">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="bg-[#0D0D0D] border border-[#1F1F1F] rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#111] border-b border-[#1F1F1F] text-[#888]">
                  <tr>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Role</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F1F1F]">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-[#151515]">
                      <td className="px-6 py-4 font-medium text-white">{user.name}</td>
                      <td className="px-6 py-4 text-[#888]">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold font-mono ${user.role === 'ADMIN' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : user.role === 'MODERATOR' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-[#222] text-[#888] border border-[#333]'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-xs text-green-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button className="text-xs text-[#888] hover:text-white px-2 py-1 border border-[#333] hover:border-[#555] rounded transition-colors">Edit Role</button>
                        <button className="text-xs text-red-400 hover:text-red-300 px-2 py-1 border border-red-900/30 hover:border-red-500/50 bg-red-500/5 rounded transition-colors">Suspend</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* CHANGELOG TAB */}
          {activeTab === 'changelog' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium">System Deployments & Updates</h3>
                <button className="btn-primary text-xs px-4 py-2 bg-[var(--color-coral)] hover:bg-[#ff492a] text-white rounded font-medium">Trigger New Build</button>
              </div>
              <div className="bg-[#0D0D0D] border border-[#1F1F1F] rounded-xl p-6 space-y-8">
                {CHANGELOG.map((log, i) => (
                  <div key={i} className="flex gap-4 relative">
                    {i !== CHANGELOG.length - 1 && <div className="absolute left-4 top-10 bottom-[-32px] w-px bg-[#333]"></div>}
                    <div className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#333] flex items-center justify-center shrink-0 z-10">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-sm font-bold text-[var(--color-coral)]">{log.version}</span>
                        <span className="text-xs text-[#666]">{log.date}</span>
                      </div>
                      <p className="text-[#AAA] text-sm leading-relaxed">{log.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="bg-[#0D0D0D] border border-[#1F1F1F] rounded-xl p-6">
              <h3 className="text-white font-medium mb-6 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Danger Zone
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-[#333] rounded-lg bg-[#111]">
                  <div>
                    <h4 className="text-white text-sm font-medium">Maintenance Mode</h4>
                    <p className="text-xs text-[#888] mt-1">Locks down the entire platform for all non-admin users. Use only during major migrations.</p>
                  </div>
                  <button className="px-4 py-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 rounded text-sm font-medium transition-colors">
                    Enable
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-[#333] rounded-lg bg-[#111]">
                  <div>
                    <h4 className="text-white text-sm font-medium">Disable New Signups</h4>
                    <p className="text-xs text-[#888] mt-1">Prevents any new user registrations across the platform.</p>
                  </div>
                  <button className="px-4 py-2 bg-[#222] text-white border border-[#444] hover:bg-[#333] rounded text-sm font-medium transition-colors">
                    Toggle Off
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};
