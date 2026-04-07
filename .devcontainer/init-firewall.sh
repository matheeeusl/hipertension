#!/bin/bash
# ===========================================================
# AI Jail — Default-deny firewall
# Only whitelisted domains can be reached from this container
# ===========================================================

set -euo pipefail

echo "==> Initializing AI Jail firewall..."

iptables -F OUTPUT 2>/dev/null || true

# Allow basics
iptables -A OUTPUT -o lo -j ACCEPT
iptables -A OUTPUT -p udp --dport 53 -j ACCEPT
iptables -A OUTPUT -p tcp --dport 53 -j ACCEPT
iptables -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Anthropic (Claude Code API + Auth)
iptables -A OUTPUT -p tcp --dport 443 -d api.anthropic.com -j ACCEPT
iptables -A OUTPUT -p tcp --dport 443 -d claude.ai -j ACCEPT
iptables -A OUTPUT -p tcp --dport 443 -d statsig.anthropic.com -j ACCEPT
iptables -A OUTPUT -p tcp --dport 443 -d sentry.io -j ACCEPT

# npm
iptables -A OUTPUT -p tcp --dport 443 -d registry.npmjs.org -j ACCEPT

# GitHub
iptables -A OUTPUT -p tcp --dport 443 -d github.com -j ACCEPT
iptables -A OUTPUT -p tcp --dport 443 -d api.github.com -j ACCEPT
iptables -A OUTPUT -p tcp --dport 443 -d objects.githubusercontent.com -j ACCEPT
iptables -A OUTPUT -p tcp --dport 22 -d github.com -j ACCEPT

# Node.js
iptables -A OUTPUT -p tcp --dport 443 -d nodejs.org -j ACCEPT

# Block everything else
iptables -A OUTPUT -j DROP

echo "==> AI Jail firewall active."
echo "    Allowed: anthropic, npm, github, nodejs"
echo "    Blocked: everything else"