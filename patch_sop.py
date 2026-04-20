import pathlib

p = pathlib.Path(r'public-portal\src\components\StudentAdmissionForm.jsx')
s = p.read_text(encoding='utf-8')

# 1. Add SOP to documentTypes array
old1 = "    'Visa / Immigration Document'\n  ];"
new1 = "    'Visa / Immigration Document',\n    'Statement of Purpose (SOP)'\n  ];"
if 'Statement of Purpose' not in s:
    s = s.replace(old1, new1)
    print('1. Added SOP to documentTypes')
else:
    print('1. SOP already in documentTypes')

# 2. Add SOP to documentFieldMap
old2 = "      'Visa / Immigration Document': 'visa_immigration'\n    };"
new2 = "      'Visa / Immigration Document': 'visa_immigration',\n      'Statement of Purpose (SOP)': 'statement_of_purpose'\n    };"
if 'statement_of_purpose' not in s:
    s = s.replace(old2, new2)
    print('2. Added SOP to documentFieldMap')
else:
    print('2. SOP already in documentFieldMap')

p.write_text(s, encoding='utf-8')

print('Done. Checks:')
print('  SOP in documentTypes:', 'Statement of Purpose' in s)
print('  statement_of_purpose in map:', 'statement_of_purpose' in s)
