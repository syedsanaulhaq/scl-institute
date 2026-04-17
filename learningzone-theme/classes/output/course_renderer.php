<?php
defined('MOODLE_INTERNAL') || die();
//echo $CFG->dirroot;
require_once($CFG->dirroot . "/course/renderer.php");
class theme_learningzone_core_course_renderer extends core_course_renderer{

public function __construct(moodle_page $page, $target) {
    parent::__construct($page, $target);
    static $theme;
    if (empty($theme)) {
    $theme = theme_config::load('learningzone');
    }

}


protected function coursecat_coursebox_content(coursecat_helper $chelper, $course) {
        global $CFG;
        if ($chelper->get_show_courses() < self::COURSECAT_SHOW_COURSES_EXPANDED) {
            return '';
        }
        if ($course instanceof stdClass) {
            $course = new core_course_list_element($course);
        }
        $content = '';

        // display course summary
        if ($course->has_summary()) {
            $content .= html_writer::start_tag('div', array('class' => 'summary'));
            $content .= $chelper->get_course_formatted_summary($course,
                array('overflowdiv' => true, 'noclean' => true, 'para' => false));
                if ($chelper->get_show_courses() >= self::COURSECAT_SHOW_COURSES_EXPANDED) {
                $icondirection = 'left';
                if ('ltr' === get_string('thisdirection', 'langconfig')) {
                    $icondirection = 'right';
                }

                // Display course contacts. See core_course_list_element::get_course_contacts().
                if ($course->has_course_contacts()) {
                    $content .= html_writer::start_tag('ul', array('class' => 'teachers'));
                    foreach ($course->get_course_contacts() as $userid => $coursecontact) {
                        global $DB, $OUTPUT;
                        $user = $DB->get_record('user', array('id' => $userid));
                        $face = $OUTPUT->user_picture($user, array('size' => 50));
                        $name = $face.$coursecontact['rolename'].': '.
                               html_writer::link(new moodle_url('/user/view.php',
                        array('id' => $userid, 'course' => SITEID)),
                        $coursecontact['username']);
                        $content .= html_writer::tag('li', $name);
                    }
                    $content .= html_writer::end_tag('ul'); // .teachers
                }
                

                if (is_enrolled(context_course::instance($course->id))) {
                    //$arrow = html_writer::tag('span', '', array('class' => ' arrow-right'));
                    $visit = html_writer::tag('span', get_string('course'));
                    $visitlink = html_writer::link(new moodle_url('/course/view.php',
                        array('id' => $course->id)), $visit);
                    $content .= html_writer::tag('div', $visitlink, array('class' => 'visitlink'));
                }
            }
                $content .= html_writer::end_tag('div'); // .summary
        }

        // display course overview files
        $contentimages = $contentfiles = '';
        foreach ($course->get_course_overviewfiles() as $file) {
            $isimage = $file->is_valid_image();
            $url = file_encode_url("$CFG->wwwroot/pluginfile.php",
                    '/'. $file->get_contextid(). '/'. $file->get_component(). '/'.
                    $file->get_filearea(). $file->get_filepath(). $file->get_filename(), !$isimage);
            if ($isimage) {
               $contentimages .= html_writer::tag('div', html_writer::link(new moodle_url('/course/view.php', array('id' => $course->id)), html_writer::empty_tag('img', array('src' => $url))),
                        array('class' => 'courseimage'));

            } else {
                $image = $this->output->pix_icon(file_file_icon($file, 24), $file->get_filename(), 'moodle');
                $filename = html_writer::tag('span', $image, array('class' => 'fp-icon')).
                        html_writer::tag('span', $file->get_filename(), array('class' => 'fp-filename'));
                $contentfiles .= html_writer::tag('span',
                        html_writer::link($url, $filename),
                        array('class' => 'coursefile fp-filename-icon'));
            }
        }
        $content .= $contentimages. $contentfiles;


        // display course category if necessary (for example in search results)
        if ($chelper->get_show_courses() == self::COURSECAT_SHOW_COURSES_EXPANDED_WITH_CAT) {
            if ($cat = core_course_category::get($course->category, IGNORE_MISSING)) {
                $content .= html_writer::start_tag('div', array('class' => 'coursecat'));
                $content .= get_string('category').': '.
                        html_writer::link(new moodle_url('/course/index.php', array('categoryid' => $cat->id)),
                                $cat->get_formatted_name(), array('class' => $cat->visible ? '' : 'dimmed'));
                $content .= html_writer::end_tag('div'); // .coursecat
            }
        }

        // Display custom fields.
        if ($course->has_custom_fields()) {
            $handler = core_course\customfield\course_handler::create();
            $customfields = $handler->display_custom_fields_data($course->get_custom_fields());
            $content .= \html_writer::tag('div', $customfields, ['class' => 'customfields-container']);
        }

        return $content;
    }


} // core_course_renderer_end
