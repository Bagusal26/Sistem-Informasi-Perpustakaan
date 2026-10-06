import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { MemberForm } from '../../components/library/MemberForm';
import { Button } from '../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { MemberStatus } from '../../types';

export const MemberEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { members, updateMember } = useLibrary();
  const { syncUserWithMember } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const currentMember = members.find((m) => m.id === id);
  const existingEmails = members.map((m) => m.email);

  if (!currentMember) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <h2 className="text-xl font-bold text-slate-800">Anggota Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">
          Data anggota yang ingin Anda ubah tidak ditemukan dalam database perpustakaan.
        </p>
        <Link to="/admin/members">
          <Button icon={<ArrowLeft size={16} />}>Kembali ke Data Anggota</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = (data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    status: MemberStatus;
  }) => {
    const res = updateMember(currentMember.id, data);

    if (res.success) {
      syncUserWithMember(currentMember.id, { name: data.name, email: data.email });
      showToast('success', 'Data anggota berhasil diperbarui.');
      navigate('/admin/members');
      return { success: true, message: res.message };
    } else {
      showToast('error', res.message);
      return { success: false, message: res.message };
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/admin/members">
          <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />}>
            Kembali
          </Button>
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Edit Data Anggota</h2>
          <p className="text-xs text-slate-500">
            Perbarui data kontak, domisili, atau status keaktifan anggota ID{' '}
            <span className="font-mono text-slate-700 font-semibold">{currentMember.id}</span>.
          </p>
        </div>
      </div>

      {/* Reusable MemberForm */}
      <MemberForm
        initialData={currentMember}
        isEdit={true}
        existingEmails={existingEmails}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/admin/members')}
      />
    </div>
  );
};

