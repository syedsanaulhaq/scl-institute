# Read the layout file
with open('/var/www/moodle-9090/theme/purity_modern/layout/columns2.php', 'r') as f:
    lines = f.readlines()

# Find and remove any old injected code
new_lines = []
skip_mode = False
for line in lines:
    if '// Inject inline JavaScript' in line:
        skip_mode = True
    if skip_mode and 'EOF' in line:
        skip_mode = False
        continue
    if not skip_mode:
        new_lines.append(line)

# Find the last echo statement and insert before it
insert_index = -1
for i in range(len(new_lines)-1, -1, -1):
    if "echo $OUTPUT->render_from_template" in new_lines[i]:
        insert_index = i
        break

if insert_index >= 0:
    # Insert the module load call before the echo
    new_lines.insert(insert_index, "// Load darken nav module\n")
    new_lines.insert(insert_index+1, "$PAGE->requires->js_call_amd('theme_purity_modern/darken_nav', 'init');\n")
    new_lines.insert(insert_index+2, "\n")

# Write back
with open('/var/www/moodle-9090/theme/purity_modern/layout/columns2.php', 'w') as f:
    f.writelines(new_lines)

print("Layout file updated successfully")
