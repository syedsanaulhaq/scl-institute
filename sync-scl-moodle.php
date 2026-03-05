<?php
/**
 * SCL-Moodle Data Synchronization Script
 * 
 * Purpose: Sync student applications and auto-enroll in Moodle
 * Author: Auto-generated
 * Date: March 5, 2026
 * 
 * Usage: php sync-scl-moodle.php [--dry-run] [--verbose]
 */

// Configuration
error_reporting(E_ALL);
ini_set('display_errors', 1);

$config = [
    'scl' => [
        'host' => getenv('DB_HOST') ?: 'localhost',
        'port' => getenv('DB_PORT') ?: 33062,
        'user' => getenv('DB_USER') ?: 'root',
        'pass' => getenv('DB_PASS') ?: 'rootpassword',
        'name' => 'scl_institute'
    ],
    'moodle' => [
        'host' => getenv('MOODLE_DB_HOST') ?: 'localhost',
        'port' => getenv('MOODLE_DB_PORT') ?: 33062,
        'user' => getenv('MOODLE_DB_USER') ?: 'root',
        'pass' => getenv('MOODLE_DB_PASS') ?: 'rootpassword',
        'name' => 'moodle'
    ]
];

$dryRun = in_array('--dry-run', $argv);
$verbose = in_array('--verbose', $argv);

class SyncEngine {
    private $scl_conn;
    private $moodle_conn;
    private $dry_run;
    private $verbose;
    private $stats = [];

    public function __construct($config, $dryRun = false, $verbose = false) {
        $this->dry_run = $dryRun;
        $this->verbose = $verbose;
        $this->stats = [
            'applications_processed' => 0,
            'users_created' => 0,
            'enrollments_created' => 0,
            'errors' => []
        ];

        $this->connect($config);
    }

    private function connect($config) {
        try {
            $this->scl_conn = new mysqli(
                $config['scl']['host'] . ':' . $config['scl']['port'],
                $config['scl']['user'],
                $config['scl']['pass'],
                $config['scl']['name']
            );

            if ($this->scl_conn->connect_error) {
                throw new Exception("SCL DB Error: " . $this->scl_conn->connect_error);
            }

            $this->moodle_conn = new mysqli(
                $config['moodle']['host'] . ':' . $config['moodle']['port'],
                $config['moodle']['user'],
                $config['moodle']['pass'],
                $config['moodle']['name']
            );

            if ($this->moodle_conn->connect_error) {
                throw new Exception("Moodle DB Error: " . $this->moodle_conn->connect_error);
            }

            $this->log("✓ Database connections established");
        } catch (Exception $e) {
            die("Connection failed: " . $e->getMessage());
        }
    }

    public function sync() {
        $this->log("\n========== SCL-MOODLE SYNC START ==========\n");

        try {
            // Step 1: Get applications to sync
            $applications = $this->getApplicationsToSync();
            $this->log("Found " . count($applications) . " applications to sync");

            if (empty($applications)) {
                $this->log("No applications to sync. Exiting.");
                $this->printStats();
                return;
            }

            // Step 2: Create/update Moodle users
            foreach ($applications as $app) {
                $this->syncUser($app);
            }

            // Step 3: Enroll students in courses
            foreach ($applications as $app) {
                $this->enrollStudent($app);
            }

            // Step 4: Update enrollment mapping
            $this->updateMappings();

            $this->log("\n✓ Sync completed successfully!");
        } catch (Exception $e) {
            $this->log("\n✗ Sync failed: " . $e->getMessage(), 'error');
            $this->stats['errors'][] = $e->getMessage();
        }

        $this->printStats();
        $this->closeConnections();
    }

    private function getApplicationsToSync() {
        $query = "
            SELECT 
                id, email, first_name, last_name, course_code, course_title, 
                application_status, contact_number, address_line1, town_city, 
                country_of_residence
            FROM student_applications
            WHERE is_deleted = 0 
              AND application_status IN ('accepted', 'conditional_accept', 'conditional_accepted')
        ";

        $result = $this->scl_conn->query($query);
        if (!$result) {
            throw new Exception("Query failed: " . $this->scl_conn->error);
        }

        $applications = [];
        while ($row = $result->fetch_assoc()) {
            $applications[] = $row;
        }
        return $applications;
    }

    private function syncUser($app) {
        // Check if user exists
        $email = $this->moodle_conn->real_escape_string($app['email']);
        $checkQuery = "SELECT id FROM mdl_user WHERE email = '$email'";
        $result = $this->moodle_conn->query($checkQuery);

        if ($result && $result->num_rows > 0) {
            $this->log("User exists: " . $app['email']);
            return;
        }

        // Create new user
        $username = strtolower('scl_' . str_replace('@', '_', $app['email']));
        $username = substr($username, 0, 100); // Moodle username max 100 chars

        $firstname = $this->moodle_conn->real_escape_string($app['first_name']);
        $lastname = $this->moodle_conn->real_escape_string($app['last_name']);
        $password = md5($app['email'] . 'TempPassword2026!');
        $now = time();

        $insertQuery = "
            INSERT INTO mdl_user (
                auth, confirmed, policyagreed, deleted, suspended, mnethostid,
                username, password, firstname, lastname, email,
                phone1, city, country, department, description, descriptionformat,
                fcreated, timemodified, timecreated, firstaccess
            ) VALUES (
                'manual', 1, 1, 0, 0, 1,
                '$username', '$password', '$firstname', '$lastname', '$email',
                '{$app['contact_number']}', '{$app['town_city']}', 
                '{$app['country_of_residence']}', '{$app['course_title']}',
                'Application: {$app['course_title']} | Status: {$app['application_status']}', 1,
                $now, $now, $now, $now
            )
        ";

        if (!$this->dryRun) {
            if (!$this->moodle_conn->query($insertQuery)) {
                throw new Exception("Failed to create user: " . $this->moodle_conn->error);
            }
        }

        $this->log("Created user: " . $app['email']);
        $this->stats['users_created']++;
        $this->stats['applications_processed']++;
    }

