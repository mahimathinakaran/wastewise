import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../lib/api';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Lock, 
  Loader2,
  CheckCircle2,
  Shield,
  Calendar
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function UserProfile() {
  const { user, setUser } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Validation errors
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  // Validate profile form
  const validateProfileForm = () => {
    const errors = {};
    
    if (!profileForm.name.trim()) {
      errors.name = 'Name is required';
    } else if (profileForm.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!profileForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
      errors.email = 'Please enter a valid email';
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate password form
  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordForm.current_password) {
      errors.current_password = 'Current password is required';
    }

    if (!passwordForm.new_password) {
      errors.new_password = 'New password is required';
    } else if (passwordForm.new_password.length < 6) {
      errors.new_password = 'Password must be at least 6 characters';
    }

    if (!passwordForm.confirm_password) {
      errors.confirm_password = 'Please confirm your password';
    } else if (passwordForm.new_password !== passwordForm.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }

    setIsLoadingProfile(true);
    try {
      const response = await userAPI.updateProfile({
        name: profileForm.name,
        email: profileForm.email,
      });

      // Update user in context
      setUser(response.user);
      
      // Update token if email changed
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
      }

      toast.success('Profile updated successfully');
      setIsEditingProfile(false);
      setProfileErrors({});
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to update profile';
      toast.error(message);
      
      if (message.includes('Email already in use')) {
        setProfileErrors({ email: 'This email is already in use' });
      }
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Handle password update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setIsLoadingPassword(true);
    try {
      await userAPI.updatePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });

      toast.success('Password updated successfully');
      setIsEditingPassword(false);
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setPasswordErrors({});
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to update password';
      toast.error(message);
      
      if (message.includes('Current password is incorrect')) {
        setPasswordErrors({ current_password: 'Current password is incorrect' });
      }
    } finally {
      setIsLoadingPassword(false);
    }
  };

  // Cancel profile edit
  const handleCancelProfileEdit = () => {
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
    });
    setProfileErrors({});
    setIsEditingProfile(false);
  };

  // Cancel password edit
  const handleCancelPasswordEdit = () => {
    setPasswordForm({
      current_password: '',
      new_password: '',
      confirm_password: '',
    });
    setPasswordErrors({});
    setIsEditingPassword(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Profile Settings</h1>
            <p className="text-muted-foreground">
              Manage your account information and security settings
            </p>
          </div>

          <div className="space-y-6">
            {/* Profile Information Card */}
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-4xl font-bold text-green-600">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-white">
                    <h2 className="text-2xl font-bold">{user?.name}</h2>
                    <p className="text-green-100">{user?.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm capitalize">{user?.role} Account</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <form onSubmit={handleProfileUpdate}>
                  <div className="space-y-4">
                    {/* Name Field */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>Full Name</span>
                        </div>
                      </label>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => {
                            setProfileForm({ ...profileForm, name: e.target.value });
                            setProfileErrors({ ...profileErrors, name: '' });
                          }}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-background ${
                            profileErrors.name ? 'border-red-500' : ''
                          }`}
                          placeholder="Enter your name"
                        />
                      ) : (
                        <p className="text-lg px-4 py-2 bg-muted rounded-lg">{user?.name}</p>
                      )}
                      {profileErrors.name && (
                        <p className="text-sm text-red-500 mt-1">{profileErrors.name}</p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>Email Address</span>
                        </div>
                      </label>
                      {isEditingProfile ? (
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => {
                            setProfileForm({ ...profileForm, email: e.target.value });
                            setProfileErrors({ ...profileErrors, email: '' });
                          }}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-background ${
                            profileErrors.email ? 'border-red-500' : ''
                          }`}
                          placeholder="Enter your email"
                        />
                      ) : (
                        <p className="text-lg px-4 py-2 bg-muted rounded-lg">{user?.email}</p>
                      )}
                      {profileErrors.email && (
                        <p className="text-sm text-red-500 mt-1">{profileErrors.email}</p>
                      )}
                    </div>

                    {/* Role Field (Read-only) */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-muted-foreground" />
                          <span>Account Role</span>
                        </div>
                      </label>
                      <p className="text-lg px-4 py-2 bg-muted rounded-lg capitalize">
                        {user?.role}
                      </p>
                    </div>

                    {/* Member Since */}
                    {user?.created_at && (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>Member Since</span>
                          </div>
                        </label>
                        <p className="text-lg px-4 py-2 bg-muted rounded-lg">
                          {formatDate(user.created_at)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex items-center space-x-3">
                    {isEditingProfile ? (
                      <>
                        <Button
                          type="submit"
                          disabled={isLoadingProfile}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isLoadingProfile ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancelProfileEdit}
                          disabled={isLoadingProfile}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => setIsEditingProfile(true)}
                        variant="outline"
                      >
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Change Password Card */}
            <div className="bg-card border rounded-xl shadow-sm p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-1">Change Password</h3>
                <p className="text-sm text-muted-foreground">
                  Update your password to keep your account secure
                </p>
              </div>

              {isEditingPassword ? (
                <form onSubmit={handlePasswordUpdate}>
                  <div className="space-y-4">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.current_password}
                        onChange={(e) => {
                          setPasswordForm({ ...passwordForm, current_password: e.target.value });
                          setPasswordErrors({ ...passwordErrors, current_password: '' });
                        }}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-background ${
                          passwordErrors.current_password ? 'border-red-500' : ''
                        }`}
                        placeholder="Enter current password"
                      />
                      {passwordErrors.current_password && (
                        <p className="text-sm text-red-500 mt-1">{passwordErrors.current_password}</p>
                      )}
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.new_password}
                        onChange={(e) => {
                          setPasswordForm({ ...passwordForm, new_password: e.target.value });
                          setPasswordErrors({ ...passwordErrors, new_password: '' });
                        }}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-background ${
                          passwordErrors.new_password ? 'border-red-500' : ''
                        }`}
                        placeholder="Enter new password (min 6 characters)"
                      />
                      {passwordErrors.new_password && (
                        <p className="text-sm text-red-500 mt-1">{passwordErrors.new_password}</p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.confirm_password}
                        onChange={(e) => {
                          setPasswordForm({ ...passwordForm, confirm_password: e.target.value });
                          setPasswordErrors({ ...passwordErrors, confirm_password: '' });
                        }}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-background ${
                          passwordErrors.confirm_password ? 'border-red-500' : ''
                        }`}
                        placeholder="Confirm new password"
                      />
                      {passwordErrors.confirm_password && (
                        <p className="text-sm text-red-500 mt-1">{passwordErrors.confirm_password}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center space-x-3">
                    <Button
                      type="submit"
                      disabled={isLoadingPassword}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isLoadingPassword ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Update Password
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelPasswordEdit}
                      disabled={isLoadingPassword}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <Button
                  onClick={() => setIsEditingPassword(true)}
                  variant="outline"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}