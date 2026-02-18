import { useState } from 'react'
import { User, Mail, FileText, Lock, Trash2, Shield, Camera } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { userService, authService } from '../services'
import { Input, Textarea, Button, Avatar, Modal } from '../components/ui'
import { extractError, formatDate } from '../utils'
import DashboardLayout from '../components/layout/DashboardLayout'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const validateProfile = (f) => {
  const e = {}
  if (f.name && f.name.trim().length < 2) e.name = 'Minimum 2 characters'
  if (f.avatar && f.avatar && !/^https?:\/\/.+/.test(f.avatar)) e.avatar = 'Must be a valid URL'
  if (f.bio && f.bio.length > 300) e.bio = 'Max 300 characters'
  return e
}

const validatePassword = (f) => {
  const e = {}
  if (!f.currentPassword) e.currentPassword = 'Required'
  if (!f.newPassword) e.newPassword = 'Required'
  else if (f.newPassword.length < 8) e.newPassword = 'Minimum 8 characters'
  else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(f.newPassword))
    e.newPassword = 'Must include uppercase, lowercase, and a number'
  if (f.newPassword !== f.newPasswordConfirm) e.newPasswordConfirm = 'Passwords do not match'
  return e
}

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  })
  const [profileErrors, setProfileErrors] = useState({})
  const [profileLoading, setProfileLoading] = useState(false)

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', newPasswordConfirm: '' })
  const [pwErrors, setPwErrors] = useState({})
  const [pwLoading, setPwLoading] = useState(false)

  const [deleteModal, setDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const changeProfile = (e) => {
    setProfileForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    if (profileErrors[e.target.name]) setProfileErrors((er) => ({ ...er, [e.target.name]: '' }))
  }

  const changePw = (e) => {
    setPwForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    if (pwErrors[e.target.name]) setPwErrors((er) => ({ ...er, [e.target.name]: '' }))
  }

  const saveProfile = async (e) => {
    e.preventDefault()
    const errs = validateProfile(profileForm)
    if (Object.keys(errs).length) { setProfileErrors(errs); return }

    setProfileLoading(true)
    try {
      const payload = {}
      if (profileForm.name !== user.name) payload.name = profileForm.name
      if (profileForm.bio !== (user.bio || '')) payload.bio = profileForm.bio
      if (profileForm.avatar !== (user.avatar || '')) payload.avatar = profileForm.avatar

      if (Object.keys(payload).length === 0) {
        toast('No changes to save', { icon: 'ℹ️' })
        return
      }

      const { data } = await userService.updateMe(payload)
      updateUser(data.data.user)
      toast.success('Profile updated')
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setProfileLoading(false)
    }
  }

  const savePassword = async (e) => {
    e.preventDefault()
    const errs = validatePassword(pwForm)
    if (Object.keys(errs).length) { setPwErrors(errs); return }

    setPwLoading(true)
    try {
      await authService.changePassword(pwForm)
      toast.success('Password changed successfully')
      setPwForm({ currentPassword: '', newPassword: '', newPasswordConfirm: '' })
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setPwLoading(false)
    }
  }

  const deleteAccount = async () => {
    setDeleteLoading(true)
    try {
      await userService.deleteMe()
      await logout()
      navigate('/login')
      toast.success('Account deleted')
    } catch (err) {
      toast.error(extractError(err))
      setDeleteLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        {/* Header */}
        <div className="mb-8 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
          <h1 className="font-display font-700 text-2xl text-bright mb-1">Profile</h1>
          <p className="text-muted text-sm">Manage your account details and security settings.</p>
        </div>

        {/* Profile card */}
        <div className="card mb-5 animate-fade-up " style={{ animationDelay: '75ms', animationFillMode: 'forwards' }}>
          <div className="flex items-center gap-4 p-5 border-b border-border">
            <div className="relative">
              <Avatar name={user?.name} src={user?.avatar} size="xl" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-surface-700 border border-border flex items-center justify-center">
                <Camera size={11} className="text-muted" />
              </div>
            </div>
            <div>
              <h2 className="font-display font-700 text-bright text-lg">{user?.name}</h2>
              <p className="text-muted text-sm font-mono">{user?.email}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-acid/10 text-acid border border-acid/20 text-xs font-mono">
                  <Shield size={9} /> {user?.role}
                </span>
                {user?.createdAt && (
                  <span className="text-xs text-muted font-mono">
                    Joined {formatDate(user.createdAt)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={saveProfile} className="p-5 space-y-4" noValidate>
            <Input
              label="Display name"
              name="name"
              icon={User}
              value={profileForm.name}
              onChange={changeProfile}
              error={profileErrors.name}
              placeholder="Your name"
            />
            <Input
              label="Avatar URL"
              name="avatar"
              icon={Camera}
              value={profileForm.avatar}
              onChange={changeProfile}
              error={profileErrors.avatar}
              placeholder="https://example.com/avatar.jpg"
            />
            <Textarea
              label="Bio"
              name="bio"
              value={profileForm.bio}
              onChange={changeProfile}
              error={profileErrors.bio}
              placeholder="Tell us about yourself..."
            />
            <div className="flex justify-between items-center pt-1">
              <span className="text-xs text-muted font-mono">{profileForm.bio.length}/300</span>
              <Button type="submit" loading={profileLoading}>
                Save profile
              </Button>
            </div>
          </form>
        </div>

        {/* Email section */}
        <div className="card mb-5 animate-fade-up " style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}>
          <div className="p-5 border-b border-border">
            <h3 className="font-display font-600 text-bright text-sm flex items-center gap-2">
              <Mail size={14} className="text-muted" /> Email address
            </h3>
          </div>
          <div className="p-5">
            <Input
              label="Email"
              type="email"
              value={user?.email || ''}
              disabled
              className="opacity-60 cursor-not-allowed"
            />
            <p className="text-xs text-muted mt-2">Email address cannot be changed through the UI.</p>
          </div>
        </div>

        {/* Change password */}
        <div className="card mb-5 animate-fade-up " style={{ animationDelay: '225ms', animationFillMode: 'forwards' }}>
          <div className="p-5 border-b border-border">
            <h3 className="font-display font-600 text-bright text-sm flex items-center gap-2">
              <Lock size={14} className="text-muted" /> Change password
            </h3>
          </div>
          <form onSubmit={savePassword} className="p-5 space-y-4" noValidate>
            <Input
              label="Current password"
              name="currentPassword"
              type="password"
              icon={Lock}
              value={pwForm.currentPassword}
              onChange={changePw}
              error={pwErrors.currentPassword}
              placeholder="Your current password"
              autoComplete="current-password"
            />
            <Input
              label="New password"
              name="newPassword"
              type="password"
              icon={Lock}
              value={pwForm.newPassword}
              onChange={changePw}
              error={pwErrors.newPassword}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
            />
            <Input
              label="Confirm new password"
              name="newPasswordConfirm"
              type="password"
              icon={Lock}
              value={pwForm.newPasswordConfirm}
              onChange={changePw}
              error={pwErrors.newPasswordConfirm}
              placeholder="Repeat new password"
              autoComplete="new-password"
            />
            <div className="flex justify-end pt-1">
              <Button type="submit" loading={pwLoading}>
                Update password
              </Button>
            </div>
          </form>
        </div>

        {/* Danger zone */}
        <div className="card border-red-500/20 animate-fade-up " style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
          <div className="p-5 border-b border-red-500/20">
            <h3 className="font-display font-600 text-red-400 text-sm flex items-center gap-2">
              <Trash2 size={14} /> Danger zone
            </h3>
          </div>
          <div className="p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-bright font-500 mb-0.5">Delete account</p>
              <p className="text-xs text-muted">This will deactivate your account. This action is permanent.</p>
            </div>
            <Button variant="danger" onClick={() => setDeleteModal(true)} className="shrink-0">
              <Trash2 size={13} /> Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Delete confirm modal */}
      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="Delete account" size="sm">
        <p className="text-sm text-muted mb-5">
          Are you sure? Your account and all associated data will be permanently deactivated.
          This action <strong className="text-bright">cannot</strong> be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setDeleteModal(false)} className="flex-1">Cancel</Button>
          <Button variant="danger" onClick={deleteAccount} loading={deleteLoading} className="flex-1">
            Yes, delete my account
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