    private function enrollStudent($app) {
        $email = $this->moodle_conn->real_escape_string($app['email']);
        
        // Get user ID
        $userQuery = "SELECT id FROM mdl_user WHERE email = '$email'";
        $userResult = $this->moodle_conn->query($userQuery);
        
        if (!$userResult || $userResult->num_rows == 0) {
            $this->log("User not found: " . $app['email'], 'warn');
            return;
        }

        $user = $userResult->fetch_assoc();
        $userId = $user['id'];

        // Find matching course
        $courseCode = $this->moodle_conn->real_escape_string($app['course_code']);
        $courseTitle = $this->moodle_conn->real_escape_string($app['course_title']);

        $courseQuery = "
            SELECT id FROM mdl_course 
            WHERE (shortname LIKE '%$courseCode%' OR fullname LIKE '%$courseTitle%')
            LIMIT 1
        ";

        $courseResult = $this->moodle_conn->query($courseQuery);
        if (!$courseResult || $courseResult->num_rows == 0) {
            $this->log("Course not found for: " . $app['course_title'], 'warn');
            return;
        }

        $course = $courseResult->fetch_assoc();
        $courseId = $course['id'];

        // Get or create manual enrol instance
        $enrolQuery = "
            SELECT id FROM mdl_enrol 
            WHERE courseid = $courseId AND enrol = 'manual'
            LIMIT 1
        ";

        $enrolResult = $this->moodle_conn->query($enrolQuery);
        $enrolId = null;

        if ($enrolResult && $enrolResult->num_rows > 0) {
            $enrol = $enrolResult->fetch_assoc();
            $enrolId = $enrol['id'];
        } else {
            // Create manual enrol instance
            $createEnrolQuery = "
                INSERT INTO mdl_enrol (enrol, status, courseid, sortorder, timecreated, timemodified)
                VALUES ('manual', 0, $courseId, 0, " . time() . ", " . time() . ")
            ";

            if (!$this->dryRun && !$this->moodle_conn->query($createEnrolQuery)) {
                throw new Exception("Failed to create enrol: " . $this->moodle_conn->error);
            }
            $enrolId = $this->moodle_conn->insert_id;
        }

        // Check if already enrolled
        $checkEnrollQuery = "
            SELECT id FROM mdl_user_enrolments 
            WHERE userid = $userId AND enrolid = $enrolId
        ";

        $checkEnrollResult = $this->moodle_conn->query($checkEnrollQuery);
        if ($checkEnrollResult && $checkEnrollResult->num_rows > 0) {
            $this->log("Already enrolled: " . $app['email'] . " in course ID $courseId");
            return;
        }

        // Enroll student
        $enrollQuery = "
            INSERT INTO mdl_user_enrolments (enrolid, userid, status, timestart, timeend, modifierid, timemodified)
            VALUES ($enrolId, $userId, 0, " . time() . ", 0, 2, " . time() . ")
        ";

        if (!$this->dryRun) {
            if (!$this->moodle_conn->query($enrollQuery)) {
                throw new Exception("Failed to enroll user: " . $this->moodle_conn->error);
            }
        }

        $this->log("Enrolled: " . $app['email'] . " in Moodle course ID $courseId");
        $this->stats['enrollments_created']++;
    }

    private function updateMappings() {
        $query = "
            UPDATE scl_institute.course_enrollment_mapping cem
            SET 
                sync_status = 'Synced',
                last_sync_date = NOW(),
                enrollment_status = 'Enrolled'
            WHERE sync_status = 'Pending'
        ";

        if (!$this->dryRun && !$this->moodle_conn->query($query)) {
            $this->log("Failed to update mappings: " . $this->moodle_conn->error, 'error');
        } else {
            $this->log("Mapping table updated");
        }
    }

    private function log($message, $type = 'info') {
        $prefix = match($type) {
            'error' => '[ERROR]',
            'warn' => '[WARN]',
            'info' => '[INFO]',
            default => ''
        };

        if ($this->verbose || $type === 'error') {
            echo $prefix . " " . $message . "\n";
        }
    }

    private function printStats() {
        echo "\n========== SYNC STATISTICS ==========\n";
        echo "Applications Processed: " . $this->stats['applications_processed'] . "\n";
        echo "Users Created: " . $this->stats['users_created'] . "\n";
        echo "Enrollments Created: " . $this->stats['enrollments_created'] . "\n";
        
        if (!empty($this->stats['errors'])) {
            echo "\nErrors:\n";
            foreach ($this->stats['errors'] as $error) {
                echo "  - " . $error . "\n";
            }
        }
        
        if ($this->dry_run) {
            echo "\n[DRY RUN MODE - No changes were made]\n";
        }
    }

    private function closeConnections() {
        if ($this->scl_conn) $this->scl_conn->close();
        if ($this->moodle_conn) $this->moodle_conn->close();
    }
}

// Run sync
$engine = new SyncEngine($config, $dryRun, $verbose);
$engine->sync();
