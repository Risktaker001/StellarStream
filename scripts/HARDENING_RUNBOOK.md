# Server Hardening Runbook — Issue #516

Production hardening for the Ubuntu server running the Warp indexer and Postgres DB.

---

## Prerequisites

- Ubuntu 22.04 LTS (or 20.04)
- Root / sudo access
- Your static management IP address
- DNS A record for `api.stellarstream.io` already pointing to the server
- SSH key already in `~/.ssh/authorized_keys` on the server

---

## Step 1 — Run the hardening script

```bash
# Upload the script to the server
scp scripts/server-hardening.sh user@<SERVER_IP>:~/

# SSH in and run it
ssh user@<SERVER_IP>
sudo bash server-hardening.sh \
  --admin-ip <YOUR_STATIC_IP> \
  --domain api.stellarstream.io \
  --db-user warp
```

What it does automatically:
- UFW: allows only 22 (from your IP), 80, 443
- fail2ban: SSH brute-force protection (5 retries → 1h ban)
- PostgreSQL: binds to localhost only, removes trust auth
- Certbot: issues Let's Encrypt cert for the API domain
- SSH daemon: disables root login and password auth
- sysctl: SYN flood protection, ICMP hardening, reverse path filtering
- Unattended upgrades: auto-applies security patches

---

## Step 2 — Install Nginx config

```bash
sudo cp scripts/nginx-api.conf /etc/nginx/sites-available/stellarstream-api
sudo ln -s /etc/nginx/sites-available/stellarstream-api /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## Step 3 — PostgreSQL role hardening

```bash
sudo -u postgres psql -f scripts/postgres-hardening.sql
```

Then connect to the app database and grant minimal permissions:

```sql
\c warpdb
GRANT CONNECT ON DATABASE warpdb TO warp;
GRANT USAGE ON SCHEMA public TO warp;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO warp;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO warp;
```

---

## Step 4 — Verify everything

```bash
# Firewall rules
sudo ufw status verbose

# fail2ban jails active
sudo fail2ban-client status
sudo fail2ban-client status sshd

# PostgreSQL listening only on localhost
sudo ss -tlnp | grep 5432

# SSL cert validity
sudo certbot certificates

# Nginx config test
sudo nginx -t

# SSH config sanity check
sudo sshd -T | grep -E "permitrootlogin|passwordauthentication|pubkeyauthentication"
```

---

## Ongoing maintenance

| Task | Command |
|------|---------|
| Check banned IPs | `sudo fail2ban-client status sshd` |
| Unban an IP | `sudo fail2ban-client set sshd unbanip <IP>` |
| Renew SSL manually | `sudo certbot renew --dry-run` |
| View UFW logs | `sudo tail -f /var/log/ufw.log` |
| Check unattended upgrades | `sudo unattended-upgrades --dry-run` |

---

## Security notes

- Store all secrets (DB passwords, API keys) in a secrets manager or `.env` file with `chmod 600`, never in source control.
- Rotate the PostgreSQL `warp` user password after initial setup and store it in your secrets manager.
- Review fail2ban logs weekly: `/var/log/fail2ban.log`
- Set up log shipping (e.g. to CloudWatch or Loki) so you retain audit trails off-server.
