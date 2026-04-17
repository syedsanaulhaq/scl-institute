# Read the layout file
with open('/var/www/moodle-9090/theme/purity_modern/layout/columns2.php', 'r') as f:
    content = f.read()

# Add include for footer script after template render
new_content = content.replace(
    "echo $OUTPUT->render_from_template('theme_boost/columns2', $templatecontext);\n\n// Include darkify footer script",
    "echo $OUTPUT->render_from_template('theme_boost/columns2', $templatecontext);"
)

new_content = content.replace(
    "echo $OUTPUT->render_from_template('theme_boost/columns2', $templatecontext);",
    "echo $OUTPUT->render_from_template('theme_boost/columns2', $templatecontext);\n\n// Include darkify footer script\ninclude(__DIR__ . '/footer_darkify.php');"
)

with open('/var/www/moodle-9090/theme/purity_modern/layout/columns2.php', 'w') as f:
    f.write(new_content)

print("Updated layout with footer script")
