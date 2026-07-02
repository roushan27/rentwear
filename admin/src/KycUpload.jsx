import { useEffect, useState } from 'react';
import { CheckCircle2, FileText, Upload } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const statusInfo = {
  pending: {
    label: 'Pending Review',
    color: 'bg-gold/15 text-gold',
    message: 'Your document is under review. This usually takes a few hours.',
  },
  verified: {
    label: 'Verified',
    color: 'bg-emerald/15 text-emerald',
    message: 'Your identity is verified. You can now rent any product.',
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-wine/15 text-wine',
    message: 'Your document was rejected. Please upload a clearer copy.',
  },
};

export default function KycUpload() {
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchStatus = async () => {
    const res = await api.get('/kyc/status');
    setStatus(res.data);
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    setError('');
    setSuccess('');

    if (selected.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(selected));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select a file first');

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('idProof', file);

    try {
      await api.post('/kyc/upload', formData);
      setSuccess('Document uploaded successfully. Waiting for admin approval.');
      setFile(null);
      setPreviewUrl(null);
      fetchStatus();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (!status) return <p className="max-w-2xl mx-auto px-6 py-12 text-muted">Loading...</p>;

  const info = statusInfo[status.kycStatus] || statusInfo.pending;
  const hasDocument = !!status.idProofUrl;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl mb-1">Identity verification</h1>
      <p className="text-muted mb-8">Verify your identity to unlock checkout on RentWear.</p>

      <div className="bg-white border border-ink/10 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium">Current status</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${info.color}`}>
            {info.label}
          </span>
        </div>
        <p className="text-muted text-sm">
          {hasDocument ? info.message : "You haven't uploaded a document yet."}
        </p>
      </div>

      {status.kycStatus !== 'verified' && (
        <form onSubmit={handleUpload} className="bg-white border border-ink/10 rounded-2xl p-6 space-y-4">
          <h3 className="font-display text-lg">Upload ID proof</h3>

          <label className="block">
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                file ? 'border-emerald bg-emerald/5' : 'border-ink/15 hover:border-emerald'
              }`}
            >
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />

              {file ? (
                <div className="flex flex-col items-center gap-3">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Selected preview"
                      className="w-28 h-28 object-cover rounded-lg border border-ink/10"
                    />
                  ) : (
                    <FileText size={40} className="text-emerald" />
                  )}
                  <div className="flex items-center gap-2 text-sm text-emerald font-medium">
                    <CheckCircle2 size={16} />
                    {file.name} selected
                  </div>
                  <p className="text-xs text-muted">Click to choose a different file</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload size={32} className="text-muted" />
                  <p className="text-sm text-muted">Click to select a file</p>
                  <p className="text-xs text-muted/70">JPG, PNG or PDF, up to 5MB</p>
                </div>
              )}
            </div>
          </label>

          {error && <p className="text-wine text-sm">{error}</p>}
          {success && <p className="text-emerald text-sm">{success}</p>}

          <button
            type="submit"
            disabled={uploading || !file}
            className="w-full bg-emerald text-paper py-3 rounded-xl hover:bg-emerald-light transition disabled:opacity-40"
          >
            {uploading ? 'Uploading...' : 'Submit document'}
          </button>
        </form>
      )}
    </div>
  );
}