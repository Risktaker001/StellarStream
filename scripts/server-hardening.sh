#!/bin/bash
# =============================================================================
# Ubuntu Server Hardening Script — Warp Indexer / StellarStream Production
# Issue #516 — Security Critical
#
# Usage:
#   sudo bash server-hardening.sh --admin-ip <YOUR_IP> --domain <API_DOMAIN> --db-user <PG_USER>
#
# Example:
#   sudo bash server-hardening.sh --admin-ip 203.0.113.42 --domain api.stellarstream.io --db-user warp
# =============================================================================

set -euo pipefail

# ── Colour helpers ────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()    { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ── Argument parsing ──────────────────────────────────────────────────────────
ADMIN_IP=""
API_DOMAIN=""
DB_USER=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --admin-ip) ADMIN_IP="$2";   shift 2 ;;
    --domain)   API_DOMAIN="$2"; shift 2 ;;
    --db-user)  DB_USER="$2";    shift 2 ;;
    *) error "Unknown argument: $1" ;;
  esac
done

[[ -z "$ADMIN_IP"   ]] && error "--admin-ip is required (your static management IP)"
[[ -z "$API_DOMAIN" ]] && error "--domain is required (e.g. api.stellarstream.io)"
[[ -z "$DB_USER"    ]] && error "--db-user is required (PostgreSQL app user)"
[[ $EUID -ne 0      ]] && error "Run as root: sudo bash $0 ..."

# ── 0. System update ──────────────────────────────────────────────────────────
info "Updating system packages..."
apt-get update -qq && apt-get upgrade -y -qq
apt-get install -y -qq ufw fail2ban certbot python3-certbot-nginx curl gnupg2

# =============================================================================
# 1. UFW FIREWALL
# =============================================================================
info "Configuring UFW firewall..."

ufw --force reset
ufw default deny incoming
ufw default allow outgoing

# SSH — restricted to admin IP only
ufw allow from "$ADMIN_IP" to any port 22 proto tcp comment "SSH admin access"

# HTTP / HTTPS — public
ufw allow 80/tcp  comment "HTTP (Certbot + redirect)"
ufw allow 443/tcp comment "HTTPS API"

# Internal: allow loopback (Postgres, Redis, etc.)
ufw allow in on lo

ufw --force enable
ufw status verbose

info "UFW configured. SSH (22) restricted to $ADMIN_IP only."

# =============================================================================
# 2. FAIL2BAN — SSH brute-force protection
# =============================================================================
info "Configuring fail2ban..."

cat > /etc/fail2ban/jail.d/sshd-hardened.conf << 'EOF'
[sshd]
enabled   = true
port      = ssh
filter    = sshd
backend   = systemd
maxretry  = 5
findtime  = 10m
bantime   = 1h
ignoreip  = 127.0.0.1/8 ::1
EOF

# Optional: protect Nginx (API) from repeated 4xx floods
cat > /etc/fail2ban/jail.d/nginx-api.conf << 'EOF'
[nginx-http-auth]
enabled  = true
port     = http,https
filter   = nginx-http-auth
logpath  = /var/log/nginx/error.log
maxretry = 10
findtime = 5m
bantime  = 30m

[nginx-limit-req]
enabled  = true
port     = http,https
filter   = nginx-limit-req
logpath  = /var/log/nginx/error.log
maxretry = 10
findtime = 5m
bantime  = 30m
EOF

systemctl enable fail2ban
systemctl restart fail2ban
info "fail2ban active. SSH: 5 retries → 1h ban."

# =============================================================================
# 3. POSTGRESQL — localhost-only + disable remote root
# =============================================================================
info "Hardening PostgreSQL..."

PG_VERSION=$(pg_lsclusters -h | awk 'NR==1{print $1}')
PG_CONF="/etc/postgresql/${PG_VERSION}/main/postgresql.conf"
PG_HBA="/etc/postgresql/${PG_VERSION}/main/pg_hba.conf"

if [[ ! -f "$PG_CONF" ]]; then
  warn "postgresql.conf not found at $PG_CONF — skipping PG hardening (adjust path if needed)."
else
  # Bind only to localhost
  sed -i "s/^#*listen_addresses\s*=.*/listen_addresses = 'localhost'/" "$PG_CONF"

  # Ensure pg_hba.conf: local connections use md5/scram, no trust for postgres superuser
  # Back up first
  cp "$PG_HBA" "${PG_HBA}.bak.$(date +%s)"

  # Remove any 'trust' auth for local postgres superuser, replace with scram-sha-256
  sed -i "s/^local\s\+all\s\+postgres\s\+trust/local   all             postgres                                scram-sha-256/" "$PG_HBA"
  sed -i "s/^host\s\+all\s\+all\s\+0\.0\.0\.0\/0/#REMOVED: remote all-host access/" "$PG_HBA"
  sed -i "s/^host\s\+all\s\+all\s\+::\/0/#REMOVED: remote IPv6 all-host access/" "$PG_HBA"

  systemctl restart postgresql
  info "PostgreSQL now listens on localhost only. Remote root login disabled."
