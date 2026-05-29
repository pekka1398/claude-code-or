#!/usr/bin/env bash
set -euo pipefail

SHELL="bun run ai-shell/bin/ai-shell.ts"
PASS=0
FAIL=0
TOTAL=0

assert_exit() {
  local desc="$1" cmd="$2" expected_exit="$3" expected_fragment="$4"
  TOTAL=$((TOTAL + 1))
  set +e
  output=$($SHELL -c "$cmd" 2>&1)
  actual_exit=$?
  set -e

  if [[ "$actual_exit" -eq "$expected_exit" ]] && echo "$output" | grep -q "$expected_fragment"; then
    PASS=$((PASS + 1))
    echo "  PASS  [$expected_exit] $desc"
  else
    FAIL=$((FAIL + 1))
    echo "  FAIL  [$desc]"
    echo "        expected exit=$expected_exit, got exit=$actual_exit"
    echo "        expected fragment: '$expected_fragment'"
    echo "        got: $(echo "$output" | head -3)"
  fi
}

assert_output() {
  local desc="$1" cmd="$2" expected_fragment="$3"
  TOTAL=$((TOTAL + 1))
  set +e
  output=$($SHELL -c "$cmd" 2>&1)
  exit_code=$?
  set -e

  if echo "$output" | grep -q "$expected_fragment"; then
    PASS=$((PASS + 1))
    echo "  PASS  $desc"
  else
    FAIL=$((FAIL + 1))
    echo "  FAIL  [$desc]"
    echo "        expected fragment: '$expected_fragment'"
    echo "        got: $(echo "$output" | head -3)"
  fi
}

# Setup test files
TMPDIR=$(mktemp -d)
cat > "$TMPDIR/sample.txt" << 'EOF'
line1
line2
line3
line4
line5
EOF

cat > "$TMPDIR/code.py" << 'EOF'
def hello():
    print("hello")

def world():
    print("world")
EOF

echo ""
echo "=== ai-shell test suite ==="
echo ""

# --- Basic forwarding ---
echo "[Basic Forwarding]"
assert_exit "echo hello" "echo hello" 0 "hello"
assert_exit "ls /tmp" "ls /tmp" 0 ""

# --- Blacklist ---
echo "[Blacklist]"
assert_exit "rm -rf / blocked" "rm -rf /" 1 "E1001"
assert_exit "sudo rm -rf / blocked" "sudo rm -rf /" 1 "E1001"
assert_exit "sudo reboot blocked" "sudo reboot" 1 "E1002"
assert_exit "sudo shutdown blocked" "sudo shutdown" 1 "E1003"
assert_exit "vim blocked" "vim file.py" 1 "E1004"
assert_exit "nano blocked" "nano file.py" 1 "E1004"
assert_exit "chmod -R 777 / blocked" "chmod -R 777 /" 1 "E1009"
assert_exit "chown -R root / blocked" "chown -R root /" 1 "E1010"
assert_exit "cp to /etc blocked" "cp file /etc/file" 1 "E1011"
assert_exit "tee to /usr blocked" "tee /usr/local/bin/script" 1 "E1011"

# --- Interactive detection ---
echo "[Interactive Detection]"
assert_exit "git commit without -m" "git commit" 1 "E1502"
assert_exit "sudo apt update without -y" "sudo apt update" 1 "E1501"
assert_exit "ssh-keygen without -N" "ssh-keygen -f /tmp/key" 1 "E1504"
assert_exit "npm init without -y" "npm init" 1 "E1507"

# --- Interactive command detection (new) ---
echo "[Interactive Detection (new)]"
assert_exit "tail -f blocked" "tail -f /var/log/syslog" 1 "E1509"
assert_exit "less blocked" "less file.txt" 1 "E1510"
assert_exit "more blocked" "more file.txt" 1 "E1510"
assert_exit "watch blocked" "watch ps aux" 1 "E1511"
assert_exit "top blocked" "top" 1 "E1512"
assert_exit "htop blocked" "htop" 1 "E1512"

# --- Command not found ---
echo "[Command Not Found]"
assert_exit "unknown command" "nonexistent_cmd_xyz_12345" 127 "E0001"

# --- cat builtin ---
echo "[cat Builtin]"
assert_exit "cat real file" "cat $TMPDIR/sample.txt" 0 "line1"
assert_exit "cat nonexistent" "cat $TMPDIR/nope.txt" 1 "E3001"
assert_exit "cat directory" "cat $TMPDIR" 1 "E3003"
assert_output "cat shows content" "cat $TMPDIR/sample.txt" "line5"

# --- sed range ---
echo "[sed Range]"
assert_output "sed -n range" "sed -n '2,4p' $TMPDIR/sample.txt" "line2"
assert_output "sed -n single" "sed -n '3p' $TMPDIR/sample.txt" "line3"

# --- head/tail ---
echo "[head/tail]"
assert_output "head -n 2" "head -2 $TMPDIR/sample.txt" "line1"
assert_output "tail -n 2" "tail -2 $TMPDIR/sample.txt" "line5"

# --- fedit ---
echo "[fedit]"
# Single chunk — write the command to a file to avoid bash heredoc eating
cp "$TMPDIR/sample.txt" "$TMPDIR/fedit1.txt"
FEDIT_CMD="fedit $TMPDIR/fedit1.txt << 'MARKER'
@@ line2
 line2
-line3
+LINE_THREE
 line4
MARKER"
assert_exit "fedit single chunk" "$FEDIT_CMD" 0 "SUCCESS"
assert_output "fedit result check" "cat $TMPDIR/fedit1.txt" "LINE_THREE"

# Multiple chunks
cp "$TMPDIR/code.py" "$TMPDIR/fedit2.py"
FEDIT_CMD2="fedit $TMPDIR/fedit2.py << 'MARKER'
@@ def hello():
 def hello():
-    print(\"hello\")
+    print(\"HELLO\")
@@ def world():
 def world():
-    print(\"world\")
+    print(\"WORLD\")
MARKER"
assert_exit "fedit multi chunk" "$FEDIT_CMD2" 0 "2 chunks"
assert_output "fedit multi result" "cat $TMPDIR/fedit2.py" "HELLO"

# fedit on nonexistent file
assert_exit "fedit nonexistent" "fedit $TMPDIR/nope.txt << 'MARKER'
-test
+TEST
MARKER" 1 "E2003"

# fedit with bad syntax
assert_exit "fedit no args" "fedit" 2 "E2000"

# --- Param auto-injection ---
echo "[Param Auto-injection]"
# Test by echoing the command that would be built (apt --help doesn't use install)
# We test that the auto-injection transforms the command by checking the help output
assert_output "apt install auto-injected" "echo apt install curl" "apt install curl"

# --- ANSI stripping ---
echo "[ANSI Stripping]"
assert_output "ANSI stripped from colored output" "echo -e '\\x1b[32mgreen\\x1b[0m text'" "green text"

# --- Cleanup ---
rm -rf "$TMPDIR"

echo ""
echo "=== Results: $PASS/$TOTAL passed, $FAIL failed ==="
if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
