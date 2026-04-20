import os

f = r'c:\SCL System\scl-institute\frontend\src\components\ApplicationReview.jsx'
t = open(f, 'r', encoding='utf-8').read()

# 1. Add imports
old_imports = """    Copy,
    Check,
    X
} from 'lucide-react';"""

new_imports = """    Copy,
    Check,
    X,
    Upload,
    Trash2,
    FileAudio,
    Play
} from 'lucide-react';"""

t = t.replace(old_imports, new_imports)

# 2. Add recording state variables
old_state = """    const [isEditMode, setIsEditMode] = useState(false);

    // Safe date formatter"""

new_state = """    const [isEditMode, setIsEditMode] = useState(false);

    // Interview recordings state
    const [recordings, setRecordings] = useState([]);
    const [recordingUploading, setRecordingUploading] = useState(false);
    const [recordingDate, setRecordingDate] = useState('');
    const [recordingTime, setRecordingTime] = useState('');

    // Safe date formatter"""

t = t.replace(old_state, new_state)

# 3. Add fetchRecordings to useEffect + CRUD functions
old_effect = """    useEffect(() => {
        fetchApplication();
        fetchExistingReview();
    }, [id]);"""

new_effect = """    useEffect(() => {
        fetchApplication();
        fetchExistingReview();
        fetchRecordings();
    }, [id]);

    // Interview recordings CRUD
    const fetchRecordings = async () => {
        try {
            const res = await axios.get(`${API_URL}/students/applications/${id}/interview-recordings`);
            if (res.data?.success) setRecordings(res.data.data || []);
        } catch (err) {
            console.warn('Could not load recordings:', err.message);
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const handleUploadRecording = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!recordingDate) {
            setError('Please select a recording date before uploading');
            return;
        }
        try {
            setRecordingUploading(true);
            const recordedAt = recordingTime
                ? `${recordingDate}T${recordingTime}:00`
                : `${recordingDate}T00:00:00`;
            const form = new FormData();
            form.append('recording', file);
            form.append('recorded_at', recordedAt);
            form.append('uploaded_by', review.reviewer_name || 'Reviewer');
            await axios.post(`${API_URL}/students/applications/${id}/interview-recordings`, form);
            await fetchRecordings();
            setRecordingDate('');
            setRecordingTime('');
        } catch (err) {
            setError('Failed to upload recording: ' + (err.response?.data?.message || err.message));
        } finally {
            setRecordingUploading(false);
        }
    };

    const handleDeleteRecording = async (recId) => {
        if (!window.confirm('Delete this recording?')) return;
        try {
            await axios.delete(`${API_URL}/students/applications/${id}/interview-recordings/${recId}`);
            await fetchRecordings();
        } catch (err) {
            setError('Failed to delete recording: ' + err.message);
        }
    };"""

t = t.replace(old_effect, new_effect)

# 4. Add Interview Record Files UI after Interview Outcome
old_ui = """                            {review.interview_conducted === 'Yes' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Interview Outcome</label>
                                    <select
                                        value={review.interview_outcome}
                                        onChange={(e) => handleReviewChange('interview_outcome', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select...</option>
                                        <option value="Pass">Pass</option>
                                        <option value="Fail">Fail</option>
                                    </select>
                                </div>
                            )}"""

new_ui = """                            {review.interview_conducted === 'Yes' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Interview Outcome</label>
                                    <select
                                        value={review.interview_outcome}
                                        onChange={(e) => handleReviewChange('interview_outcome', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select...</option>
                                        <option value="Pass">Pass</option>
                                        <option value="Fail">Fail</option>
                                    </select>
                                </div>
                            )}

                            {/* Interview Record Files */}
                            {review.interview_conducted === 'Yes' && (
                                <div className="border border-indigo-200 bg-indigo-50/30 rounded-xl p-4 space-y-3">
                                    <h4 className="text-sm font-semibold text-indigo-800 flex items-center gap-2">
                                        <FileAudio className="w-4 h-4" /> Interview Record Files
                                    </h4>

                                    {/* Upload controls */}
                                    <div className="flex flex-wrap items-end gap-3">
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">Recording Date *</label>
                                            <input
                                                type="date"
                                                value={recordingDate}
                                                onChange={e => setRecordingDate(e.target.value)}
                                                className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">Recording Time</label>
                                            <input
                                                type="time"
                                                value={recordingTime}
                                                onChange={e => setRecordingTime(e.target.value)}
                                                className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400"
                                            />
                                        </div>
                                        <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition ${
                                            recordingUploading
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                        }`}>
                                            {recordingUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                            {recordingUploading ? 'Uploading...' : 'Upload Recording'}
                                            <input
                                                type="file"
                                                accept="audio/*,video/mp4,video/webm"
                                                className="hidden"
                                                onChange={handleUploadRecording}
                                                disabled={recordingUploading}
                                            />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500">Accepted: MP3, WAV, OGG, AAC, M4A, MP4, WebM — max 100 MB</p>

                                    {/* Recordings list */}
                                    {recordings.length > 0 ? (
                                        <div className="space-y-2 mt-2">
                                            {recordings.map(rec => (
                                                <div key={rec.id} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3">
                                                    <div className="bg-indigo-100 rounded-lg p-2 flex-shrink-0">
                                                        <FileAudio className="w-5 h-5 text-indigo-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{rec.original_filename}</p>
                                                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                                            <span>{new Date(rec.recorded_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                            <span>{new Date(rec.recorded_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                                                            <span>{formatFileSize(rec.file_size)}</span>
                                                            {rec.uploaded_by && <span>by {rec.uploaded_by}</span>}
                                                        </div>
                                                        {rec.mime_type?.startsWith('audio/') && (
                                                            <audio controls preload="none" className="mt-2 w-full h-8" style={{ maxWidth: 400 }}>
                                                                <source src={`${API_URL.replace('/api', '')}${rec.file_path}`} type={rec.mime_type} />
                                                            </audio>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        <a
                                                            href={`${API_URL.replace('/api', '')}${rec.file_path}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 text-gray-400 hover:text-indigo-600 rounded"
                                                            title="Play / Download"
                                                        >
                                                            <Play className="w-4 h-4" />
                                                        </a>
                                                        <button
                                                            onClick={() => handleDeleteRecording(rec.id)}
                                                            className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400 italic">No interview recordings uploaded yet.</p>
                                    )}
                                </div>
                            )}"""

t = t.replace(old_ui, new_ui)

# Verify
print('Has Upload:', 'Upload,' in t)
print('Has FileAudio:', 'FileAudio' in t)
print('Has recordings state:', 'setRecordings' in t)
print('Has fetchRecordings:', 'fetchRecordings' in t)
print('Has Interview Record Files:', 'Interview Record Files' in t)
print('Lines:', t.count('\n') + 1)

open(f, 'w', encoding='utf-8').write(t)
print('File saved!')
