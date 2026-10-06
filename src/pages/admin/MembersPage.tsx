import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SearchInput } from '../../components/ui/SearchInput';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import {
  UserPlus,
  Edit,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Member, MemberStatus } from '../../types';

export const MembersPage: React.FC = () => {
  const { members, updateMemberStatus } = useLibrary();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [targetMember, setTargetMember] = useState<Member | null>(null);

  // Perhitungan statistik ringkas
  const totalMembers = members.length;
  const activeMembersCount = members.filter((m) => m.status === 'Aktif').length;
  const inactiveMembersCount = members.filter((m) => m.status === 'Tidak Aktif').length;

  // Realtime search berdasarkan nama, email, atau ID anggota
  const filteredMembers = members.filter((member) => {
    const query = search.toLowerCase().trim();
    const matchesSearch =
      member.name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query) ||
      member.id.toLowerCase().includes(query) ||
      member.phone.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === 'all' || member.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenToggleModal = (member: Member) => {
    setTargetMember(member);
    setConfirmModalOpen(true);
  };

  const handleConfirmToggle = () => {
    if (!targetMember) return;
    const nextStatus: MemberStatus =
      targetMember.status === 'Aktif' ? 'Tidak Aktif' : 'Aktif';

    const res = updateMemberStatus(targetMember.id, nextStatus);
    if (res.success) {
      showToast('success', res.message);
    } else {
      showToast('error', res.message);
    }
    setConfirmModalOpen(false);
    setTargetMember(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Data Anggota</h2>
          <p className="text-xs text-slate-500 mt-0.5">Kelola data anggota perpustakaan.</p>
        </div>
        <Link to="/admin/members/create">
          <Button icon={<UserPlus size={16} />}>Tambah Anggota</Button>
        </Link>
      </div>

      {/* 2. Filter & Pencarian Anggota */}
      <Card noPadding className="p-4 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              placeholder="Cari nama, email, atau ID anggota..."
            />
          </div>
          <div className="w-full md:w-52">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">Semua Status ({totalMembers})</option>
              <option value="Aktif">Aktif ({activeMembersCount})</option>
              <option value="Tidak Aktif">Tidak Aktif ({inactiveMembersCount})</option>
            </select>
          </div>
        </div>

        {/* Informasi Jumlah & Ringkasan */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Users size={13} className="text-slate-400" />
            <span>
              Menampilkan <span className="font-semibold text-slate-800">{filteredMembers.length}</span> dari total{' '}
              <span className="font-semibold text-slate-800">{totalMembers}</span> anggota
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-100">
              <CheckCircle2 size={11} /> {activeMembersCount} Aktif
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200">
              <XCircle size={11} /> {inactiveMembersCount} Tidak Aktif
            </span>
          </div>
        </div>
      </Card>

      {/* 3. Daftar Data Anggota (Desktop Table & Mobile Cards) */}
      <Card noPadding className="border border-slate-200/90 shadow-sm overflow-hidden">
        {filteredMembers.length === 0 ? (
          <EmptyState
            type="search"
            title="Anggota Tidak Ditemukan"
            description="Tidak ada data anggota perpustakaan yang cocok dengan kriteria pencarian Anda."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                }}
              >
                Reset Pencarian
              </Button>
            }
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th scope="col" className="py-3.5 px-4">
                      ID Anggota
                    </th>
                    <th scope="col" className="py-3.5 px-4">
                      Nama
                    </th>
                    <th scope="col" className="py-3.5 px-4">
                      Email
                    </th>
                    <th scope="col" className="py-3.5 px-4">
                      No. Telepon
                    </th>
                    <th scope="col" className="py-3.5 px-4">
                      Alamat
                    </th>
                    <th scope="col" className="py-3.5 px-4">
                      Tanggal Daftar
                    </th>
                    <th scope="col" className="py-3.5 px-4 text-center">
                      Status
                    </th>
                    <th scope="col" className="py-3.5 px-4 text-right">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* ID Anggota */}
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        {member.id}
                      </td>

                      {/* Nama */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold text-xs flex items-center justify-center shrink-0">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-900 text-sm leading-snug">
                            {member.name}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4 font-mono text-slate-600">{member.email}</td>

                      {/* No. Telepon */}
                      <td className="py-3 px-4 text-slate-700">{member.phone}</td>

                      {/* Alamat */}
                      <td className="py-3 px-4 max-w-xs truncate text-slate-600" title={member.address}>
                        {member.address}
                      </td>

                      {/* Tanggal Daftar */}
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{member.registeredAt}</td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <Badge variant={member.status} size="sm" dot>
                          {member.status}
                        </Badge>
                      </td>

                      {/* Aksi: Edit & Nonaktifkan/Aktifkan */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link to={`/admin/members/edit/${member.id}`}>
                            <button
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Edit Data Anggota"
                              aria-label={`Edit ${member.name}`}
                            >
                              <Edit size={15} />
                            </button>
                          </Link>

                          {member.status === 'Aktif' ? (
                            <button
                              onClick={() => handleOpenToggleModal(member)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Nonaktifkan Anggota"
                              aria-label={`Nonaktifkan ${member.name}`}
                            >
                              <UserX size={15} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenToggleModal(member)}
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Aktifkan Anggota"
                              aria-label={`Aktifkan ${member.name}`}
                            >
                              <UserCheck size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Responsive Cards View */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredMembers.map((member) => (
                <div key={member.id} className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
                  {/* Top Bar: Nama & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold text-xs flex items-center justify-center shrink-0">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 text-sm truncate">
                          {member.name}
                        </h3>
                        <p className="font-mono text-xs text-slate-500 mt-0.5">
                          {member.id}
                        </p>
                      </div>
                    </div>
                    <Badge variant={member.status} size="sm" dot>
                      {member.status}
                    </Badge>
                  </div>

                  {/* Details List */}
                  <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Mail size={13} className="text-slate-400 shrink-0" />
                      <span className="font-mono truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Phone size={13} className="text-slate-400 shrink-0" />
                      <span>{member.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar size={13} className="text-slate-400 shrink-0" />
                      <span>Terdaftar: {member.registeredAt}</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-600">
                      <MapPin size={13} className="text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{member.address}</span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <Link to={`/admin/members/edit/${member.id}`} className="flex-1 sm:flex-none">
                      <Button variant="outline" size="sm" icon={<Edit size={14} />} className="w-full">
                        Edit
                      </Button>
                    </Link>

                    {member.status === 'Aktif' ? (
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<UserX size={14} />}
                        onClick={() => handleOpenToggleModal(member)}
                        className="flex-1 sm:flex-none"
                      >
                        Nonaktifkan
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<UserCheck size={14} />}
                        onClick={() => handleOpenToggleModal(member)}
                        className="flex-1 sm:flex-none"
                      >
                        Aktifkan
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Confirmation Modal untuk Nonaktifkan / Aktifkan Anggota */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title={
          targetMember?.status === 'Aktif'
            ? 'Nonaktifkan anggota ini?'
            : 'Aktifkan anggota ini?'
        }
        description={
          targetMember?.status === 'Aktif'
            ? 'Anggota yang tidak aktif tidak dapat melakukan peminjaman baru, tetapi riwayat transaksi tetap tersimpan.'
            : 'Anggota yang diaktifkan dapat kembali melakukan peminjaman buku perpustakaan.'
        }
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setConfirmModalOpen(false)}>
              Batal
            </Button>
            <Button
              variant={targetMember?.status === 'Aktif' ? 'danger' : 'primary'}
              size="sm"
              onClick={handleConfirmToggle}
            >
              {targetMember?.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs text-slate-600">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 text-sm">{targetMember?.name}</span>
              <span className="font-mono text-slate-700 font-semibold px-2 py-0.5 rounded bg-white border border-slate-200">
                {targetMember?.id}
              </span>
            </div>
            <p className="text-slate-500">{targetMember?.email}</p>
          </div>
          {targetMember?.status === 'Aktif' ? (
            <p className="text-slate-500 leading-relaxed">
              Akun anggota akan dibekukan sementara. Anggota tidak akan diizinkan mengajukan peminjaman buku baru sampai akun diaktifkan kembali.
            </p>
          ) : (
            <p className="text-slate-500 leading-relaxed">
              Akun anggota akan kembali berstatus <span className="font-semibold text-emerald-700">Aktif</span> dan dapat meminjam buku seperti biasa.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};

