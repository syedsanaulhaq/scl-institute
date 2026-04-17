with open('/var/www/moodle-9090/theme/purity_modern/layout/columns2.php', 'r') as f:
    content = f.read()

# Remove the AMD call
content = content.replace("// Load darken nav module\n$PAGE->requires->js_call_amd('theme_purity_modern/darken_nav', 'init');\n", "")

with open('/var/www/moodle-9090/theme/purity_modern/layout/columns2.php', 'w') as f:
    f.write(content)

print("Removed AMD module call")
