import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import supabase from '../config/configdb';
import { DeleteAccountModal } from '../components/Account/DeleteAccountModal';
import { DeleteAccountReason } from '../components/Account/DeleteAccountReason';
import { birthPlaces } from '../data/birthPlaces';
import { sectors } from '../data/sectors';
import { countryCodes } from '../data/countries';
import { PhoneInput } from '../components/Account/PhoneInput';
import { PersonalInfo } from '../components/Account/PersonalInfo';

interface MyAccountProps {
  username: string;
  profileImage: string;
  onBack: () => void;
  onSave: (username: string, profileImage: string) => void;
}

interface PasswordSectionProps {
  newPassword: string;
  confirmPassword: string;
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

const PasswordSection: React.FC<PasswordSectionProps> = ({
  newPassword,
  confirmPassword,
  onChange,
  errors
}) => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="space-y-4">
      <h3 className="text-white font-medium mb-4">Change Password</h3>

      {/* New Password */}
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">
          New Password
        </label>
        <div className="relative">
          <input
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => onChange("newPassword", e.target.value)}
            className={`w-full bg-zinc-900 border ${
              errors.newPassword ? "border-red-500" : "border-zinc-700"
            } rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500`}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
          >
            {showNewPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.newPassword && (
          <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => onChange("confirmPassword", e.target.value)}
            className={`w-full bg-zinc-900 border ${
              errors.confirmPassword ? "border-red-500" : "border-zinc-700"
            } rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
        )}
      </div>
    </div>
  );
};

export const MyAccount: React.FC<MyAccountProps> = ({
  onBack,
  onSave,
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteReason, setShowDeleteReason] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    username: '',
    profileImage: '',
    firstName: '',
    lastName: '',
    description: '',
    sector: '',
    birthDate: '',
    birthPlace: '',
    countryCode: '',
    phoneNumber: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) {
          navigate('/login');
          return;
        }

        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;

        const profileImageUrl = user.profile_image 
          ? user.profile_image.startsWith('data:') 
            ? user.profile_image 
            : `${user.profile_image}?${new Date().getTime()}`
          : '/default-avatar.png';

        setFormData({
          username: user.username || '',
          profileImage: profileImageUrl,
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          description: user.description || '',
          sector: user.sector || '',
          birthDate: user.birth_date || '',
          birthPlace: user.birth_place || '',
          countryCode: user.country_code || '',
          phoneNumber: user.phone_number || '',
          newPassword: '',
          confirmPassword: '',
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.newPassword || formData.confirmPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (formData.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters long';
      }
    }

    if (formData.phoneNumber && !/^\d[\d\s-]*$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      const firstErrorField = document.querySelector('[data-error="true"]');
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) throw new Error('No user session');

      const { error: updateError } = await supabase
        .from('users')
        .update({
          username: formData.username,
          first_name: formData.firstName,
          last_name: formData.lastName,
          description: formData.description,
          sector: formData.sector,
          birth_date: formData.birthDate,
          birth_place: formData.birthPlace,
          phone_number: formData.phoneNumber,
          country_code: formData.countryCode,
          profile_image: formData.profileImage,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      if (formData.newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.newPassword
        });

        if (passwordError) throw passwordError;
      }

      onSave(formData.username, formData.profileImage);
      alert('Changes saved successfully!');
    } catch (error) {
      console.error('Error updating:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to update profile'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = () => {
    setShowDeleteModal(false);
    setShowDeleteReason(true);
  };

  const handleReasonSubmit = (reason: string) => {
    console.log('Account deleted with reason:', reason);
    onBack();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, profileImage: imageUrl }));
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  if (showDeleteReason) {
    return <DeleteAccountReason onBack={() => setShowDeleteReason(false)} onConfirm={handleReasonSubmit} />;
  }

  const isFormValid = Object.keys(errors).length === 0;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-zinc-900 rounded-lg shadow-xl border border-zinc-800">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-800">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-orange-500"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-white">My Account</h1>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                Delete Account
              </button>
              <button
                onClick={handleSave}
                disabled={!isFormValid || isLoading}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isFormValid && !isLoading
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-[300px,1fr] gap-8">
              {/* Left Column - Profile Image */}
              <div className="space-y-6">
                <div className="text-center">
                  <div className="relative inline-block">
                    <img
                      src={formData.profileImage}
                      alt="Profile"
                      className="w-40 h-40 rounded-full object-cover border-4 border-zinc-800"
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      className="absolute bottom-2 right-2 p-2 bg-orange-500 rounded-full text-white hover:bg-orange-600 transition-colors"
                      onClick={triggerImageUpload}
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Password Section */}
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <PasswordSection
                    newPassword={formData.newPassword}
                    confirmPassword={formData.confirmPassword}
                    onChange={handleChange}
                    errors={errors}
                  />
                </div>
              </div>

              {/* Right Column - Personal Information */}
              <div className="space-y-8">
                {/* Personal Info */}
                <div className="bg-zinc-800/50 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-white mb-6">Personal Information</h2>
                  <PersonalInfo
                    formData={formData}
                    onChange={handleChange}
                    errors={errors}
                  />
                </div>

                {/* Contact Info */}
                <div className="bg-zinc-800/50 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-white mb-6">Contact Information</h2>
                  <PhoneInput
                    countryCode={formData.countryCode}
                    phoneNumber={formData.phoneNumber}
                    onChange={handleChange}
                    error={errors.phoneNumber}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteAccountModal
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};