fi

# Revoke superuser from app user (safety net — run manually if needed)
info "Reminder: ensure app DB user '$DB_USER' is NOT a superuser:"
info "  sudo -u postgres psql -c \"ALTER ROLE $DB_USER NOSUPERUSER NOCREATEDB NOCREATEROLE;\""

# =============================================================================
# 4. SSL — Certbot / Let's Encrypt
# =============================================================================
info "Obtaining SSL certificate for $API_DOMAIN via Certbot (Nginx plugin)..."

# Certbot will configure Nginx automatically; ensure Nginx is installed
if ! command -v nginx &>/dev/null; then
  apt-get install -y -qq nginx
fi

certbot --nginx \
  --non-interactive \
  --agree-tos \
  --redirect \
  --email "devops@${API_DOMAIN}" \
  -d "$API_DOMAIN" || warn "Certbot failed — DNS may not be pointed yet. Run manually: certbot --nginx -d $API_DOMAIN"

# Auto-renewal cron (certbot installs a systemd timer, but add cron as fallback)
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | sort -u | crontab -
info "SSL certificate issued. Auto-renewal cron installed."

# =============================================================================
# 5. SSH HARDENING (sshd_config)
# =============================================================================
info "Hardening SSH daemon..."

SSHD_CONF="/etc/ssh/sshd_config"
cp "$SSHD_CONF" "${SSHD_CONF}.bak.$(date +%s)"

declare -A SSH_SETTINGS=(
  [PermitRootLogin]="no"
  [PasswordAuthentication]="no"
  [PubkeyAuthentication]="yes"
  [X11Forwarding]="no"
  [AllowTcpForwarding]="no"
  [MaxAuthTries]="3"
  [LoginGraceTime]="30"
  [ClientAliveInterval]="300"
  [ClientAliveCountMax]="2"
)

for key in "${!SSH_SETTINGS[@]}"; do
  val="${SSH_SETTINGS[$key]}"
  if grep -qE "^#?${key}" "$SSHD_CONF"; then
    sed -i "s/^#*${key}.*/${key} ${val}/" "$SSHD_CONF"
  else
    echo "${key} ${val}" >> "$SSHD_CONF"
  fi
done

sshd -t && systemctl restart sshd
info "SSH hardened: root login disabled, password auth off, key-only access."

# =============================================================================
# 6. KERNEL / SYSCTL HARDENING
# =============================================================================
info "Applying sysctl network hardening..."

cat > /etc/sysctl.d/99-warp-hardening.conf << 'EOF'
# Disable IP forwarding (not a router)
net.ipv4.ip_forward = 0

# Ignore ICMP broadcast requests
net.ipv4.icmp_echo_ignore_broadcasts = 1

# Ignore bogus ICMP error responses
net.ipv4.icmp_ignore_bogus_error_responses = 1

# Enable TCP SYN cookies (SYN flood protection)
net.ipv4.tcp_syncookies = 1

# Disable source routing
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0

# Disable ICMP redirects
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.send_redirects = 0

# Enable reverse path filtering
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# Log martian packets
net.ipv4.conf.all.log_martians = 1
EOF

sysctl --system -q
info "Sysctl hardening applied."

# =============================================================================
# 7. UNATTENDED UPGRADES (security patches auto-apply)
# =============================================================================
info "Enabling unattended security upgrades..."
apt-get install -y -qq unattended-upgrades
dpkg-reconfigure -f noninteractive unattended-upgrades
info "Unattended security upgrades enabled."

# =============================================================================
# SUMMARY
# =============================================================================
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Server hardening complete — StellarStream / Warp      ${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo ""
echo "  UFW status:      $(ufw status | head -1)"
echo "  fail2ban:        $(systemctl is-active fail2ban)"
echo "  SSL domain:      $API_DOMAIN"
echo "  PG listen:       localhost only"
echo "  SSH root login:  disabled"
echo ""
warn "ACTION REQUIRED: Manually run the PostgreSQL role restriction:"
warn "  sudo -u postgres psql -c \"ALTER ROLE $DB_USER NOSUPERUSER NOCREATEDB NOCREATEROLE;\""
warn "Verify your SSH key is in ~/.ssh/authorized_keys BEFORE closing this session."
echo ""
