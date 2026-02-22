#!/usr/bin/env python3
"""Sync Moodle course IDs back into backend DB (scl_institute.courses)."""

import subprocess

BACKEND_DB = {
    "host": "127.0.0.1",
    "port": 33061,
    "user": "scl_user",
    "pass": "scl_password",
    "db": "scl_institute",
}

MOODLE_DB = {
    "user": "root",
    "db": "moodle",
}


def run(cmd, sql):
    proc = subprocess.run(cmd, input=sql.encode("utf-8"), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr.decode("utf-8", errors="ignore").strip())
    return proc.stdout.decode("utf-8", errors="ignore").strip()


def main():
    # Read Moodle course ids
    moodle_cmd = ["mysql", "-u", MOODLE_DB["user"], "-N", "-B", MOODLE_DB["db"]]
    rows = run(
        moodle_cmd,
        "SELECT id, idnumber FROM mdl_course WHERE idnumber LIKE 'SCL-%';",
    ).splitlines()

    # Build update statements for backend
    updates = []
    for row in rows:
        parts = row.split("\t")
        if len(parts) != 2:
            continue
        moodle_id, code = parts
        updates.append((moodle_id, code))

    if not updates:
        print("No Moodle courses found to sync.")
        return 0

    # Apply updates to backend DB
    backend_cmd = [
        "mysql",
        "-h",
        BACKEND_DB["host"],
        "-P",
        str(BACKEND_DB["port"]),
        "-u",
        BACKEND_DB["user"],
        f"-p{BACKEND_DB['pass']}",
        "-N",
        "-B",
        BACKEND_DB["db"],
    ]

    sql_parts = ["START TRANSACTION;"]
    for moodle_id, code in updates:
        code_esc = code.replace("'", "\\'")
        sql_parts.append(
            f"UPDATE courses SET moodle_course_id = {int(moodle_id)} WHERE course_code = '{code_esc}';"
        )
    sql_parts.append("COMMIT;")

    run(backend_cmd, "\n".join(sql_parts))

    print(f"Synced {len(updates)} Moodle course IDs to backend.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
