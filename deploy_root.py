import ftplib

HOST = "ftp.us.stackcp.com"
USER = "kitty@artkitty.net"
PASS = '1bZ1XL3O`t$:'

print("Connecting to FTP to deploy root meow_root_index.html...")
ftp = ftplib.FTP(HOST)
ftp.login(USER, PASS)
ftp.cwd("/public_html/meow")

with open("meow_root_index.html", "rb") as f:
    ftp.storbinary("STOR index.html", f)

ftp.quit()
print("SUCCESS: Root index.html deployed! meow.artkitty.net now auto-redirects directly to /lcmd/")
