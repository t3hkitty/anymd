using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Diagnostics;
using System.Threading;

namespace AnyMD.RcloneService
{
    class Program
    {
        static string GetLanIp()
        {
            try
            {
                using (Socket socket = new Socket(AddressFamily.InterNetwork, SocketType.Dgram, 0))
                {
                    socket.Connect("8.8.8.8", 65530);
                    IPEndPoint endPoint = socket.LocalEndPoint as IPEndPoint;
                    return endPoint.Address.ToString();
                }
            }
            catch
            {
                return "127.0.0.1";
            }
        }

        static bool IsRcdAlive(int port)
        {
            try
            {
                using (TcpClient client = new TcpClient())
                {
                    IAsyncResult result = client.BeginConnect("127.0.0.1", port, null, null);
                    bool success = result.AsyncWaitHandle.WaitOne(TimeSpan.FromSeconds(1));
                    if (!success) return false;
                    client.EndConnect(result);
                    return true;
                }
            }
            catch
            {
                return false;
            }
        }

        static void Main(string[] args)
        {
            Console.Title = "AnyMD Rclone Service (Localhost + LAN)";
            Console.ForegroundColor = ConsoleColor.Magenta;
            Console.WriteLine(@"
    /\_/\  
   ( o.o )  AnyMD Rclone LAN + Localhost Service 🐾
    > ^ <   Kawaiianism v3.1 Anti-Slop Runtime
");
            Console.ResetColor();

            int port = 5572;
            string lanIp = GetLanIp();
            string tempDir = Path.Combine(Path.GetTempPath(), "anymd_rclone_cache");
            Directory.CreateDirectory(tempDir);

            Console.WriteLine("[+] Detected Primary LAN IP : " + lanIp);
            Console.WriteLine("[+] Loopback Endpoint       : http://127.0.0.1:" + port);
            Console.WriteLine("[+] LAN Endpoint            : http://" + lanIp + ":" + port);
            Console.WriteLine("[+] Cache Directory         : " + tempDir + "\n");

            if (IsRcdAlive(port))
            {
                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("[*] rclone rcd daemon is already running on port " + port);
                Console.ResetColor();
                Console.WriteLine("\nPress Enter to exit or Ctrl+C to close.");
                Console.ReadLine();
                return;
            }

            string rcloneArgs = string.Format("rcd --rc-addr=0.0.0.0:{0} --rc-no-auth --rc-allow-origin=\"*\" --cache-dir=\"{1}\" --transfers=8 --checkers=16 --buffer-size=32Mi --fast-list", port, tempDir);

            ProcessStartInfo psi = new ProcessStartInfo
            {
                FileName = "rclone",
                Arguments = rcloneArgs,
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = false
            };

            try
            {
                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.WriteLine("[*] Launching: rclone " + rcloneArgs + "\n");
                Console.ResetColor();

                using (Process proc = Process.Start(psi))
                {
                    proc.OutputDataReceived += (s, e) => { if (!string.IsNullOrEmpty(e.Data)) Console.WriteLine("[rclone] " + e.Data); };
                    proc.ErrorDataReceived += (s, e) => { if (!string.IsNullOrEmpty(e.Data)) Console.WriteLine("[rclone:err] " + e.Data); };
                    proc.BeginOutputReadLine();
                    proc.BeginErrorReadLine();

                    Thread.Sleep(1500);
                    if (IsRcdAlive(port))
                    {
                        Console.ForegroundColor = ConsoleColor.Green;
                        Console.WriteLine("\n[✔] Rclone Service active & ready across LAN and localhost!");
                        Console.ResetColor();
                    }
                    else
                    {
                        Console.ForegroundColor = ConsoleColor.DarkYellow;
                        Console.WriteLine("[!] Initializing... verifying loopback / LAN endpoints.");
                        Console.ResetColor();
                    }

                    Console.WriteLine("\n[🐾] Service running in background. Press Ctrl+C to stop.");
                    proc.WaitForExit();
                }
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("[-] Error starting rclone: " + ex.Message);
                Console.WriteLine("[-] Ensure rclone is installed on system PATH, or run local flat-file zero-cloud mode.");
                Console.ResetColor();
                Console.WriteLine("\nPress Enter to exit.");
                Console.ReadLine();
            }
        }
    }
}
