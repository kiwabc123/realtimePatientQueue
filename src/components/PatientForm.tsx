'use client';

import { FormEvent, ChangeEvent, useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { fetchCountries, type Country } from '@/lib/countries';
import type { PatientFormData } from '@/types';

interface PatientFormProps {
  onSubmit: (data: PatientFormData) => void;
  onInputChange?: (data: Partial<PatientFormData>) => void;
}

export function PatientForm({ onSubmit, onInputChange }: PatientFormProps) {
  const [formData, setFormData] = useState<PatientFormData>({
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    email: '',
    address: '',
    preferredLanguage: '',
    nationality: '',
    emergencyContact: { name: '', relationship: '' },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [phonePrefix, setPhonePrefix] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');

  // Fetch countries on mount
  useEffect(() => {
    fetchCountries().then(setCountries);
  }, []);

  const validatePhoneNumber = (): boolean => {
    if (!phonePrefix) {
      setPhoneError('Phone prefix is required');
      return false;
    }
    if (!phoneDigits || phoneDigits.length < 6) {
      setPhoneError('Phone number must have at least 6 digits');
      return false;
    }
    if (phoneDigits.length > 15) {
      setPhoneError('Phone number cannot exceed 15 digits');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const formatPhoneDisplay = (digits: string): string => {
    if (!digits) return '';
    // Format as: XXX-XXX-XXXX for up to 10 digits, or XXX-XXX-XXX-XXXX for longer
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}-${digits.slice(10)}`;
  };

  const validateEmail = (): boolean => {
    if (!formData.email) {
      setEmailError('Email is required');
      return false;
    }
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    // Clear email error when user edits email
    if (name === 'email') {
      setEmailError('');
    }

    if (onInputChange) {
      onInputChange(updated);
    }
  };

  const handleNationalityChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const countryName = e.target.value;
    
    const updated = { ...formData, nationality: countryName };
    setFormData(updated);

    if (onInputChange) {
      onInputChange(updated);
    }
  };

  const handlePhonePrefixChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const prefix = e.target.value;
    setPhonePrefix(prefix);
    setPhoneError(''); // Clear error on change

    const fullPhone = prefix && phoneDigits ? `${prefix}-${phoneDigits}` : phoneDigits;
    const updated = { ...formData, phoneNumber: fullPhone };
    setFormData(updated);

    if (onInputChange) {
      onInputChange(updated);
    }
  };

  const handlePhoneDigitsChange = (e: ChangeEvent<HTMLInputElement>) => {
    let digits = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Limit to maximum 15 digits (ITU-T E.164 standard)
    if (digits.length > 15) {
      digits = digits.slice(0, 15);
    }
    
    setPhoneDigits(digits);
    setPhoneError(''); // Clear error on change

    const fullPhone = phonePrefix && digits ? `${phonePrefix}-${digits}` : digits;
    const updated = { ...formData, phoneNumber: fullPhone };
    setFormData(updated);

    if (onInputChange) {
      onInputChange(updated);
    }
  };

  const handleEmergencyContactChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updated = {
      ...formData,
      emergencyContact: {
        ...formData.emergencyContact!,
        [name]: value,
      },
    };
    setFormData(updated);

    if (onInputChange) {
      onInputChange(updated);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate email
    if (!validateEmail()) {
      await Swal.fire({
        icon: 'error',
        title: 'Invalid Email',
        text: emailError,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }
    
    // Validate phone number
    if (!validatePhoneNumber()) {
      await Swal.fire({
        icon: 'error',
        title: 'Invalid Phone Number',
        text: phoneError,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }
    
    setIsSubmitting(true);
    onSubmit(formData);
    
    // Show success toast
    await Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'Patient registration submitted successfully',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
    
    setTimeout(() => setIsSubmitting(false), 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-2xl mx-auto">
      {/* Personal Information Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Personal Information</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
              First Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John"
            />
          </div>

          {/* Middle Name */}
          <div>
            <label htmlFor="middleName" className="block text-sm font-semibold text-gray-700 mb-2">
              Middle Name
            </label>
            <input
              type="text"
              id="middleName"
              name="middleName"
              value={formData.middleName || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Michael"
            />
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
              Last Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Doe"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-700 mb-2">
              Date of Birth <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Gender */}
          <div>
            <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-2">
              Gender <span className="text-red-600">*</span>
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          {/* Nationality */}
          <div>
            <label htmlFor="nationality" className="block text-sm font-semibold text-gray-700 mb-2">
              Nationality <span className="text-red-600">*</span>
            </label>
            <select
              id="nationality"
              name="nationality"
              value={formData.nationality}
              onChange={handleNationalityChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Nationality</option>
              {countries.length > 0 ? (
                countries.map((country) => (
                  <option key={country.code} value={country.name}>
                    {country.name}
                  </option>
                ))
              ) : (
                <option disabled>Loading countries...</option>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="border-t pt-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Phone Prefix */}
          <div>
            <label htmlFor="phonePrefix" className="block text-sm font-semibold text-gray-600 mb-2">
              Phone Prefix <span className="text-red-600">*</span>
            </label>
            <select
              id="phonePrefix"
              name="phonePrefix"
              value={phonePrefix}
              onChange={handlePhonePrefixChange}
              required
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-gray-50 ${
                phoneError && !phonePrefix
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            >
              <option value="">Select Phone Prefix</option>
              {countries.length > 0 ? (
                countries.map((country) => (
                  <option key={country.code} value={country.phoneCode}>
                    {country.name} ({country.phoneCode})
                  </option>
                ))
              ) : (
                <option disabled>Loading countries...</option>
              )}
            </select>
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phoneDigits" className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number <span className="text-red-600">*</span>
            </label>
            <input
              type="tel"
              id="phoneDigits"
              value={formatPhoneDisplay(phoneDigits)}
              onChange={handlePhoneDigitsChange}
              required
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                phoneError && !phoneDigits
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="123-456-7890"
            />
            <p className={`text-xs mt-1 ${phoneError ? 'text-red-600' : 'text-gray-500'}`}>
              {phoneDigits.length ? `${phoneDigits.length} digits (minimum: 6, maximum: 15)` : 'Minimum 6 digits required'}
            </p>
          </div>
        </div>

        {/* Phone Error Message */}
        {phoneError && (
          <div className="mt-2 p-3 bg-red-100 border border-red-400 rounded-lg">
            <p className="text-sm text-red-700">
              <span className="font-semibold">❌ Error:</span> {phoneError}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                emailError
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="john@example.com"
            />
            {emailError && (
              <p className="text-xs text-red-600 mt-1">
                <span className="font-semibold">❌</span> {emailError}
              </p>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="mt-4">
          <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
            Address <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="123 Main Street, City, Country"
          />
        </div>

        {/* Preferred Language */}
        <div className="mt-4">
          <label htmlFor="preferredLanguage" className="block text-sm font-semibold text-gray-700 mb-2">
            Preferred Language <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="preferredLanguage"
            name="preferredLanguage"
            value={formData.preferredLanguage}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Thai, English"
          />
        </div>
      </div>

      {/* Emergency Contact Section */}
      <div className="border-t pt-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Emergency Contact</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Emergency Contact Name */}
          <div>
            <label htmlFor="emergencyName" className="block text-sm font-semibold text-gray-700 mb-2">
              Contact Name
            </label>
            <input
              type="text"
              id="emergencyName"
              name="name"
              value={formData.emergencyContact?.name || ''}
              onChange={handleEmergencyContactChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Jane Doe"
            />
          </div>

          {/* Emergency Contact Relationship */}
          <div>
            <label htmlFor="emergencyRelationship" className="block text-sm font-semibold text-gray-700 mb-2">
              Relationship
            </label>
            <input
              type="text"
              id="emergencyRelationship"
              name="relationship"
              value={formData.emergencyContact?.relationship || ''}
              onChange={handleEmergencyContactChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Sister, Spouse, etc."
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4 justify-center pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-8 rounded-lg transition duration-200 transform hover:scale-105 disabled:scale-100"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Registration'}
        </button>
      </div>
    </form>
  );
}
